/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommandKind, type SlashCommand } from './types.js';
import { t } from '../../i18n/index.js';

export const corgiCommand: SlashCommand = {
  name: 'corgi',
  description: t('commands:corgi.description'),
  hidden: true,
  kind: CommandKind.BUILT_IN,
  autoExecute: true,
  action: (context, _args) => {
    context.ui.toggleCorgiMode();
  },
};
