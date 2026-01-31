/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Text, Box } from 'ink';
import { useTranslation } from 'react-i18next';
import { theme } from '../../semantic-colors.js';

interface ModelMessageProps {
  model: string;
}

export const ModelMessage: React.FC<ModelMessageProps> = ({ model }) => (
  <Box marginLeft={2}>
    <ModelMessageContent model={model} />
  </Box>
);

const ModelMessageContent: React.FC<ModelMessageProps> = ({ model }) => {
  const { t } = useTranslation('common');
  return (
    <Text color={theme.ui.comment} italic>
      {t('modelRespondingWith', { model })}
    </Text>
  );
};
