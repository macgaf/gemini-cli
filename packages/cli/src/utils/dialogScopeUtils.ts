/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { t } from '../i18n/index.js';
import type {
  LoadableSettingScope,
  LoadedSettings,
} from '../config/settings.js';
import { isLoadableSettingScope, SettingScope } from '../config/settings.js';
import { settingExistsInScope } from './settingsUtils.js';

/**
 * Get translated scope label
 */
function getScopeLabel(scope: SettingScope): string {
  switch (scope) {
    case SettingScope.User:
      return t('dialogs:settings.scope.user', {
        defaultValue: 'User Settings',
      });
    case SettingScope.Workspace:
      return t('dialogs:settings.scope.workspace', {
        defaultValue: 'Workspace Settings',
      });
    case SettingScope.System:
      return t('dialogs:settings.scope.system', {
        defaultValue: 'System Settings',
      });
    default:
      return String(scope);
  }
}

/**
 * Helper function to get scope items for radio button selects
 */
export function getScopeItems(): Array<{
  label: string;
  value: LoadableSettingScope;
}> {
  return [
    { label: getScopeLabel(SettingScope.User), value: SettingScope.User },
    {
      label: getScopeLabel(SettingScope.Workspace),
      value: SettingScope.Workspace,
    },
    { label: getScopeLabel(SettingScope.System), value: SettingScope.System },
  ];
}

/**
 * Generate scope message for a specific setting
 */
export function getScopeMessageForSetting(
  settingKey: string,
  selectedScope: LoadableSettingScope,
  settings: LoadedSettings,
): string {
  const otherScopes = Object.values(SettingScope)
    .filter(isLoadableSettingScope)
    .filter((scope) => scope !== selectedScope);

  const modifiedInOtherScopes = otherScopes.filter((scope) => {
    const scopeSettings = settings.forScope(scope).settings;
    return settingExistsInScope(settingKey, scopeSettings);
  });

  if (modifiedInOtherScopes.length === 0) {
    return '';
  }

  const modifiedScopesStr = modifiedInOtherScopes.join(', ');
  const currentScopeSettings = settings.forScope(selectedScope).settings;
  const existsInCurrentScope = settingExistsInScope(
    settingKey,
    currentScopeSettings,
  );

  return existsInCurrentScope
    ? t('dialogs:settings.scope.alsoModifiedIn', {
        scopes: modifiedScopesStr,
        defaultValue: `(Also modified in ${modifiedScopesStr})`,
      })
    : t('dialogs:settings.scope.modifiedIn', {
        scopes: modifiedScopesStr,
        defaultValue: `(Modified in ${modifiedScopesStr})`,
      });
}
