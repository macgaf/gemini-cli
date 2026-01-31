/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import {
  type Config,
  formatCheckpointDisplayList,
  getToolCallDataSchema,
  getTruncatedCheckpointNames,
  type ToolCallData,
} from '@google/gemini-cli-core';
import { t } from '../../i18n/index.js';
import {
  type CommandContext,
  type SlashCommand,
  type SlashCommandActionReturn,
  CommandKind,
} from './types.js';
import type { HistoryItem } from '../types.js';

const HistoryItemSchema = z
  .object({
    type: z.string(),
    id: z.number(),
  })
  .passthrough();

const ToolCallDataSchema = getToolCallDataSchema(HistoryItemSchema);

async function restoreAction(
  context: CommandContext,
  args: string,
): Promise<void | SlashCommandActionReturn> {
  const { services, ui } = context;
  const { config, git: gitService } = services;
  const { addItem, loadHistory } = ui;

  const checkpointDir = config?.storage.getProjectTempCheckpointsDir();

  if (!checkpointDir) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:restore.geminiDirNotFound'),
    };
  }

  try {
    // Ensure the directory exists before trying to read it.
    await fs.mkdir(checkpointDir, { recursive: true });
    const files = await fs.readdir(checkpointDir);
    const jsonFiles = files.filter((file) => file.endsWith('.json'));

    if (!args) {
      if (jsonFiles.length === 0) {
        return {
          type: 'message',
          messageType: 'info',
          content: t('commands:restore.noRestorable'),
        };
      }
      const fileList = formatCheckpointDisplayList(jsonFiles);
      return {
        type: 'message',
        messageType: 'info',
        content: t('commands:restore.availableList', { list: fileList }),
      };
    }

    const selectedFile = args.endsWith('.json') ? args : `${args}.json`;

    if (!jsonFiles.includes(selectedFile)) {
      return {
        type: 'message',
        messageType: 'error',
        content: t('commands:restore.fileNotFound', {
          file: selectedFile,
        }),
      };
    }

    const filePath = path.join(checkpointDir, selectedFile);
    const data = await fs.readFile(filePath, 'utf-8');
    const parseResult = ToolCallDataSchema.safeParse(JSON.parse(data));

    if (!parseResult.success) {
      return {
        type: 'message',
        messageType: 'error',
        content: t('commands:restore.invalidCheckpoint', {
          error: parseResult.error.message,
        }),
      };
    }

    // We safely cast here because:
    // 1. ToolCallDataSchema strictly validates the existence of 'history' as an array and 'id'/'type' on each item.
    // 2. We trust that files valid according to this schema (written by useGeminiStream) contain the full HistoryItem structure.
    const toolCallData = parseResult.data as ToolCallData<
      HistoryItem[],
      Record<string, unknown>
    >;

    if (toolCallData.history && toolCallData.clientHistory && loadHistory) {
      loadHistory(toolCallData.history);
      config?.getGeminiClient()?.setHistory(toolCallData.clientHistory);
    }

    if (toolCallData.commitHash) {
      if (!gitService) {
        addItem(
          {
            type: 'error',
            text: t('commands:restore.gitServiceUnavailable'),
          },
          Date.now(),
        );
      } else {
        try {
          await gitService.restoreProjectFromSnapshot(toolCallData.commitHash);
          addItem(
            {
              type: 'info',
              text: t('commands:restore.restored'),
            },
            Date.now(),
          );
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes('unable to read tree')
          ) {
            addItem(
              {
                type: 'error',
                text: t('commands:restore.commitNotFound', {
                  commitHash: toolCallData.commitHash,
                }),
              },
              Date.now(),
            );
          } else {
            throw error;
          }
        }
      }
    }

    return {
      type: 'tool',
      toolName: toolCallData.toolCall.name,
      toolArgs: toolCallData.toolCall.args,
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:restore.errorReading', {
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
}

async function completion(
  context: CommandContext,
  _partialArg: string,
): Promise<string[]> {
  const { services } = context;
  const { config } = services;
  const checkpointDir = config?.storage.getProjectTempCheckpointsDir();
  if (!checkpointDir) {
    return [];
  }
  try {
    const files = await fs.readdir(checkpointDir);
    const jsonFiles = files.filter((file) => file.endsWith('.json'));
    return getTruncatedCheckpointNames(jsonFiles);
  } catch (_err) {
    return [];
  }
}

export const restoreCommand = (config: Config | null): SlashCommand | null => {
  if (!config?.getCheckpointingEnabled()) {
    return null;
  }

  return {
    name: 'restore',
    description: t('commands:restore.description'),
    kind: CommandKind.BUILT_IN,
    autoExecute: true,
    action: restoreAction,
    completion,
  };
};
