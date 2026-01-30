/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SettingScope } from '../config/settings.js';
import type { AgentActionResult } from './agentSettings.js';

import { i18n } from '../i18n/index.js';

/**
 * Shared logic for building the core agent action message while allowing the
 * caller to control how each scope and its path are rendered (e.g., bolding or
 * dimming).
 *
 * This function ONLY returns the description of what happened. It is up to the
 * caller to append any interface-specific guidance.
 */
export function renderAgentActionFeedback(
  result: AgentActionResult,
  formatScope: (label: string, path: string) => string,
): string {
  const { agentName, action, status, error } = result;

  if (status === 'error') {
    return (
      error || i18n.t('commands:agents.feedback.error', { action, agentName })
    );
  }

  if (status === 'no-op') {
    return action === 'enable'
      ? i18n.t('commands:agents.feedback.alreadyEnabled', { agentName })
      : i18n.t('commands:agents.feedback.alreadyDisabled', { agentName });
  }

  const isEnable = action === 'enable';
  const actionVerb = isEnable ? 'enabled' : 'disabled';
  // preposition logic removed as we use full sentences

  const formatScopeItem = (s: { scope: SettingScope; path: string }) => {
    const labelKey =
      s.scope === SettingScope.Workspace
        ? 'commands:agents.feedback.scopeProject'
        : 'commands:agents.feedback.scopeUser';
    const label = i18n.t(labelKey, { defaultValue: s.scope.toLowerCase() });
    return formatScope(label, s.path);
  };

  const totalAffectedScopes = [
    ...result.modifiedScopes,
    ...result.alreadyInStateScopes,
  ];

  if (totalAffectedScopes.length === 2) {
    const s1 = formatScopeItem(totalAffectedScopes[0]);
    const s2 = formatScopeItem(totalAffectedScopes[1]);

    if (isEnable) {
      return i18n.t('commands:agents.feedback.enabledTwoScopes', {
        agentName,
        scope1: s1,
        scope2: s2,
      });
    } else {
      return i18n.t('commands:agents.feedback.disabledTwoScopes', {
        agentName,
        scope1: s1,
        scope2: s2,
      });
    }
  }

  const s = formatScopeItem(totalAffectedScopes[0]);
  return i18n.t('commands:agents.feedback.singleScope', {
    agentName,
    actionVerb,
    enabledDisabled: isEnable ? 'enabled' : 'disabled',
    scope: s,
  });
}
