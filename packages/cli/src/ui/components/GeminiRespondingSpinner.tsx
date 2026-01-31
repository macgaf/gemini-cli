/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Text, useIsScreenReaderEnabled } from 'ink';
import { useTranslation } from 'react-i18next';
import { CliSpinner } from './CliSpinner.js';
import type { SpinnerName } from 'cli-spinners';
import { useStreamingContext } from '../contexts/StreamingContext.js';
import { StreamingState } from '../types.js';
import { theme } from '../semantic-colors.js';

interface GeminiRespondingSpinnerProps {
  /**
   * Optional string to display when not in Responding state.
   * If not provided and not Responding, renders null.
   */
  nonRespondingDisplay?: string;
  spinnerType?: SpinnerName;
}

export const GeminiRespondingSpinner: React.FC<
  GeminiRespondingSpinnerProps
> = ({ nonRespondingDisplay, spinnerType = 'dots' }) => {
  const { t } = useTranslation('common');
  const streamingState = useStreamingContext();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();
  if (streamingState === StreamingState.Responding) {
    return (
      <GeminiSpinner
        spinnerType={spinnerType}
        altText={t('screenReader.responding')}
      />
    );
  } else if (nonRespondingDisplay) {
    return isScreenReaderEnabled ? (
      <Text>{t('screenReader.loading')}</Text>
    ) : (
      <Text color={theme.text.primary}>{nonRespondingDisplay}</Text>
    );
  }
  return null;
};

interface GeminiSpinnerProps {
  spinnerType?: SpinnerName;
  altText?: string;
}

export const GeminiSpinner: React.FC<GeminiSpinnerProps> = ({
  spinnerType = 'dots',
  altText,
}) => {
  const { t } = useTranslation('common');
  const isScreenReaderEnabled = useIsScreenReaderEnabled();
  return isScreenReaderEnabled ? (
    <Text>{altText ?? t('screenReader.loading')}</Text>
  ) : (
    <Text color={theme.text.primary}>
      <CliSpinner type={spinnerType} />
    </Text>
  );
};
