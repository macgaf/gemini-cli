/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MessageBus } from '../confirmation-bus/message-bus.js';
import fs from 'node:fs';
import path from 'node:path';
import { glob, escape } from 'glob';
import type { ToolInvocation, ToolResult } from './tools.js';
import { BaseDeclarativeTool, BaseToolInvocation, Kind } from './tools.js';
import { shortenPath, makeRelative } from '../utils/paths.js';
import { type Config } from '../config/config.js';
import { DEFAULT_FILE_FILTERING_OPTIONS } from '../config/constants.js';
import { ToolErrorType } from './tool-error.js';
import { GLOB_TOOL_NAME } from './tool-names.js';
import { getErrorMessage } from '../utils/errors.js';
import { debugLogger } from '../utils/debugLogger.js';
import { t } from '../i18n/index.js';

// Subset of 'Path' interface provided by 'glob' that we can implement for testing
export interface GlobPath {
  fullpath(): string;
  mtimeMs?: number;
}

/**
 * Sorts file entries based on recency and then alphabetically.
 * Recent files (modified within recencyThresholdMs) are listed first, newest to oldest.
 * Older files are listed after recent ones, sorted alphabetically by path.
 */
export function sortFileEntries(
  entries: GlobPath[],
  nowTimestamp: number,
  recencyThresholdMs: number,
): GlobPath[] {
  const sortedEntries = [...entries];
  sortedEntries.sort((a, b) => {
    const mtimeA = a.mtimeMs ?? 0;
    const mtimeB = b.mtimeMs ?? 0;
    const aIsRecent = nowTimestamp - mtimeA < recencyThresholdMs;
    const bIsRecent = nowTimestamp - mtimeB < recencyThresholdMs;

    if (aIsRecent && bIsRecent) {
      return mtimeB - mtimeA;
    } else if (aIsRecent) {
      return -1;
    } else if (bIsRecent) {
      return 1;
    } else {
      return a.fullpath().localeCompare(b.fullpath());
    }
  });
  return sortedEntries;
}

/**
 * Parameters for the GlobTool
 */
export interface GlobToolParams {
  /**
   * The glob pattern to match files against
   */
  pattern: string;

  /**
   * The directory to search in (optional, defaults to current directory)
   */
  dir_path?: string;

  /**
   * Whether the search should be case-sensitive (optional, defaults to false)
   */
  case_sensitive?: boolean;

  /**
   * Whether to respect .gitignore patterns (optional, defaults to true)
   */
  respect_git_ignore?: boolean;

  /**
   * Whether to respect .geminiignore patterns (optional, defaults to true)
   */
  respect_gemini_ignore?: boolean;
}

class GlobToolInvocation extends BaseToolInvocation<
  GlobToolParams,
  ToolResult
> {
  constructor(
    private config: Config,
    params: GlobToolParams,
    messageBus: MessageBus,
    _toolName?: string,
    _toolDisplayName?: string,
  ) {
    super(params, messageBus, _toolName, _toolDisplayName);
  }

  getDescription(): string {
    let description = `'${this.params.pattern}'`;
    if (this.params.dir_path) {
      const searchDir = path.resolve(
        this.config.getTargetDir(),
        this.params.dir_path || '.',
      );
      const relativePath = makeRelative(searchDir, this.config.getTargetDir());
      description += t(' within {{path}}', {
        path: shortenPath(relativePath),
      });
    }
    return description;
  }

  async execute(signal: AbortSignal): Promise<ToolResult> {
    try {
      const workspaceContext = this.config.getWorkspaceContext();
      const workspaceDirectories = workspaceContext.getDirectories();

      // If a specific path is provided, resolve it and check if it's within workspace
      let searchDirectories: readonly string[];
      if (this.params.dir_path) {
        const searchDirAbsolute = path.resolve(
          this.config.getTargetDir(),
          this.params.dir_path,
        );
        if (!workspaceContext.isPathWithinWorkspace(searchDirAbsolute)) {
          const rawError = t(
            'Error: Path "{{path}}" is not within any workspace directory',
            { path: this.params.dir_path },
          );
          return {
            llmContent: rawError,
            returnDisplay: t('Path is not within workspace'),
            error: {
              message: rawError,
              type: ToolErrorType.PATH_NOT_IN_WORKSPACE,
            },
          };
        }
        searchDirectories = [searchDirAbsolute];
      } else {
        // Search across all workspace directories
        searchDirectories = workspaceDirectories;
      }

      // Get centralized file discovery service
      const fileDiscovery = this.config.getFileService();

      // Collect entries from all search directories
      const allEntries: GlobPath[] = [];
      for (const searchDir of searchDirectories) {
        let pattern = this.params.pattern;
        const fullPath = path.join(searchDir, pattern);
        if (fs.existsSync(fullPath)) {
          pattern = escape(pattern);
        }

        const entries = (await glob(pattern, {
          cwd: searchDir,
          withFileTypes: true,
          nodir: true,
          stat: true,
          nocase: !this.params.case_sensitive,
          dot: true,
          ignore: this.config.getFileExclusions().getGlobExcludes(),
          follow: false,
          signal,
        })) as GlobPath[];

        allEntries.push(...entries);
      }

      const relativePaths = allEntries.map((p) =>
        path.relative(this.config.getTargetDir(), p.fullpath()),
      );

      const { filteredPaths, ignoredCount } =
        fileDiscovery.filterFilesWithReport(relativePaths, {
          respectGitIgnore:
            this.params?.respect_git_ignore ??
            this.config.getFileFilteringOptions().respectGitIgnore ??
            DEFAULT_FILE_FILTERING_OPTIONS.respectGitIgnore,
          respectGeminiIgnore:
            this.params?.respect_gemini_ignore ??
            this.config.getFileFilteringOptions().respectGeminiIgnore ??
            DEFAULT_FILE_FILTERING_OPTIONS.respectGeminiIgnore,
        });

      const filteredAbsolutePaths = new Set(
        filteredPaths.map((p) => path.resolve(this.config.getTargetDir(), p)),
      );

      const filteredEntries = allEntries.filter((entry) =>
        filteredAbsolutePaths.has(entry.fullpath()),
      );

      if (!filteredEntries || filteredEntries.length === 0) {
        let message = t('No files found matching pattern "{{pattern}}"', {
          pattern: this.params.pattern,
        });
        if (searchDirectories.length === 1) {
          message += t(' within {{path}}', { path: searchDirectories[0] });
        } else {
          message += t(' within {{count}} workspace directories', {
            count: searchDirectories.length,
          });
        }
        if (ignoredCount > 0) {
          message += t(' ({{count}} files were ignored)', {
            count: ignoredCount,
          });
        }
        return {
          llmContent: message,
          returnDisplay: t('No files found'),
        };
      }

      // Set filtering such that we first show the most recent files
      const oneDayInMs = 24 * 60 * 60 * 1000;
      const nowTimestamp = new Date().getTime();

      // Sort the filtered entries using the new helper function
      const sortedEntries = sortFileEntries(
        filteredEntries,
        nowTimestamp,
        oneDayInMs,
      );

      const sortedAbsolutePaths = sortedEntries.map((entry) =>
        entry.fullpath(),
      );
      const fileListDescription = sortedAbsolutePaths.join('\n');
      const fileCount = sortedAbsolutePaths.length;

      let resultMessage = t('Found {{count}} file(s) matching "{{pattern}}"', {
        count: fileCount,
        pattern: this.params.pattern,
      });
      if (searchDirectories.length === 1) {
        resultMessage += t(' within {{path}}', {
          path: searchDirectories[0],
        });
      } else {
        resultMessage += t(' across {{count}} workspace directories', {
          count: searchDirectories.length,
        });
      }
      if (ignoredCount > 0) {
        resultMessage += t(' ({{count}} additional files were ignored)', {
          count: ignoredCount,
        });
      }
      resultMessage += t(
        ', sorted by modification time (newest first):\n{{list}}',
        { list: fileListDescription },
      );

      return {
        llmContent: resultMessage,
        returnDisplay: t('Found {{count}} matching file(s)', {
          count: fileCount,
        }),
      };
    } catch (error) {
      debugLogger.warn(`GlobLogic execute Error`, error);
      const errorMessage = getErrorMessage(error);
      const rawError = t('Error during glob search operation: {{error}}', {
        error: errorMessage,
      });
      return {
        llmContent: rawError,
        returnDisplay: t('Error: An unexpected error occurred.'),
        error: {
          message: rawError,
          type: ToolErrorType.GLOB_EXECUTION_ERROR,
        },
      };
    }
  }
}

/**
 * Implementation of the Glob tool logic
 */
export class GlobTool extends BaseDeclarativeTool<GlobToolParams, ToolResult> {
  static readonly Name = GLOB_TOOL_NAME;
  constructor(
    private config: Config,
    messageBus: MessageBus,
  ) {
    super(
      GlobTool.Name,
      t('tools.glob.displayName', { defaultValue: 'FindFiles' }),
      t('tools.glob.description', {
        defaultValue:
          'Efficiently finds files matching specific glob patterns (e.g., `src/**/*.ts`, `**/*.md`), returning absolute paths sorted by modification time (newest first). Ideal for quickly locating files based on their name or path structure, especially in large codebases.',
      }),
      Kind.Search,
      {
        properties: {
          pattern: {
            description: t('tools.glob.params.pattern', {
              defaultValue:
                "The glob pattern to match against (e.g., '**/*.py', 'docs/*.md').",
            }),
            type: 'string',
          },
          dir_path: {
            description: t('tools.glob.params.dir_path', {
              defaultValue:
                'Optional: The absolute path to the directory to search within. If omitted, searches the root directory.',
            }),
            type: 'string',
          },
          case_sensitive: {
            description: t('tools.glob.params.case_sensitive', {
              defaultValue:
                'Optional: Whether the search should be case-sensitive. Defaults to false.',
            }),
            type: 'boolean',
          },
          respect_git_ignore: {
            description: t('tools.glob.params.respect_git_ignore', {
              defaultValue:
                'Optional: Whether to respect .gitignore patterns when finding files. Only available in git repositories. Defaults to true.',
            }),
            type: 'boolean',
          },
          respect_gemini_ignore: {
            description: t('tools.glob.params.respect_gemini_ignore', {
              defaultValue:
                'Optional: Whether to respect .geminiignore patterns when finding files. Defaults to true.',
            }),
            type: 'boolean',
          },
        },
        required: ['pattern'],
        type: 'object',
      },
      messageBus,
      true,
      false,
    );
  }

  /**
   * Validates the parameters for the tool.
   */
  protected override validateToolParamValues(
    params: GlobToolParams,
  ): string | null {
    const searchDirAbsolute = path.resolve(
      this.config.getTargetDir(),
      params.dir_path || '.',
    );

    const workspaceContext = this.config.getWorkspaceContext();
    if (!workspaceContext.isPathWithinWorkspace(searchDirAbsolute)) {
      const directories = workspaceContext.getDirectories();
      return t(
        'Search path ("{{path}}") resolves outside the allowed workspace directories: {{dirs}}',
        { path: searchDirAbsolute, dirs: directories.join(', ') },
      );
    }

    const targetDir = searchDirAbsolute || this.config.getTargetDir();
    try {
      if (!fs.existsSync(targetDir)) {
        return t('Search path does not exist {{path}}', { path: targetDir });
      }
      if (!fs.statSync(targetDir).isDirectory()) {
        return t('Search path is not a directory: {{path}}', {
          path: targetDir,
        });
      }
    } catch (e: unknown) {
      return t('Error accessing search path: {{error}}', { error: e });
    }

    if (
      !params.pattern ||
      typeof params.pattern !== 'string' ||
      params.pattern.trim() === ''
    ) {
      return t("The 'pattern' parameter cannot be empty.");
    }

    return null;
  }

  protected createInvocation(
    params: GlobToolParams,
    messageBus: MessageBus,
    _toolName?: string,
    _toolDisplayName?: string,
  ): ToolInvocation<GlobToolParams, ToolResult> {
    return new GlobToolInvocation(
      this.config,
      params,
      messageBus,
      _toolName,
      _toolDisplayName,
    );
  }
}
