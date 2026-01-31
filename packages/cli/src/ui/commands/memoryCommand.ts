/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { refreshMemory } from '@google/gemini-cli-core';
import { MessageType } from '../types.js';
import type { SlashCommand, SlashCommandActionReturn } from './types.js';
import { CommandKind } from './types.js';
import { t } from '../../i18n/index.js';

export const memoryCommand: SlashCommand = {
  name: 'memory',
  get description() {
    return t('commands:memory.description');
  },
  kind: CommandKind.BUILT_IN,
  autoExecute: false,
  subCommands: [
    {
      name: 'show',
      get description() {
        return t('commands:memory.show.description');
      },
      kind: CommandKind.BUILT_IN,
      autoExecute: true,
      action: async (context) => {
        const config = context.services.config;
        if (!config) return;
        const memoryContent = config.getUserMemory() || '';
        const fileCount = config.getGeminiMdFileCount() || 0;
        let content: string;

        if (memoryContent.trim().length > 0) {
          content = t('commands:memory.show.currentContentWithCount', {
            count: fileCount,
            content: memoryContent,
          });
        } else {
          content =
            fileCount > 0
              ? t('commands:memory.show.emptyContent')
              : t('commands:memory.show.noneLoaded');
        }

        context.ui.addItem(
          {
            type: MessageType.INFO,
            text: content,
          },
          Date.now(),
        );
      },
    },
    {
      name: 'add',
      get description() {
        return t('commands:memory.add.description');
      },
      kind: CommandKind.BUILT_IN,
      autoExecute: false,
      action: (context, args): SlashCommandActionReturn | void => {
        const trimmed = args?.trim() ?? '';
        if (!trimmed) {
          return {
            type: 'message',
            messageType: 'error',
            content: t('commands:memory.add.usage'),
          };
        }

        context.ui.addItem(
          {
            type: MessageType.INFO,
            text: t('commands:memory.add.saving', { content: trimmed }),
          },
          Date.now(),
        );

        return {
          type: 'tool',
          toolName: 'save_memory',
          toolArgs: { fact: trimmed },
        };
      },
    },
    {
      name: 'refresh',
      get description() {
        return t('commands:memory.refresh.description');
      },
      kind: CommandKind.BUILT_IN,
      autoExecute: true,
      action: async (context) => {
        context.ui.addItem(
          {
            type: MessageType.INFO,
            text: t('commands:memory.refresh.refreshing'),
          },
          Date.now(),
        );

        try {
          const config = context.services.config;
          if (config) {
            await refreshMemory(config);
            const memoryContent = config.getUserMemory() || '';
            const fileCount = config.getGeminiMdFileCount() || 0;
            const successKey =
              memoryContent.length > 0
                ? 'commands:memory.refresh.successWithCount'
                : 'commands:memory.refresh.successEmpty';

            context.ui.addItem(
              {
                type: MessageType.INFO,
                text: t(successKey, {
                  chars: memoryContent.length,
                  count: fileCount,
                }),
              },
              Date.now(),
            );
          }
        } catch (error) {
          context.ui.addItem(
            {
              type: MessageType.ERROR,
              text: t('commands:memory.refresh.error', {
                error: (error as Error).message,
              }),
            },
            Date.now(),
          );
        }
      },
    },
    {
      name: 'list',
      get description() {
        return t('commands:memory.list.description');
      },
      kind: CommandKind.BUILT_IN,
      autoExecute: true,
      action: async (context) => {
        const config = context.services.config;
        if (!config) return;
        const filePaths = config.getGeminiMdFilePaths() || [];
        const fileCount = filePaths.length;
        const content =
          fileCount > 0
            ? t('commands:memory.list.withCount', {
                count: fileCount,
                list: filePaths.join('\n'),
              })
            : t('commands:memory.list.empty');

        context.ui.addItem(
          {
            type: MessageType.INFO,
            text: content,
          },
          Date.now(),
        );
      },
    },
  ],
};
