/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Box, Text } from 'ink';
import { useTranslation } from 'react-i18next';
import { theme } from '../semantic-colors.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { runExitCleanup } from '../../utils/cleanup.js';
import { RELAUNCH_EXIT_CODE } from '../../utils/processUtils.js';

interface LoginWithGoogleRestartDialogProps {
  onDismiss: () => void;
}

export const LoginWithGoogleRestartDialog = ({
  onDismiss,
}: LoginWithGoogleRestartDialogProps) => {
  const { t } = useTranslation('auth');
  useKeypress(
    (key) => {
      if (key.name === 'escape') {
        onDismiss();
      } else if (key.name === 'r' || key.name === 'R') {
        setTimeout(async () => {
          await runExitCleanup();
          process.exit(RELAUNCH_EXIT_CODE);
        }, 100);
      }
    },
    { isActive: true },
  );

  const message = t('loginWithGoogleRestart.message');

  return (
    <Box borderStyle="round" borderColor={theme.status.warning} paddingX={1}>
      <Text color={theme.status.warning}>
        {message} {t('loginWithGoogleRestart.helpText')}
      </Text>
    </Box>
  );
};
