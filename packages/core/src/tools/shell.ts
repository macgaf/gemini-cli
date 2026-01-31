/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import os, { EOL } from 'node:os';
import crypto from 'node:crypto';
import type { Config } from '../config/config.js';
import { debugLogger } from '../index.js';
import { ToolErrorType } from './tool-error.js';
import type {
  ToolInvocation,
  ToolResult,
  ToolCallConfirmationDetails,
  ToolExecuteConfirmationDetails,
} from './tools.js';
import {
  BaseDeclarativeTool,
  BaseToolInvocation,
  ToolConfirmationOutcome,
  Kind,
  type PolicyUpdateOptions,
} from './tools.js';

import { getErrorMessage } from '../utils/errors.js';
import { summarizeToolOutput } from '../utils/summarizer.js';
import type {
  ShellExecutionConfig,
  ShellOutputEvent,
} from '../services/shellExecutionService.js';
import { ShellExecutionService } from '../services/shellExecutionService.js';
import { formatMemoryUsage } from '../utils/formatters.js';
import type { AnsiOutput } from '../utils/terminalSerializer.js';
import {
  getCommandRoots,
  initializeShellParsers,
  stripShellWrapper,
  parseCommandDetails,
  hasRedirection,
} from '../utils/shell-utils.js';
import { SHELL_TOOL_NAME } from './tool-names.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import { t } from '../i18n/index.js';

export const OUTPUT_UPDATE_INTERVAL_MS = 1000;

export interface ShellToolParams {
  command: string;
  description?: string;
  dir_path?: string;
}

export class ShellToolInvocation extends BaseToolInvocation<
  ShellToolParams,
  ToolResult
> {
  constructor(
    private readonly config: Config,
    params: ShellToolParams,
    messageBus: MessageBus,
    _toolName?: string,
    _toolDisplayName?: string,
  ) {
    super(params, messageBus, _toolName, _toolDisplayName);
  }

  getDescription(): string {
    let description = `${this.params.command}`;
    // append optional [in directory]
    // note description is needed even if validation fails due to absolute path
    if (this.params.dir_path) {
      description += t(' [in {{dir}}]', { dir: this.params.dir_path });
    } else {
      description += t(' [current working directory {{cwd}}]', {
        cwd: process.cwd(),
      });
    }
    // append optional (description), replacing any line breaks with spaces
    if (this.params.description) {
      description += t(' ({{description}})', {
        description: this.params.description.replace(/\n/g, ' '),
      });
    }
    return description;
  }

  protected override getPolicyUpdateOptions(
    outcome: ToolConfirmationOutcome,
  ): PolicyUpdateOptions | undefined {
    if (
      outcome === ToolConfirmationOutcome.ProceedAlwaysAndSave ||
      outcome === ToolConfirmationOutcome.ProceedAlways
    ) {
      const command = stripShellWrapper(this.params.command);
      const rootCommands = [...new Set(getCommandRoots(command))];
      if (rootCommands.length > 0) {
        return { commandPrefix: rootCommands };
      }
      return { commandPrefix: this.params.command };
    }
    return undefined;
  }

  protected override async getConfirmationDetails(
    _abortSignal: AbortSignal,
  ): Promise<ToolCallConfirmationDetails | false> {
    const command = stripShellWrapper(this.params.command);

    const parsed = parseCommandDetails(command);
    let rootCommandDisplay = '';

    if (!parsed || parsed.hasError || parsed.details.length === 0) {
      // Fallback if parser fails
      const fallback = command.trim().split(/\s+/)[0];
      rootCommandDisplay = fallback || t('shell command');
      if (hasRedirection(command)) {
        rootCommandDisplay += t(', redirection');
      }
    } else {
      rootCommandDisplay = parsed.details
        .map((detail) => detail.name)
        .join(', ');
    }

    const rootCommands = [...new Set(getCommandRoots(command))];

    // Rely entirely on PolicyEngine for interactive confirmation.
    // If we are here, it means PolicyEngine returned ASK_USER (or no message bus),
    // so we must provide confirmation details.
    const confirmationDetails: ToolExecuteConfirmationDetails = {
      type: 'exec',
      title: t('Confirm Shell Command'),
      command: this.params.command,
      rootCommand: rootCommandDisplay,
      rootCommands,
      onConfirm: async (outcome: ToolConfirmationOutcome) => {
        await this.publishPolicyUpdate(outcome);
      },
    };
    return confirmationDetails;
  }

  async execute(
    signal: AbortSignal,
    updateOutput?: (output: string | AnsiOutput) => void,
    shellExecutionConfig?: ShellExecutionConfig,
    setPidCallback?: (pid: number) => void,
  ): Promise<ToolResult> {
    const strippedCommand = stripShellWrapper(this.params.command);

    if (signal.aborted) {
      return {
        llmContent: t('Command was cancelled by user before it could start.'),
        returnDisplay: t('Command cancelled by user.'),
      };
    }

    const isWindows = os.platform() === 'win32';
    const tempFileName = `shell_pgrep_${crypto
      .randomBytes(6)
      .toString('hex')}.tmp`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);

    const timeoutMs = this.config.getShellToolInactivityTimeout();
    const timeoutController = new AbortController();
    let timeoutTimer: NodeJS.Timeout | undefined;

    // Handle signal combination manually to avoid TS issues or runtime missing features
    const combinedController = new AbortController();

    const onAbort = () => combinedController.abort();

    try {
      // pgrep is not available on Windows, so we can't get background PIDs
      const commandToExecute = isWindows
        ? strippedCommand
        : (() => {
            // wrap command to append subprocess pids (via pgrep) to temporary file
            let command = strippedCommand.trim();
            if (!command.endsWith('&')) command += ';';
            return `{ ${command} }; __code=$?; pgrep -g 0 >${tempFilePath} 2>&1; exit $__code;`;
          })();

      const cwd = this.params.dir_path
        ? path.resolve(this.config.getTargetDir(), this.params.dir_path)
        : this.config.getTargetDir();

      let cumulativeOutput: string | AnsiOutput = '';
      let lastUpdateTime = Date.now();
      let isBinaryStream = false;

      const resetTimeout = () => {
        if (timeoutMs <= 0) {
          return;
        }
        if (timeoutTimer) clearTimeout(timeoutTimer);
        timeoutTimer = setTimeout(() => {
          timeoutController.abort();
        }, timeoutMs);
      };

      signal.addEventListener('abort', onAbort, { once: true });
      timeoutController.signal.addEventListener('abort', onAbort, {
        once: true,
      });

      // Start timeout
      resetTimeout();

      const { result: resultPromise, pid } =
        await ShellExecutionService.execute(
          commandToExecute,
          cwd,
          (event: ShellOutputEvent) => {
            resetTimeout(); // Reset timeout on any event
            if (!updateOutput) {
              return;
            }

            let shouldUpdate = false;

            switch (event.type) {
              case 'data':
                if (isBinaryStream) break;
                cumulativeOutput = event.chunk;
                shouldUpdate = true;
                break;
              case 'binary_detected':
                isBinaryStream = true;
                cumulativeOutput = t(
                  '[Binary output detected. Halting stream...]',
                );
                shouldUpdate = true;
                break;
              case 'binary_progress':
                isBinaryStream = true;
                cumulativeOutput = t(
                  '[Receiving binary output... {{size}} received]',
                  { size: formatMemoryUsage(event.bytesReceived) },
                );
                if (Date.now() - lastUpdateTime > OUTPUT_UPDATE_INTERVAL_MS) {
                  shouldUpdate = true;
                }
                break;
              default: {
                throw new Error(t('An unhandled ShellOutputEvent was found.'));
              }
            }

            if (shouldUpdate) {
              updateOutput(cumulativeOutput);
              lastUpdateTime = Date.now();
            }
          },
          combinedController.signal,
          this.config.getEnableInteractiveShell(),
          {
            ...shellExecutionConfig,
            pager: 'cat',
            sanitizationConfig:
              shellExecutionConfig?.sanitizationConfig ??
              this.config.sanitizationConfig,
          },
        );

      if (pid && setPidCallback) {
        setPidCallback(pid);
      }

      const result = await resultPromise;

      const backgroundPIDs: number[] = [];
      if (os.platform() !== 'win32') {
        if (fs.existsSync(tempFilePath)) {
          const pgrepLines = fs
            .readFileSync(tempFilePath, 'utf8')
            .split(EOL)
            .filter(Boolean);
          for (const line of pgrepLines) {
            if (!/^\d+$/.test(line)) {
              debugLogger.error(`pgrep: ${line}`);
            }
            const pid = Number(line);
            if (pid !== result.pid) {
              backgroundPIDs.push(pid);
            }
          }
        } else {
          if (!signal.aborted) {
            debugLogger.error('missing pgrep output');
          }
        }
      }

      let llmContent = '';
      let timeoutMessage = '';
      if (result.aborted) {
        if (timeoutController.signal.aborted) {
          timeoutMessage = t(
            'Command was automatically cancelled because it exceeded the timeout of {{minutes}} minutes without output.',
            { minutes: (timeoutMs / 60000).toFixed(1) },
          );
          llmContent = timeoutMessage;
        } else {
          llmContent = t(
            'Command was cancelled by user before it could complete.',
          );
        }
        if (result.output.trim()) {
          llmContent += t(
            ' Below is the output before it was cancelled:\n{{output}}',
            { output: result.output },
          );
        } else {
          llmContent += t(' There was no output before it was cancelled.');
        }
      } else {
        // Create a formatted error string for display, replacing the wrapper command
        // with the user-facing command.
        const finalError = result.error
          ? result.error.message.replace(commandToExecute, this.params.command)
          : t('(none)');
        const rootLabel = t('(root)');
        const emptyLabel = t('(empty)');
        const noneLabel = t('(none)');
        const directory = this.params.dir_path || rootLabel;
        const output = result.output || emptyLabel;
        const exitCode = result.exitCode ?? noneLabel;
        const signalDisplay = result.signal ?? noneLabel;
        const backgroundDisplay = backgroundPIDs.length
          ? backgroundPIDs.join(', ')
          : noneLabel;
        const processGroupDisplay = result.pid ?? noneLabel;

        llmContent = [
          t('Command: {{command}}', { command: this.params.command }),
          t('Directory: {{dir}}', { dir: directory }),
          t('Output: {{output}}', { output }),
          t('Error: {{error}}', { error: finalError }),
          t('Exit Code: {{code}}', { code: exitCode }),
          t('Signal: {{signal}}', { signal: signalDisplay }),
          t('Background PIDs: {{pids}}', { pids: backgroundDisplay }),
          t('Process Group PGID: {{pgid}}', { pgid: processGroupDisplay }),
        ].join('\n');
      }

      let returnDisplayMessage = '';
      if (this.config.getDebugMode()) {
        returnDisplayMessage = llmContent;
      } else {
        if (result.output.trim()) {
          returnDisplayMessage = result.output;
        } else {
          if (result.aborted) {
            if (timeoutMessage) {
              returnDisplayMessage = timeoutMessage;
            } else {
              returnDisplayMessage = t('Command cancelled by user.');
            }
          } else if (result.signal) {
            returnDisplayMessage = t(
              'Command terminated by signal: {{signal}}',
              { signal: result.signal },
            );
          } else if (result.error) {
            returnDisplayMessage = t('Command failed: {{error}}', {
              error: getErrorMessage(result.error),
            });
          } else if (result.exitCode !== null && result.exitCode !== 0) {
            returnDisplayMessage = t('Command exited with code: {{code}}', {
              code: result.exitCode,
            });
          }
          // If output is empty and command succeeded (code 0, no error/signal/abort),
          // returnDisplayMessage will remain empty, which is fine.
        }
      }

      const summarizeConfig = this.config.getSummarizeToolOutputConfig();
      const executionError = result.error
        ? {
            error: {
              message: result.error.message,
              type: ToolErrorType.SHELL_EXECUTE_ERROR,
            },
          }
        : {};
      if (summarizeConfig && summarizeConfig[SHELL_TOOL_NAME]) {
        const summary = await summarizeToolOutput(
          this.config,
          { model: 'summarizer-shell' },
          llmContent,
          this.config.getGeminiClient(),
          signal,
        );
        return {
          llmContent: summary,
          returnDisplay: returnDisplayMessage,
          ...executionError,
        };
      }

      return {
        llmContent,
        returnDisplay: returnDisplayMessage,
        ...executionError,
      };
    } finally {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      signal.removeEventListener('abort', onAbort);
      timeoutController.signal.removeEventListener('abort', onAbort);
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  }
}

function getShellToolDescription(): string {
  if (os.platform() === 'win32') {
    return t('tools.shell.description.win32', {
      defaultValue: `This tool executes a given shell command as \`powershell.exe -NoProfile -Command <command>\`. Command can start background processes using PowerShell constructs such as \`Start-Process -NoNewWindow\` or \`Start-Job\`.

      The following information is returned:

      Command: Executed command.
      Directory: Directory where command was executed, or \`(root)\`.
      Stdout: Output on stdout stream. Can be \`(empty)\` or partial on error and for any unwaited background processes.
      Stderr: Output on stderr stream. Can be \`(empty)\` or partial on error and for any unwaited background processes.
      Error: Error or \`(none)\` if no error was reported for the subprocess.
      Exit Code: Exit code or \`(none)\` if terminated by signal.
      Signal: Signal number or \`(none)\` if no signal was received.
      Background PIDs: List of background processes started or \`(none)\`.
      Process Group PGID: Process group started or \`(none)\``,
    });
  } else {
    return t('tools.shell.description.posix', {
      defaultValue: `This tool executes a given shell command as \`bash -c <command>\`. Command can start background processes using \`&\`. Command is executed as a subprocess that leads its own process group. Command process group can be terminated as \`kill -- -PGID\` or signaled as \`kill -s SIGNAL -- -PGID\`.

      The following information is returned:

      Command: Executed command.
      Directory: Directory where command was executed, or \`(root)\`.
      Stdout: Output on stdout stream. Can be \`(empty)\` or partial on error and for any unwaited background processes.
      Stderr: Output on stderr stream. Can be \`(empty)\` or partial on error and for any unwaited background processes.
      Error: Error or \`(none)\` if no error was reported for the subprocess.
      Exit Code: Exit code or \`(none)\` if terminated by signal.
      Signal: Signal number or \`(none)\` if no signal was received.
      Background PIDs: List of background processes started or \`(none)\`.
      Process Group PGID: Process group started or \`(none)\``,
    });
  }
}

function getCommandDescription(): string {
  if (os.platform() === 'win32') {
    return t('tools.shell.params.command.win32', {
      defaultValue:
        'Exact command to execute as `powershell.exe -NoProfile -Command <command>`',
    });
  } else {
    return t('tools.shell.params.command.posix', {
      defaultValue: 'Exact bash command to execute as `bash -c <command>`',
    });
  }
}

export class ShellTool extends BaseDeclarativeTool<
  ShellToolParams,
  ToolResult
> {
  static readonly Name = SHELL_TOOL_NAME;

  constructor(
    private readonly config: Config,
    messageBus: MessageBus,
  ) {
    void initializeShellParsers().catch(() => {
      // Errors are surfaced when parsing commands.
    });
    super(
      ShellTool.Name,
      t('tools.shell.displayName', { defaultValue: 'Shell' }),
      getShellToolDescription(),
      Kind.Execute,
      {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: getCommandDescription(),
          },
          description: {
            type: 'string',
            description: t('tools.shell.params.description', {
              defaultValue:
                'Brief description of the command for the user. Be specific and concise. Ideally a single sentence. Can be up to 3 sentences for clarity. No line breaks.',
            }),
          },
          dir_path: {
            type: 'string',
            description: t('tools.shell.params.dir_path', {
              defaultValue:
                '(OPTIONAL) The path of the directory to run the command in. If not provided, the project root directory is used. Must be a directory within the workspace and must already exist.',
            }),
          },
        },
        required: ['command'],
      },
      messageBus,
      false, // output is not markdown
      true, // output can be updated
    );
  }

  protected override validateToolParamValues(
    params: ShellToolParams,
  ): string | null {
    if (!params.command.trim()) {
      return t('Command cannot be empty.');
    }

    if (params.dir_path) {
      const resolvedPath = path.resolve(
        this.config.getTargetDir(),
        params.dir_path,
      );
      const workspaceContext = this.config.getWorkspaceContext();
      if (!workspaceContext.isPathWithinWorkspace(resolvedPath)) {
        return t(
          "Directory '{{path}}' is not within any of the registered workspace directories.",
          { path: resolvedPath },
        );
      }
    }
    return null;
  }

  protected createInvocation(
    params: ShellToolParams,
    messageBus: MessageBus,
    _toolName?: string,
    _toolDisplayName?: string,
  ): ToolInvocation<ShellToolParams, ToolResult> {
    return new ShellToolInvocation(
      this.config,
      params,
      messageBus,
      _toolName,
      _toolDisplayName,
    );
  }
}
