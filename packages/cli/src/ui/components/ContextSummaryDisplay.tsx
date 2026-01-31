/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Box, Text } from 'ink';
import { useTranslation } from 'react-i18next';
import { theme } from '../semantic-colors.js';
import { type IdeContext, type MCPServerConfig } from '@google/gemini-cli-core';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
import { isNarrowWidth } from '../utils/isNarrowWidth.js';

interface ContextSummaryDisplayProps {
  geminiMdFileCount: number;
  contextFileNames: string[];
  mcpServers?: Record<string, MCPServerConfig>;
  blockedMcpServers?: Array<{ name: string; extensionName: string }>;
  ideContext?: IdeContext;
  skillCount: number;
}

export const ContextSummaryDisplay: React.FC<ContextSummaryDisplayProps> = ({
  geminiMdFileCount,
  contextFileNames,
  mcpServers,
  blockedMcpServers,
  ideContext,
  skillCount,
}) => {
  const { t } = useTranslation('common');
  const { columns: terminalWidth } = useTerminalSize();
  const isNarrow = isNarrowWidth(terminalWidth);
  const mcpServerCount = Object.keys(mcpServers || {}).length;
  const blockedMcpServerCount = blockedMcpServers?.length || 0;
  const openFileCount = ideContext?.workspaceState?.openFiles?.length ?? 0;

  if (
    geminiMdFileCount === 0 &&
    mcpServerCount === 0 &&
    blockedMcpServerCount === 0 &&
    openFileCount === 0 &&
    skillCount === 0
  ) {
    return <Text> </Text>; // Render an empty space to reserve height
  }

  const openFilesText = (() => {
    if (openFileCount === 0) {
      return '';
    }
    const key =
      openFileCount > 1
        ? 'contextSummary.openFilesPlural'
        : 'contextSummary.openFiles';
    return `${t(key, { count: openFileCount })} ${t('contextSummary.openFilesHint')}`;
  })();

  const geminiMdText = (() => {
    if (geminiMdFileCount === 0) {
      return '';
    }
    const allNamesTheSame = new Set(contextFileNames).size < 2;
    const name = allNamesTheSame
      ? contextFileNames[0]
      : t('contextSummary.contextLabel');
    const key =
      geminiMdFileCount > 1
        ? 'contextSummary.contextFilePlural'
        : 'contextSummary.contextFile';
    return t(key, { count: geminiMdFileCount, name });
  })();

  const mcpText = (() => {
    if (mcpServerCount === 0 && blockedMcpServerCount === 0) {
      return '';
    }

    const parts = [];
    if (mcpServerCount > 0) {
      const key =
        mcpServerCount > 1
          ? 'contextSummary.mcpServerPlural'
          : 'contextSummary.mcpServer';
      parts.push(t(key, { count: mcpServerCount }));
    }

    if (blockedMcpServerCount > 0) {
      const key =
        mcpServerCount === 0
          ? 'contextSummary.blockedMcpServerPlural'
          : 'contextSummary.blockedMcpServer';
      parts.push(t(key, { count: blockedMcpServerCount }));
    }
    return parts.join(', ');
  })();

  const skillText = (() => {
    if (skillCount === 0) {
      return '';
    }
    const key =
      skillCount > 1 ? 'contextSummary.skillPlural' : 'contextSummary.skill';
    return t(key, { count: skillCount });
  })();

  const summaryParts = [openFilesText, geminiMdText, mcpText, skillText].filter(
    Boolean,
  );

  if (isNarrow) {
    return (
      <Box flexDirection="column" paddingX={1}>
        {summaryParts.map((part, index) => (
          <Text key={index} color={theme.text.secondary}>
            - {part}
          </Text>
        ))}
      </Box>
    );
  }

  return (
    <Box paddingX={1}>
      <Text color={theme.text.secondary}>{summaryParts.join(' | ')}</Text>
    </Box>
  );
};
