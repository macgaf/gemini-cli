/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Text } from 'ink';
import { useTranslation } from 'react-i18next';
import { theme } from '../semantic-colors.js';
import { tokenLimit } from '@google/gemini-cli-core';

export const ContextUsageDisplay = ({
  promptTokenCount,
  model,
  terminalWidth,
}: {
  promptTokenCount: number;
  model: string;
  terminalWidth: number;
}) => {
  const { t } = useTranslation('common');
  const percentage = promptTokenCount / tokenLimit(model);
  const percentageLeft = ((1 - percentage) * 100).toFixed(0);

  const label = terminalWidth < 100 ? '%' : t('footer.contextLeft');

  return (
    <Text color={theme.text.secondary}>
      ({percentageLeft}
      {label})
    </Text>
  );
};
