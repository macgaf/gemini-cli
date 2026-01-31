/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommandKind, type SlashCommand } from './types.js';
import { MessageType } from '../types.js';
import { t } from '../../i18n/index.js';

const listPoliciesCommand: SlashCommand = {
  name: 'list',
  description: t('commands:policies.list.description'),
  kind: CommandKind.BUILT_IN,
  autoExecute: true,
  action: async (context) => {
    const { config } = context.services;
    if (!config) {
      context.ui.addItem(
        {
          type: MessageType.ERROR,
          text: t('commands:policies.errorConfigNotAvailable'),
        },
        Date.now(),
      );
      return;
    }

    const policyEngine = config.getPolicyEngine();
    const rules = policyEngine.getRules();

    if (rules.length === 0) {
      context.ui.addItem(
        {
          type: MessageType.INFO,
          text: t('commands:policies.noActive'),
        },
        Date.now(),
      );
      return;
    }

    let content = `**${t('commands:policies.list.title')}**\n\n`;
    rules.forEach((rule, index) => {
      content += `${index + 1}. **${rule.decision.toUpperCase()}**`;
      if (rule.toolName) {
        content += ` ${t('commands:policies.list.tool')}: \`${rule.toolName}\``;
      } else {
        content += ` ${t('commands:policies.list.allTools')}`;
      }
      if (rule.argsPattern) {
        content += ` (${t('commands:policies.list.argsMatch')}: \`${rule.argsPattern.source}\`)`;
      }
      if (rule.priority !== undefined) {
        content += ` [${t('commands:policies.list.priority')}: ${rule.priority}]`;
      }
      if (rule.source) {
        content += ` [${t('commands:policies.list.source')}: \`${rule.source}\`]`;
      }
      content += '\n';
    });

    context.ui.addItem(
      {
        type: MessageType.INFO,
        text: content,
      },
      Date.now(),
    );
  },
};

export const policiesCommand: SlashCommand = {
  name: 'policies',
  description: t('commands:policies.description'),
  kind: CommandKind.BUILT_IN,
  autoExecute: false,
  subCommands: [listPoliciesCommand],
};
