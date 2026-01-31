/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Text, Box } from 'ink';
import { useTranslation } from 'react-i18next';
import { theme } from '../../semantic-colors.js';
import { isSlashCommand as checkIsSlashCommand } from '../../utils/commandUtils.js';
import { useSettings } from '../../contexts/SettingsContext.js';
import { resolveColor } from '../../themes/color-utils.js';

interface UserMessageProps {
  text: string;
  width: number;
}

export const UserMessage: React.FC<UserMessageProps> = ({ text, width }) => {
  const { t } = useTranslation('common');
  const { merged: settings } = useSettings();
  const prefix = '> ';
  const prefixWidth = prefix.length;
  const isSlashCommand = checkIsSlashCommand(text);

  const configuredColor = settings.ui.userMessageColor
    ? resolveColor(settings.ui.userMessageColor)
    : undefined;
  const textColor =
    configuredColor ??
    (isSlashCommand ? theme.text.accent : theme.text.secondary);

  return (
    <Box
      flexDirection="row"
      paddingY={0}
      marginY={1}
      alignSelf="flex-start"
      width={width}
    >
      <Box width={prefixWidth} flexShrink={0}>
        <Text
          color={theme.text.accent}
          aria-label={t('screenReader.userPrefix')}
        >
          {prefix}
        </Text>
      </Box>
      <Box flexGrow={1}>
        <Text wrap="wrap" color={textColor}>
          {text}
        </Text>
      </Box>
    </Box>
  );
};
