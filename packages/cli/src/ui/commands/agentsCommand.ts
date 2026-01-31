/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  SlashCommand,
  CommandContext,
  SlashCommandActionReturn,
} from './types.js';
import { CommandKind } from './types.js';
import { MessageType, type HistoryItemAgentsList } from '../types.js';
import { SettingScope } from '../../config/settings.js';
import { disableAgent, enableAgent } from '../../utils/agentSettings.js';
import { renderAgentActionFeedback } from '../../utils/agentUtils.js';
import { t } from '../../i18n/index.js';

const agentsListCommand: SlashCommand = {
  name: 'list',
  description: t('commands:agents.list.description'),
  kind: CommandKind.BUILT_IN,
  autoExecute: true,
  action: async (context: CommandContext) => {
    const { config } = context.services;
    if (!config) {
      return {
        type: 'message',
        messageType: 'error',
        content: t('commands:agents.list.configNotLoaded'),
      };
    }

    const agentRegistry = config.getAgentRegistry();
    if (!agentRegistry) {
      return {
        type: 'message',
        messageType: 'error',
        content: t('commands:agents.list.registryNotFound'),
      };
    }

    const agents = agentRegistry.getAllDefinitions().map((def) => ({
      name: def.name,
      displayName: def.displayName,
      description: def.description,
      kind: def.kind,
    }));

    const agentsListItem: HistoryItemAgentsList = {
      type: MessageType.AGENTS_LIST,
      agents,
    };

    context.ui.addItem(agentsListItem);

    return;
  },
};

async function enableAction(
  context: CommandContext,
  args: string,
): Promise<SlashCommandActionReturn | void> {
  const { config, settings } = context.services;
  if (!config) return;

  const agentName = args.trim();
  if (!agentName) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:agents.enable.usage'),
    };
  }

  const agentRegistry = config.getAgentRegistry();
  if (!agentRegistry) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:agents.enable.registryNotFound'),
    };
  }

  const allAgents = agentRegistry.getAllAgentNames();
  const overrides = settings.merged.agents.overrides;
  const disabledAgents = Object.keys(overrides).filter(
    (name) => overrides[name]?.enabled === false,
  );

  if (allAgents.includes(agentName) && !disabledAgents.includes(agentName)) {
    return {
      type: 'message',
      messageType: 'info',
      content: t('commands:agents.enable.alreadyEnabled', {
        name: agentName,
      }),
    };
  }

  if (!disabledAgents.includes(agentName) && !allAgents.includes(agentName)) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:agents.enable.notFound', { name: agentName }),
    };
  }

  const result = enableAgent(settings, agentName);

  if (result.status === 'no-op') {
    return {
      type: 'message',
      messageType: 'info',
      content: renderAgentActionFeedback(result, (l, p) => `${l} (${p})`),
    };
  }

  context.ui.addItem({
    type: MessageType.INFO,
    text: t('commands:agents.enable.enabling', { name: agentName }),
  });
  await agentRegistry.reload();

  return {
    type: 'message',
    messageType: 'info',
    content: renderAgentActionFeedback(result, (l, p) => `${l} (${p})`),
  };
}

async function disableAction(
  context: CommandContext,
  args: string,
): Promise<SlashCommandActionReturn | void> {
  const { config, settings } = context.services;
  if (!config) return;

  const agentName = args.trim();
  if (!agentName) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:agents.disable.usage'),
    };
  }

  const agentRegistry = config.getAgentRegistry();
  if (!agentRegistry) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:agents.disable.registryNotFound'),
    };
  }

  const allAgents = agentRegistry.getAllAgentNames();
  const overrides = settings.merged.agents.overrides;
  const disabledAgents = Object.keys(overrides).filter(
    (name) => overrides[name]?.enabled === false,
  );

  if (disabledAgents.includes(agentName)) {
    return {
      type: 'message',
      messageType: 'info',
      content: t('commands:agents.disable.alreadyDisabled', {
        name: agentName,
      }),
    };
  }

  if (!allAgents.includes(agentName)) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:agents.disable.notFound', { name: agentName }),
    };
  }

  const scope = context.services.settings.workspace.path
    ? SettingScope.Workspace
    : SettingScope.User;
  const result = disableAgent(settings, agentName, scope);

  if (result.status === 'no-op') {
    return {
      type: 'message',
      messageType: 'info',
      content: renderAgentActionFeedback(result, (l, p) => `${l} (${p})`),
    };
  }

  context.ui.addItem({
    type: MessageType.INFO,
    text: t('commands:agents.disable.disabling', { name: agentName }),
  });
  await agentRegistry.reload();

  return {
    type: 'message',
    messageType: 'info',
    content: renderAgentActionFeedback(result, (l, p) => `${l} (${p})`),
  };
}

function completeAgentsToEnable(context: CommandContext, partialArg: string) {
  const { config, settings } = context.services;
  if (!config) return [];

  const overrides = settings.merged.agents.overrides;
  const disabledAgents = Object.entries(overrides)
    .filter(([_, override]) => override?.enabled === false)
    .map(([name]) => name);

  return disabledAgents.filter((name) => name.startsWith(partialArg));
}

function completeAgentsToDisable(context: CommandContext, partialArg: string) {
  const { config } = context.services;
  if (!config) return [];

  const agentRegistry = config.getAgentRegistry();
  const allAgents = agentRegistry ? agentRegistry.getAllAgentNames() : [];
  return allAgents.filter((name: string) => name.startsWith(partialArg));
}

const enableCommand: SlashCommand = {
  name: 'enable',
  description: t('commands:agents.enable.description'),
  kind: CommandKind.BUILT_IN,
  autoExecute: false,
  action: enableAction,
  completion: completeAgentsToEnable,
};

const disableCommand: SlashCommand = {
  name: 'disable',
  description: t('commands:agents.disable.description'),
  kind: CommandKind.BUILT_IN,
  autoExecute: false,
  action: disableAction,
  completion: completeAgentsToDisable,
};

const agentsRefreshCommand: SlashCommand = {
  name: 'refresh',
  description: t('commands:agents.refresh.description'),
  kind: CommandKind.BUILT_IN,
  action: async (context: CommandContext) => {
    const { config } = context.services;
    const agentRegistry = config?.getAgentRegistry();
    if (!agentRegistry) {
      return {
        type: 'message',
        messageType: 'error',
        content: t('commands:agents.refresh.registryNotFound'),
      };
    }

    context.ui.addItem({
      type: MessageType.INFO,
      text: t('commands:agents.refresh.refreshing'),
    });

    await agentRegistry.reload();

    return {
      type: 'message',
      messageType: 'info',
      content: t('commands:agents.refresh.success'),
    };
  },
};

export const agentsCommand: SlashCommand = {
  name: 'agents',
  get description() {
    return t('commands:agents.description');
  },
  kind: CommandKind.BUILT_IN,
  subCommands: [
    agentsListCommand,
    agentsRefreshCommand,
    enableCommand,
    disableCommand,
  ],
  action: async (context: CommandContext, args) =>
    // Default to list if no subcommand is provided
    agentsListCommand.action!(context, args),
};
