/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Box, Text } from 'ink';
import { useTranslation } from 'react-i18next';
import type React from 'react';
import { useMemo } from 'react';
import { theme } from '../semantic-colors.js';
import { RadioButtonSelect } from './shared/RadioButtonSelect.js';
import type { RadioSelectItem } from './shared/RadioButtonSelect.js';
import type { FileChangeStats } from '../utils/rewindFileOps.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { formatTimeAgo } from '../utils/formatters.js';
import { keyMatchers, Command } from '../keyMatchers.js';

export enum RewindOutcome {
  RewindAndRevert = 'rewind_and_revert',
  RewindOnly = 'rewind_only',
  RevertOnly = 'revert_only',
  Cancel = 'cancel',
}

interface RewindConfirmationProps {
  stats: FileChangeStats | null;
  onConfirm: (outcome: RewindOutcome) => void;
  terminalWidth: number;
  timestamp?: string;
}

export const RewindConfirmation: React.FC<RewindConfirmationProps> = ({
  stats,
  onConfirm,
  terminalWidth,
  timestamp,
}) => {
  const { t } = useTranslation('dialogs');
  useKeypress(
    (key) => {
      if (keyMatchers[Command.ESCAPE](key)) {
        onConfirm(RewindOutcome.Cancel);
      }
    },
    { isActive: true },
  );

  const handleSelect = (outcome: RewindOutcome) => {
    onConfirm(outcome);
  };

  const options = useMemo(() => {
    const rewindOptions: Array<RadioSelectItem<RewindOutcome>> = [
      {
        label: t('rewind.options.rewindAndRevert'),
        value: RewindOutcome.RewindAndRevert,
        key: 'rewind-and-revert',
      },
      {
        label: t('rewind.options.rewindOnly'),
        value: RewindOutcome.RewindOnly,
        key: 'rewind-only',
      },
      {
        label: t('rewind.options.revertOnly'),
        value: RewindOutcome.RevertOnly,
        key: 'revert-only',
      },
      {
        label: t('rewind.options.cancel'),
        value: RewindOutcome.Cancel,
        key: 'cancel',
      },
    ];
    if (stats) {
      return rewindOptions;
    }
    return rewindOptions.filter(
      (option) =>
        option.value !== RewindOutcome.RewindAndRevert &&
        option.value !== RewindOutcome.RevertOnly,
    );
  }, [stats, t]);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.border.default}
      padding={1}
      width={terminalWidth}
    >
      <Box marginBottom={1}>
        <Text bold>{t('rewind.title')}</Text>
      </Box>

      {stats && (
        <Box
          flexDirection="column"
          marginBottom={1}
          borderStyle="single"
          borderColor={theme.border.default}
          paddingX={1}
        >
          <Text color={theme.text.primary}>
            {stats.fileCount === 1
              ? t('rewind.fileSingle', {
                  file: stats.details?.at(0)?.fileName,
                })
              : t('rewind.filesAffected', { count: stats.fileCount })}
          </Text>
          <Box flexDirection="row">
            <Text color={theme.status.success}>
              {t('rewind.linesAdded', { count: stats.addedLines })}{' '}
            </Text>
            <Text color={theme.status.error}>
              {t('rewind.linesRemoved', { count: stats.removedLines })}
            </Text>
            {timestamp && (
              <Text color={theme.text.secondary}>
                {' '}
                ({formatTimeAgo(timestamp)})
              </Text>
            )}
          </Box>
          <Box marginTop={1}>
            <Text color={theme.status.warning}>{t('rewind.notice')}</Text>
          </Box>
        </Box>
      )}

      {!stats && (
        <Box marginBottom={1}>
          <Text color={theme.text.secondary}>{t('rewind.noChanges')}</Text>
          {timestamp && (
            <Text color={theme.text.secondary}>
              {' '}
              ({formatTimeAgo(timestamp)})
            </Text>
          )}
        </Box>
      )}

      <Box marginBottom={1}>
        <Text>{t('rewind.selectAction')}</Text>
      </Box>

      <RadioButtonSelect
        items={options}
        onSelect={handleSelect}
        isFocused={true}
      />
    </Box>
  );
};
