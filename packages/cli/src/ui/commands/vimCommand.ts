/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SlashCommand } from './types.js';
import { CommandKind } from './types.js';
import { t } from '../../i18n/index.js';

export const vimCommand: SlashCommand = {
  name: 'vim',
  description: t('commands:vim.description'),
  kind: CommandKind.BUILT_IN,
  autoExecute: true,
  action: async (context, _args) => {
    const newVimState = await context.ui.toggleVimEnabled();

    const message = newVimState
      ? t('commands:vim.entered')
      : t('commands:vim.exited');
    return {
      type: 'message',
      messageType: 'info',
      content: message,
    };
  },
};
