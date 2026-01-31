/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Box, Text } from 'ink';
import { theme } from '../../semantic-colors.js';
import { useTranslation } from 'react-i18next';

interface HooksListProps {
  hooks: ReadonlyArray<{
    config: {
      command?: string;
      type: string;
      name?: string;
      description?: string;
      timeout?: number;
    };
    source: string;
    eventName: string;
    matcher?: string;
    sequential?: boolean;
    enabled: boolean;
  }>;
}

export const HooksList: React.FC<HooksListProps> = ({ hooks }) => {
  const { t } = useTranslation('commands');
  const docsUrl = t('hooks.panel.learnMoreUrl');
  const hookNamePlaceholder = t('hooks.panel.hookNamePlaceholder');
  const enableCommand = t('hooks.panel.commands.enable', {
    hookName: hookNamePlaceholder,
  });
  const disableCommand = t('hooks.panel.commands.disable', {
    hookName: hookNamePlaceholder,
  });
  const enableAllCommand = t('hooks.panel.commands.enableAll');
  const disableAllCommand = t('hooks.panel.commands.disableAll');
  if (hooks.length === 0) {
    return (
      <Box flexDirection="column" marginTop={1} marginBottom={1}>
        <Box marginTop={1}>
          <Text>{t('hooks.noHooksConfigured')}</Text>
        </Box>
      </Box>
    );
  }

  // Group hooks by event name for better organization
  const hooksByEvent = hooks.reduce(
    (acc, hook) => {
      if (!acc[hook.eventName]) {
        acc[hook.eventName] = [];
      }
      acc[hook.eventName].push(hook);
      return acc;
    },
    {} as Record<string, Array<(typeof hooks)[number]>>,
  );

  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      <Box marginTop={1} flexDirection="column">
        <Text color={theme.status.warning} bold underline>
          {t('hooks.panel.securityWarningTitle')}
        </Text>
        <Text color={theme.status.warning}>
          {t('hooks.panel.securityWarningBody')}
        </Text>
      </Box>

      <Box marginTop={1}>
        <Text>
          {t('hooks.panel.learnMoreLabel')}{' '}
          <Text color={theme.text.link}>{docsUrl}</Text>
        </Text>
      </Box>

      <Box marginTop={1}>
        <Text bold>{t('hooks.panel.configuredTitle')}</Text>
      </Box>
      <Box flexDirection="column" paddingLeft={2} marginTop={1}>
        {Object.entries(hooksByEvent).map(([eventName, eventHooks]) => (
          <Box key={eventName} flexDirection="column" marginBottom={1}>
            <Text color={theme.text.accent} bold>
              {eventName}:
            </Text>
            <Box flexDirection="column" paddingLeft={2}>
              {eventHooks.map((hook, index) => {
                const hookName =
                  hook.config.name ||
                  hook.config.command ||
                  t('hooks.panel.unknown');
                const statusColor = hook.enabled
                  ? theme.status.success
                  : theme.text.secondary;
                const statusText = hook.enabled
                  ? t('hooks.panel.status.enabled')
                  : t('hooks.panel.status.disabled');

                return (
                  <Box key={`${eventName}-${index}`} flexDirection="column">
                    <Box>
                      <Text>
                        <Text color={theme.text.accent}>{hookName}</Text>
                        <Text color={statusColor}>{` [${statusText}]`}</Text>
                      </Text>
                    </Box>
                    <Box paddingLeft={2} flexDirection="column">
                      {hook.config.description && (
                        <Text italic>{hook.config.description}</Text>
                      )}
                      <Text dimColor>
                        {t('hooks.panel.sourceLabel', {
                          source: hook.source,
                        })}
                        {hook.config.name &&
                          hook.config.command &&
                          ` | ${t('hooks.panel.commandLabel', {
                            command: hook.config.command,
                          })}`}
                        {hook.matcher &&
                          ` | ${t('hooks.panel.matcherLabel', {
                            matcher: hook.matcher,
                          })}`}
                        {hook.sequential &&
                          ` | ${t('hooks.panel.sequentialLabel')}`}
                        {hook.config.timeout &&
                          ` | ${t('hooks.panel.timeoutLabel', {
                            seconds: hook.config.timeout,
                          })}`}
                      </Text>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>
          {t('hooks.panel.tip.prefix')}
          <Text bold>{enableCommand}</Text>
          {t('hooks.panel.tip.or')}
          <Text bold>{disableCommand}</Text>
          {t('hooks.panel.tip.middle')}
          <Text bold>{enableAllCommand}</Text>
          {t('hooks.panel.tip.or')}
          <Text bold>{disableAllCommand}</Text>
          {t('hooks.panel.tip.suffix')}
        </Text>
      </Box>
    </Box>
  );
};
