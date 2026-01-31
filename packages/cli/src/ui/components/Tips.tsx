/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Box, Text } from 'ink';
import { useTranslation } from 'react-i18next';
import { theme } from '../semantic-colors.js';
import { type Config } from '@google/gemini-cli-core';

interface TipsProps {
  config: Config;
}

export const Tips: React.FC<TipsProps> = ({ config }) => {
  const { t } = useTranslation('tips');
  const geminiMdFileCount = config.getGeminiMdFileCount();
  return (
    <Box flexDirection="column">
      <Text color={theme.text.primary}>{t('gettingStarted.title')}</Text>
      <Text color={theme.text.primary}>1. {t('gettingStarted.tip1')}</Text>
      <Text color={theme.text.primary}>2. {t('gettingStarted.tip2')}</Text>
      {geminiMdFileCount === 0 && (
        <Text color={theme.text.primary}>
          3. {t('gettingStarted.tip3Prefix')}{' '}
          <Text bold color={theme.text.accent}>
            GEMINI.md
          </Text>{' '}
          {t('gettingStarted.tip3Suffix')}
        </Text>
      )}
      <Text color={theme.text.primary}>
        {geminiMdFileCount === 0 ? '4.' : '3.'}{' '}
        <Text bold color={theme.text.accent}>
          /help
        </Text>{' '}
        {t('gettingStarted.tip4Suffix')}
      </Text>
    </Box>
  );
};
