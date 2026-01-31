/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Box, Text } from 'ink';
import { useTranslation } from 'react-i18next';
import { theme } from '../semantic-colors.js';
import { type SlashCommand, CommandKind } from '../commands/types.js';
import { KEYBOARD_SHORTCUTS_URL } from '../constants.js';

interface Help {
  commands: readonly SlashCommand[];
}

export const Help: React.FC<Help> = ({ commands }) => {
  const { t } = useTranslation(['commands', 'keyboard']);

  return (
    <Box
      flexDirection="column"
      marginBottom={1}
      borderColor={theme.border.default}
      borderStyle="round"
      padding={1}
    >
      {/* Basics */}
      <Text bold color={theme.text.primary}>
        {t('commands:help.sections.basics')}
      </Text>
      <Text color={theme.text.primary}>
        <Text bold color={theme.text.accent}>
          {t('commands:help.sections.addContext')}
        </Text>
        : {t('commands:help.sections.addContextPrefix')}
        <Text bold color={theme.text.accent}>
          @
        </Text>
        {t('commands:help.sections.addContextMiddle')}
        <Text bold color={theme.text.accent}>
          @src/myFile.ts
        </Text>
        {t('commands:help.sections.addContextSuffix')}
      </Text>
      <Text color={theme.text.primary}>
        <Text bold color={theme.text.accent}>
          {t('commands:help.sections.shellMode')}
        </Text>
        : {t('commands:help.sections.shellModePrefix')}
        <Text bold color={theme.text.accent}>
          !
        </Text>
        {t('commands:help.sections.shellModeMiddle1')}
        <Text bold color={theme.text.accent}>
          !npm run start
        </Text>
        {t('commands:help.sections.shellModeMiddle2')}
        <Text bold color={theme.text.accent}>
          {t('commands:help.sections.shellModeExample')}
        </Text>
        {t('commands:help.sections.shellModeSuffix')}
      </Text>

      <Box height={1} />

      {/* Commands */}
      <Text bold color={theme.text.primary}>
        {t('commands:help.sections.commands')}
      </Text>
      {commands
        .filter((command) => command.description && !command.hidden)
        .map((command: SlashCommand) => (
          <Box key={command.name} flexDirection="column">
            <Text color={theme.text.primary}>
              <Text bold color={theme.text.accent}>
                {' '}
                /{command.name}
              </Text>
              {command.kind === CommandKind.MCP_PROMPT && (
                <Text color={theme.text.secondary}> [MCP]</Text>
              )}
              {command.description && ' - ' + command.description}
            </Text>
            {command.subCommands &&
              command.subCommands
                .filter((subCommand) => !subCommand.hidden)
                .map((subCommand) => (
                  <Text key={subCommand.name} color={theme.text.primary}>
                    <Text bold color={theme.text.accent}>
                      {'   '}
                      {subCommand.name}
                    </Text>
                    {subCommand.description && ' - ' + subCommand.description}
                  </Text>
                ))}
          </Box>
        ))}
      <Text color={theme.text.primary}>
        <Text bold color={theme.text.accent}>
          {' '}
          !{' '}
        </Text>
        - {t('commands:help.sections.shellCommand')}
      </Text>
      <Text color={theme.text.primary}>
        <Text color={theme.text.secondary}>[MCP]</Text> -{' '}
        {t('commands:help.sections.mcpNote').replace('[MCP] - ', '')}
      </Text>

      <Box height={1} />

      {/* Shortcuts */}
      <Text bold color={theme.text.primary}>
        {t('commands:help.sections.shortcuts')}
      </Text>
      <Text color={theme.text.primary}>
        <Text bold color={theme.text.accent}>
          Alt+Left/Right
        </Text>{' '}
        - {t('keyboard:shortcuts.jumpWords')}
      </Text>
      <Text color={theme.text.primary}>
        <Text bold color={theme.text.accent}>
          Ctrl+C
        </Text>{' '}
        - {t('keyboard:shortcuts.quit')}
      </Text>
      <Text color={theme.text.primary}>
        <Text bold color={theme.text.accent}>
          {process.platform === 'win32' ? 'Ctrl+Enter' : 'Ctrl+J'}
        </Text>{' '}
        {process.platform === 'linux'
          ? '- ' + t('keyboard:shortcuts.newlineLinux')
          : '- ' + t('keyboard:shortcuts.newline')}
      </Text>
      <Text color={theme.text.primary}>
        <Text bold color={theme.text.accent}>
          Ctrl+L
        </Text>{' '}
        - {t('keyboard:shortcuts.clearScreen')}
      </Text>
      <Text color={theme.text.primary}>
        <Text bold color={theme.text.accent}>
          Ctrl+S
        </Text>{' '}
        - {t('keyboard:shortcuts.selectionMode')}
      </Text>
      <Text color={theme.text.primary}>
        <Text bold color={theme.text.accent}>
          Ctrl+X
        </Text>{' '}
        - {t('keyboard:shortcuts.externalEditor')}
      </Text>
      <Text color={theme.text.primary}>
        <Text bold color={theme.text.accent}>
          Ctrl+Y
        </Text>{' '}
        - {t('keyboard:shortcuts.yoloMode')}
      </Text>
      <Text color={theme.text.primary}>
        <Text bold color={theme.text.accent}>
          Enter
        </Text>{' '}
        - {t('keyboard:shortcuts.sendMessage')}
      </Text>
      <Text color={theme.text.primary}>
        <Text bold color={theme.text.accent}>
          Esc
        </Text>{' '}
        - {t('keyboard:shortcuts.cancelOrClear')}
      </Text>
      <Text color={theme.text.primary}>
        <Text bold color={theme.text.accent}>
          Page Up/Down
        </Text>{' '}
        - {t('keyboard:shortcuts.scrollPage')}
      </Text>
      <Text color={theme.text.primary}>
        <Text bold color={theme.text.accent}>
          Shift+Tab
        </Text>{' '}
        - {t('keyboard:shortcuts.autoAcceptEdits')}
      </Text>
      <Text color={theme.text.primary}>
        <Text bold color={theme.text.accent}>
          Up/Down
        </Text>{' '}
        - {t('keyboard:shortcuts.promptHistory')}
      </Text>
      <Box height={1} />
      <Text color={theme.text.primary}>
        {t('keyboard:shortcuts.fullListSee')}{' '}
        <Text bold color={theme.text.accent}>
          {KEYBOARD_SHORTCUTS_URL}
        </Text>
      </Text>
    </Box>
  );
};
