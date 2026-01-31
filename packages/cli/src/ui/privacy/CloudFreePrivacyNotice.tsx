/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Box, Newline, Text } from 'ink';
import { useTranslation } from 'react-i18next';
import { RadioButtonSelect } from '../components/shared/RadioButtonSelect.js';
import { usePrivacySettings } from '../hooks/usePrivacySettings.js';

import type { Config } from '@google/gemini-cli-core';
import { theme } from '../semantic-colors.js';
import { useKeypress } from '../hooks/useKeypress.js';

interface CloudFreePrivacyNoticeProps {
  config: Config;
  onExit: () => void;
}

export const CloudFreePrivacyNotice = ({
  config,
  onExit,
}: CloudFreePrivacyNoticeProps) => {
  const { t } = useTranslation(['privacy', 'dialogs']);
  const { privacyState, updateDataCollectionOptIn } =
    usePrivacySettings(config);

  useKeypress(
    (key) => {
      if (
        (privacyState.error || privacyState.isFreeTier === false) &&
        key.name === 'escape'
      ) {
        onExit();
      }
    },
    { isActive: true },
  );

  if (privacyState.isLoading) {
    return (
      <Text color={theme.text.secondary}>{t('dialogs:common.loading')}</Text>
    );
  }

  if (privacyState.error) {
    return (
      <Box flexDirection="column" marginY={1}>
        <Text color={theme.status.error}>
          {t('privacy:cloudFree.errorLoading', { error: privacyState.error })}
        </Text>
        <Text color={theme.text.secondary}>
          {t('privacy:common.pressEscToExit')}
        </Text>
      </Box>
    );
  }

  if (privacyState.isFreeTier === false) {
    return (
      <Box flexDirection="column" marginY={1}>
        <Text bold color={theme.text.accent}>
          {t('privacy:codeAssist.title')}
        </Text>
        <Newline />
        <Text>
          https://developers.google.com/gemini-code-assist/resources/privacy-notices
        </Text>
        <Newline />
        <Text color={theme.text.secondary}>
          {t('privacy:common.pressEscToExit')}
        </Text>
      </Box>
    );
  }

  const items = [
    { label: t('dialogs:common.yes'), value: true, key: 'true' },
    { label: t('dialogs:common.no'), value: false, key: 'false' },
  ];

  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold color={theme.text.accent}>
        {t('privacy:cloudFree.title')}
      </Text>
      <Newline />
      <Text color={theme.text.primary}>
        {t('privacy:cloudFree.description1')}
        <Text color={theme.text.link}>[1]</Text>
        {t('privacy:cloudFree.description2')}
      </Text>
      <Newline />
      <Text color={theme.text.primary}>
        {t('privacy:cloudFree.dataCollection')}
      </Text>
      <Newline />
      <Text color={theme.text.primary}>
        {t('privacy:cloudFree.humanReviewers')}
      </Text>
      <Newline />
      <Box flexDirection="column">
        <Text color={theme.text.primary}>
          {t('privacy:cloudFree.allowDataUse')}
        </Text>
        <RadioButtonSelect
          items={items}
          initialIndex={privacyState.dataCollectionOptIn ? 0 : 1}
          onSelect={(value) => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            updateDataCollectionOptIn(value);
            // Only exit if there was no error.
            if (!privacyState.error) {
              onExit();
            }
          }}
        />
      </Box>
      <Newline />
      <Text>
        <Text color={theme.text.link}>[1]</Text>{' '}
        https://policies.google.com/privacy
      </Text>
      <Newline />
      <Text color={theme.text.secondary}>
        {t('privacy:cloudFree.pressEnterToChoose')}
      </Text>
    </Box>
  );
};
