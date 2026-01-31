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
import { t } from '../../i18n/index.js';

export const docsCommand: SlashCommand = {
  name: 'docs',
  get description() {
    return t('commands:docs.description');
  },
  kind: CommandKind.BUILT_IN,
  autoExecute: true,
  action: async (context: CommandContext): Promise<void> => {
    const docsUrl = 'https://goo.gle/gemini-cli-docs';

    if (process.env['SANDBOX'] && process.env['SANDBOX'] !== 'sandbox-exec') {
      context.ui.addItem(
        {
          type: MessageType.INFO,
          text: `${t('commands:docs.openInBrowser')}\n${docsUrl}`,
        },
        Date.now(),
      );
    } else {
      context.ui.addItem(
        {
          type: MessageType.INFO,
          text: `${t('commands:docs.opening')} ${docsUrl}`,
        },
        Date.now(),
      );
      await open(docsUrl);
    }
  },
};
