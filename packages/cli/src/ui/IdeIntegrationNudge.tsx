/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { IdeInfo } from '@google/gemini-cli-core';
import { Box, Text } from 'ink';
import type { RadioSelectItem } from './components/shared/RadioButtonSelect.js';
import { RadioButtonSelect } from './components/shared/RadioButtonSelect.js';
import { useKeypress } from './hooks/useKeypress.js';
import { useTranslation } from 'react-i18next';
import { theme } from './semantic-colors.js';

export type IdeIntegrationNudgeResult = {
  userSelection: 'yes' | 'no' | 'dismiss';
  isExtensionPreInstalled: boolean;
};

interface IdeIntegrationNudgeProps {
  ide: IdeInfo;
  onComplete: (result: IdeIntegrationNudgeResult) => void;
}

export function IdeIntegrationNudge({
  ide,
  onComplete,
}: IdeIntegrationNudgeProps) {
  const { t } = useTranslation('dialogs');
  useKeypress(
    (key) => {
      if (key.name === 'escape') {
        onComplete({
          userSelection: 'no',
          isExtensionPreInstalled: false,
        });
      }
    },
    { isActive: true },
  );

  const { displayName: ideName } = ide;
  const editorName = ideName ?? t('ideIntegrationNudge.defaultEditor');
  // Assume extension is already installed if the env variables are set.
  const isExtensionPreInstalled =
    !!process.env['GEMINI_CLI_IDE_SERVER_PORT'] &&
    !!process.env['GEMINI_CLI_IDE_WORKSPACE_PATH'];

  const OPTIONS: Array<RadioSelectItem<IdeIntegrationNudgeResult>> = [
    {
      label: t('ideIntegrationNudge.options.yes'),
      value: {
        userSelection: 'yes',
        isExtensionPreInstalled,
      },
      key: 'yes',
    },
    {
      label: t('ideIntegrationNudge.options.noEsc'),
      value: {
        userSelection: 'no',
        isExtensionPreInstalled,
      },
      key: 'noEsc',
    },
    {
      label: t('ideIntegrationNudge.options.noDontAskAgain'),
      value: {
        userSelection: 'dismiss',
        isExtensionPreInstalled,
      },
      key: 'dismiss',
    },
  ];

  const installText = isExtensionPreInstalled
    ? t('ideIntegrationNudge.descriptionInstalled', { editor: editorName })
    : t('ideIntegrationNudge.descriptionInstall', { editor: editorName });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.status.warning}
      padding={1}
      width="100%"
      marginLeft={1}
    >
      <Box marginBottom={1} flexDirection="column">
        <Text>
          <Text color={theme.status.warning}>{'> '}</Text>
          {t('ideIntegrationNudge.title', { editor: editorName })}
        </Text>
        <Text color={theme.text.secondary}>{installText}</Text>
      </Box>
      <RadioButtonSelect items={OPTIONS} onSelect={onComplete} />
    </Box>
  );
}
