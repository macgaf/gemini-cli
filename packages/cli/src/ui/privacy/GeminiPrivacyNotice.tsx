/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Box, Newline, Text } from 'ink';
import { useTranslation } from 'react-i18next';
import { theme } from '../semantic-colors.js';
import { useKeypress } from '../hooks/useKeypress.js';

interface GeminiPrivacyNoticeProps {
  onExit: () => void;
}

export const GeminiPrivacyNotice = ({ onExit }: GeminiPrivacyNoticeProps) => {
  const { t } = useTranslation('privacy');
  useKeypress(
    (key) => {
      if (key.name === 'escape') {
        onExit();
      }
    },
    { isActive: true },
  );

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text bold color={theme.text.accent}>
        {t('gemini.title')}
      </Text>
      <Newline />
      <Text color={theme.text.primary}>
        {t('gemini.description1')}
        <Text color={theme.text.link}>[1]</Text>
        {t('gemini.description2')}
        <Text color={theme.status.error}>[2]</Text>
        {t('gemini.description3')}
        <Text color={theme.status.success}>[3]</Text>
        {t('gemini.description4')}
        <Text color={theme.text.accent}>[4]</Text>.
      </Text>
      <Newline />
      <Text color={theme.text.primary}>
        <Text color={theme.text.link}>[1]</Text>{' '}
        https://ai.google.dev/docs/gemini_api_overview
      </Text>
      <Text color={theme.text.primary}>
        <Text color={theme.status.error}>[2]</Text> https://aistudio.google.com/
      </Text>
      <Text color={theme.text.primary}>
        <Text color={theme.status.success}>[3]</Text>{' '}
        https://developers.google.com/terms
      </Text>
      <Text color={theme.text.primary}>
        <Text color={theme.text.accent}>[4]</Text>{' '}
        https://ai.google.dev/gemini-api/terms
      </Text>
      <Newline />
      <Text color={theme.text.secondary}>{t('common.pressEscToExit')}</Text>
    </Box>
  );
};
