/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  CommandContext,
  SlashCommand,
  SlashCommandActionReturn,
} from './types.js';
import { CommandKind } from './types.js';
import { performInit } from '@google/gemini-cli-core';
import { t } from '../../i18n/index.js';

export const initCommand: SlashCommand = {
  name: 'init',
  description: t('commands:init.description'),
  kind: CommandKind.BUILT_IN,
  autoExecute: true,
  action: async (
    context: CommandContext,
    _args: string,
  ): Promise<SlashCommandActionReturn> => {
    if (!context.services.config) {
      return {
        type: 'message',
        messageType: 'error',
        content: t('commands:init.configNotAvailable'),
      };
    }
    const targetDir = context.services.config.getTargetDir();
    const geminiMdPath = path.join(targetDir, 'GEMINI.md');
    const geminiMdExists = fs.existsSync(geminiMdPath);

    if (geminiMdExists) {
      return {
        type: 'message',
        messageType: 'info',
        content: t('commands:init.alreadyExists'),
      };
    }

    const result = performInit(false);

    if (result.type === 'submit_prompt') {
      // Create an empty GEMINI.md file
      fs.writeFileSync(geminiMdPath, '', 'utf8');

      context.ui.addItem(
        {
          type: 'info',
          text: t('commands:init.emptyCreated'),
        },
        Date.now(),
      );
    }

    return result as SlashCommandActionReturn;
  },
};
