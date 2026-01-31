/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Box, Text } from 'ink';
import { useUIState } from '../../contexts/UIStateContext.js';
import { ExtensionUpdateState } from '../../state/extensions.js';
import { debugLogger, type GeminiCLIExtension } from '@google/gemini-cli-core';
import { useTranslation } from 'react-i18next';

interface ExtensionsList {
  extensions: readonly GeminiCLIExtension[];
}

export const ExtensionsList: React.FC<ExtensionsList> = ({ extensions }) => {
  const { t } = useTranslation('commands');
  const { extensionsUpdateState } = useUIState();

  if (extensions.length === 0) {
    return <Text>{t('extensions.list.empty')}</Text>;
  }

  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      <Text>{t('extensions.list.installedTitle')}</Text>
      <Box flexDirection="column" paddingLeft={2}>
        {extensions.map((ext) => {
          const state = extensionsUpdateState.get(ext.name);
          const isActive = ext.isActive;
          const activeString = isActive
            ? t('extensions.list.status.active')
            : t('extensions.list.status.disabled');
          const activeColor = isActive ? 'green' : 'grey';

          let stateColor = 'gray';
          const stateLabelMap: Partial<Record<ExtensionUpdateState, string>> = {
            [ExtensionUpdateState.CHECKING_FOR_UPDATES]: t(
              'extensions.list.updateState.checkingForUpdates',
            ),
            [ExtensionUpdateState.UPDATING]: t(
              'extensions.list.updateState.updating',
            ),
            [ExtensionUpdateState.UPDATE_AVAILABLE]: t(
              'extensions.list.updateState.updateAvailable',
            ),
            [ExtensionUpdateState.UPDATED_NEEDS_RESTART]: t(
              'extensions.list.updateState.updatedNeedsRestart',
            ),
            [ExtensionUpdateState.UP_TO_DATE]: t(
              'extensions.list.updateState.upToDate',
            ),
            [ExtensionUpdateState.NOT_UPDATABLE]: t(
              'extensions.list.updateState.notUpdatable',
            ),
            [ExtensionUpdateState.UPDATED]: t(
              'extensions.list.updateState.updated',
            ),
            [ExtensionUpdateState.ERROR]: t(
              'extensions.list.updateState.error',
            ),
            [ExtensionUpdateState.UNKNOWN]: t(
              'extensions.list.updateState.unknown',
            ),
          };
          const stateText =
            stateLabelMap[state as ExtensionUpdateState] ??
            t('extensions.list.updateState.unknown');

          switch (state) {
            case ExtensionUpdateState.CHECKING_FOR_UPDATES:
            case ExtensionUpdateState.UPDATING:
              stateColor = 'cyan';
              break;
            case ExtensionUpdateState.UPDATE_AVAILABLE:
            case ExtensionUpdateState.UPDATED_NEEDS_RESTART:
              stateColor = 'yellow';
              break;
            case ExtensionUpdateState.ERROR:
              stateColor = 'red';
              break;
            case ExtensionUpdateState.UP_TO_DATE:
            case ExtensionUpdateState.NOT_UPDATABLE:
            case ExtensionUpdateState.UPDATED:
              stateColor = 'green';
              break;
            case undefined:
              break;
            default:
              debugLogger.warn(`Unhandled ExtensionUpdateState ${state}`);
              break;
          }

          return (
            <Box key={ext.name} flexDirection="column" marginBottom={1}>
              <Text>
                <Text color="cyan">{`${ext.name} (v${ext.version})`}</Text>
                <Text color={activeColor}>{` - ${activeString}`}</Text>
                {<Text color={stateColor}>{` (${stateText})`}</Text>}
              </Text>
              {ext.resolvedSettings && ext.resolvedSettings.length > 0 && (
                <Box flexDirection="column" paddingLeft={2}>
                  <Text>{t('extensions.list.settingsLabel')}</Text>
                  {ext.resolvedSettings.map((setting) => (
                    <Text key={setting.name}>
                      - {setting.name}: {setting.value}
                      {setting.scope && (
                        <Text color="gray">
                          {' '}
                          (
                          {setting.scope.charAt(0).toUpperCase() +
                            setting.scope.slice(1)}
                          {setting.source ? ` - ${setting.source}` : ''})
                        </Text>
                      )}
                    </Text>
                  ))}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
