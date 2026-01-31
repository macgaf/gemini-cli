/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SlashCommand, CommandContext } from './types.js';
import { CommandKind } from './types.js';
import { MessageType, type HistoryItemHooksList } from '../types.js';
import type {
  HookRegistryEntry,
  MessageActionReturn,
} from '@google/gemini-cli-core';
import { getErrorMessage } from '@google/gemini-cli-core';
import { SettingScope } from '../../config/settings.js';
import { t } from '../../i18n/index.js';

/**
 * Display a formatted list of hooks with their status
 */
async function panelAction(
  context: CommandContext,
): Promise<void | MessageActionReturn> {
  const { config } = context.services;
  if (!config) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:hooks.configNotLoaded'),
    };
  }

  const hookSystem = config.getHookSystem();
  const allHooks = hookSystem?.getAllHooks() || [];

  const hooksListItem: HistoryItemHooksList = {
    type: MessageType.HOOKS_LIST,
    hooks: allHooks,
  };

  context.ui.addItem(hooksListItem);
}

/**
 * Enable a hook by name
 */
async function enableAction(
  context: CommandContext,
  args: string,
): Promise<void | MessageActionReturn> {
  const { config } = context.services;
  if (!config) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:hooks.configNotLoaded'),
    };
  }

  const hookSystem = config.getHookSystem();
  if (!hookSystem) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:hooks.hookSystemNotEnabled'),
    };
  }

  const hookName = args.trim();
  if (!hookName) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:hooks.usageEnable'),
    };
  }

  // Get current disabled hooks from settings
  const settings = context.services.settings;
  const disabledHooks = settings.merged.hooksConfig.disabled;
  // Remove from disabled list if present
  const newDisabledHooks = disabledHooks.filter(
    (name: string) => name !== hookName,
  );

  // Update settings (setValue automatically saves)
  try {
    const scope = settings.workspace
      ? SettingScope.Workspace
      : SettingScope.User;
    settings.setValue(scope, 'hooksConfig.disabled', newDisabledHooks);

    // Update core config so re-initialization (e.g. extension reload) respects the change
    config.updateDisabledHooks(settings.merged.hooksConfig.disabled);

    // Enable in hook system
    hookSystem.setHookEnabled(hookName, true);

    return {
      type: 'message',
      messageType: 'info',
      content: t('commands:hooks.enabledSuccess', { name: hookName }),
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:hooks.failedToEnable', {
        error: getErrorMessage(error),
      }),
    };
  }
}

/**
 * Disable a hook by name
 */
async function disableAction(
  context: CommandContext,
  args: string,
): Promise<void | MessageActionReturn> {
  const { config } = context.services;
  if (!config) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:hooks.configNotLoaded'),
    };
  }

  const hookSystem = config.getHookSystem();
  if (!hookSystem) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:hooks.hookSystemNotEnabled'),
    };
  }

  const hookName = args.trim();
  if (!hookName) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:hooks.usageDisable'),
    };
  }

  // Get current disabled hooks from settings
  const settings = context.services.settings;
  const disabledHooks = settings.merged.hooksConfig.disabled;
  // Add to disabled list if not already present
  try {
    if (!disabledHooks.includes(hookName)) {
      const newDisabledHooks = [...disabledHooks, hookName];

      const scope = settings.workspace
        ? SettingScope.Workspace
        : SettingScope.User;
      settings.setValue(scope, 'hooksConfig.disabled', newDisabledHooks);
    }

    // Update core config so re-initialization (e.g. extension reload) respects the change
    config.updateDisabledHooks(settings.merged.hooksConfig.disabled);

    // Always disable in hook system to ensure in-memory state matches settings
    hookSystem.setHookEnabled(hookName, false);

    return {
      type: 'message',
      messageType: 'info',
      content: t('commands:hooks.disabledSuccess', { name: hookName }),
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:hooks.failedToDisable', {
        error: getErrorMessage(error),
      }),
    };
  }
}

/**
 * Completion function for hook names
 */
function completeHookNames(
  context: CommandContext,
  partialArg: string,
): string[] {
  const { config } = context.services;
  if (!config) return [];

  const hookSystem = config.getHookSystem();
  if (!hookSystem) return [];

  const allHooks = hookSystem.getAllHooks();
  const hookNames = allHooks.map((hook) => getHookDisplayName(hook));
  return hookNames.filter((name) => name.startsWith(partialArg));
}

/**
 * Get a display name for a hook
 */
function getHookDisplayName(hook: HookRegistryEntry): string {
  return hook.config.name || hook.config.command || 'unknown-hook';
}

/**
 * Enable all hooks by clearing the disabled list
 */
async function enableAllAction(
  context: CommandContext,
): Promise<void | MessageActionReturn> {
  const { config } = context.services;
  if (!config) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:hooks.configNotLoaded'),
    };
  }

  const hookSystem = config.getHookSystem();
  if (!hookSystem) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:hooks.hookSystemNotEnabled'),
    };
  }

  const settings = context.services.settings;
  const allHooks = hookSystem.getAllHooks();

  if (allHooks.length === 0) {
    return {
      type: 'message',
      messageType: 'info',
      content: t('commands:hooks.noHooksConfigured'),
    };
  }

  const disabledHooks = allHooks.filter((hook) => !hook.enabled);
  if (disabledHooks.length === 0) {
    return {
      type: 'message',
      messageType: 'info',
      content: t('commands:hooks.allHooksEnabled'),
    };
  }

  try {
    const scope = settings.workspace
      ? SettingScope.Workspace
      : SettingScope.User;
    settings.setValue(scope, 'hooksConfig.disabled', []);

    // Update core config so re-initialization (e.g. extension reload) respects the change
    config.updateDisabledHooks(settings.merged.hooksConfig.disabled);

    for (const hook of disabledHooks) {
      const hookName = getHookDisplayName(hook);
      hookSystem.setHookEnabled(hookName, true);
    }

    return {
      type: 'message',
      messageType: 'info',
      content: t('commands:hooks.enabledCount', {
        count: disabledHooks.length,
      }),
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:hooks.failedToEnableAll', {
        error: getErrorMessage(error),
      }),
    };
  }
}

/**
 * Disable all hooks by adding all hooks to the disabled list
 */
async function disableAllAction(
  context: CommandContext,
): Promise<void | MessageActionReturn> {
  const { config } = context.services;
  if (!config) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:hooks.configNotLoaded'),
    };
  }

  const hookSystem = config.getHookSystem();
  if (!hookSystem) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:hooks.hookSystemNotEnabled'),
    };
  }

  const settings = context.services.settings;
  const allHooks = hookSystem.getAllHooks();

  if (allHooks.length === 0) {
    return {
      type: 'message',
      messageType: 'info',
      content: t('commands:hooks.noHooksConfigured'),
    };
  }

  const enabledHooks = allHooks.filter((hook) => hook.enabled);
  if (enabledHooks.length === 0) {
    return {
      type: 'message',
      messageType: 'info',
      content: t('commands:hooks.allHooksDisabled'),
    };
  }

  try {
    const allHookNames = allHooks.map((hook) => getHookDisplayName(hook));
    const scope = settings.workspace
      ? SettingScope.Workspace
      : SettingScope.User;
    settings.setValue(scope, 'hooksConfig.disabled', allHookNames);

    // Update core config so re-initialization (e.g. extension reload) respects the change
    config.updateDisabledHooks(settings.merged.hooksConfig.disabled);

    for (const hook of enabledHooks) {
      const hookName = getHookDisplayName(hook);
      hookSystem.setHookEnabled(hookName, false);
    }

    return {
      type: 'message',
      messageType: 'info',
      content: t('commands:hooks.disabledCount', {
        count: enabledHooks.length,
      }),
    };
  } catch (error) {
    return {
      type: 'message',
      messageType: 'error',
      content: t('commands:hooks.failedToDisableAll', {
        error: getErrorMessage(error),
      }),
    };
  }
}

const panelCommand: SlashCommand = {
  name: 'panel',
  altNames: ['list', 'show'],
  get description() {
    return t('commands:hooks.panel.description');
  },
  kind: CommandKind.BUILT_IN,
  action: panelAction,
};

const enableCommand: SlashCommand = {
  name: 'enable',
  get description() {
    return t('commands:hooks.enable.description');
  },
  kind: CommandKind.BUILT_IN,
  autoExecute: true,
  action: enableAction,
  completion: completeHookNames,
};

const disableCommand: SlashCommand = {
  name: 'disable',
  get description() {
    return t('commands:hooks.disable.description');
  },
  kind: CommandKind.BUILT_IN,
  autoExecute: true,
  action: disableAction,
  completion: completeHookNames,
};

const enableAllCommand: SlashCommand = {
  name: 'enable-all',
  altNames: ['enableall'],
  get description() {
    return t('commands:hooks.enableAll.description');
  },
  kind: CommandKind.BUILT_IN,
  autoExecute: true,
  action: enableAllAction,
};

const disableAllCommand: SlashCommand = {
  name: 'disable-all',
  altNames: ['disableall'],
  get description() {
    return t('commands:hooks.disableAll.description');
  },
  kind: CommandKind.BUILT_IN,
  autoExecute: true,
  action: disableAllAction,
};

export const hooksCommand: SlashCommand = {
  name: 'hooks',
  get description() {
    return t('commands:hooks.description');
  },
  kind: CommandKind.BUILT_IN,
  subCommands: [
    panelCommand,
    enableCommand,
    disableCommand,
    enableAllCommand,
    disableAllCommand,
  ],
  action: async (context: CommandContext) => panelCommand.action!(context, ''),
};
