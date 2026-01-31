/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import open from 'open';
import process from 'node:process';
import {
  type CommandContext,
  type SlashCommand,
  CommandKind,
} from './types.js';
import { MessageType } from '../types.js';
import { GIT_COMMIT_INFO } from '../../generated/git-commit.js';
import { formatMemoryUsage } from '../utils/formatters.js';
import {
  IdeClient,
  sessionId,
  getVersion,
  INITIAL_HISTORY_LENGTH,
  debugLogger,
} from '@google/gemini-cli-core';
import { terminalCapabilityManager } from '../utils/terminalCapabilityManager.js';
import { exportHistoryToFile } from '../utils/historyExportUtils.js';
import path from 'node:path';
import { t } from '../../i18n/index.js';

export const bugCommand: SlashCommand = {
  name: 'bug',
  get description() {
    return t('commands:bug.description');
  },
  kind: CommandKind.BUILT_IN,
  autoExecute: false,
  action: async (context: CommandContext, args?: string): Promise<void> => {
    const bugDescription = (args || '').trim();
    const { config } = context.services;

    const osVersion = `${process.platform} ${process.version}`;
    let sandboxEnv = t('commands:about.noSandbox');
    if (process.env['SANDBOX'] && process.env['SANDBOX'] !== 'sandbox-exec') {
      sandboxEnv = process.env['SANDBOX'].replace(/^gemini-(?:code-)?/, '');
    } else if (process.env['SANDBOX'] === 'sandbox-exec') {
      sandboxEnv = t('commands:about.sandboxExec', {
        profile: process.env['SEATBELT_PROFILE'] || t('common:unknown'),
      });
    }
    const modelVersion = config?.getModel() || t('common:unknown');
    const cliVersion = await getVersion();
    const memoryUsage = formatMemoryUsage(process.memoryUsage().rss);
    const ideClient = await getIdeClientName(context);
    const terminalName =
      terminalCapabilityManager.getTerminalName() || t('common:unknown');
    const terminalBgColor =
      terminalCapabilityManager.getTerminalBackgroundColor() ||
      t('common:unknown');
    const kittyProtocol = terminalCapabilityManager.isKittyProtocolEnabled()
      ? t('commands:bug.kittySupported')
      : t('commands:bug.kittyUnsupported');

    let info = [
      `* **${t('commands:bug.info.cliVersion')}:** ${cliVersion}`,
      `* **${t('commands:bug.info.gitCommit')}:** ${GIT_COMMIT_INFO}`,
      `* **${t('commands:bug.info.sessionId')}:** ${sessionId}`,
      `* **${t('commands:bug.info.operatingSystem')}:** ${osVersion}`,
      `* **${t('commands:bug.info.sandboxEnv')}:** ${sandboxEnv}`,
      `* **${t('commands:bug.info.modelVersion')}:** ${modelVersion}`,
      `* **${t('commands:bug.info.memoryUsage')}:** ${memoryUsage}`,
      `* **${t('commands:bug.info.terminalName')}:** ${terminalName}`,
      `* **${t('commands:bug.info.terminalBackground')}:** ${terminalBgColor}`,
      `* **${t('commands:bug.info.kittyKeyboard')}:** ${kittyProtocol}`,
    ].join('\n');
    info = `\n${info}\n`;
    if (ideClient) {
      info += `* **${t('commands:bug.info.ideClient')}:** ${ideClient}\n`;
    }

    const chat = config?.getGeminiClient()?.getChat();
    const history = chat?.getHistory() || [];
    let historyFileMessage = '';
    let problemValue = bugDescription;

    if (history.length > INITIAL_HISTORY_LENGTH) {
      const tempDir = config?.storage?.getProjectTempDir();
      if (tempDir) {
        const historyFileName = `bug-report-history-${Date.now()}.json`;
        const historyFilePath = path.join(tempDir, historyFileName);
        try {
          await exportHistoryToFile({ history, filePath: historyFilePath });
          historyFileMessage = `\n\n--------------------------------------------------------------------------------\n\n${t('commands:bug.historyExported')}\n${historyFilePath}\n\n${t('commands:bug.attachPrompt')}\n\n${t('commands:bug.privacyDisclaimer')}`;
          problemValue += `\n\n${t('commands:bug.actionRequired')}`;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          debugLogger.error(
            `Failed to export chat history for bug report: ${errorMessage}`,
          );
        }
      }
    }

    let bugReportUrl =
      'https://github.com/google-gemini/gemini-cli/issues/new?template=bug_report.yml&title={title}&info={info}&problem={problem}';

    const bugCommandSettings = config?.getBugCommand();
    if (bugCommandSettings?.urlTemplate) {
      bugReportUrl = bugCommandSettings.urlTemplate;
    }

    bugReportUrl = bugReportUrl
      .replace('{title}', encodeURIComponent(bugDescription))
      .replace('{info}', encodeURIComponent(info))
      .replace('{problem}', encodeURIComponent(problemValue));

    context.ui.addItem(
      {
        type: MessageType.INFO,
        text: `${t('commands:bug.submitPrompt')}\n${bugReportUrl}${historyFileMessage}`,
      },
      Date.now(),
    );

    try {
      await open(bugReportUrl);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      context.ui.addItem(
        {
          type: MessageType.ERROR,
          text: t('commands:bug.openError', { error: errorMessage }),
        },
        Date.now(),
      );
    }
  },
};

async function getIdeClientName(context: CommandContext) {
  if (!context.services.config?.getIdeMode()) {
    return '';
  }
  const ideClient = await IdeClient.getInstance();
  return ideClient.getDetectedIdeDisplayName() ?? '';
}
