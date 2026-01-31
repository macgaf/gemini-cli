/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MCPServerConfig } from '@google/gemini-cli-core';
import { MCPServerStatus } from '@google/gemini-cli-core';
import { Box, Text } from 'ink';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_MCP_RESOURCES_TO_SHOW } from '../../constants.js';
import { theme } from '../../semantic-colors.js';
import type {
  HistoryItemMcpStatus,
  JsonMcpPrompt,
  JsonMcpResource,
  JsonMcpTool,
} from '../../types.js';

interface McpStatusProps {
  servers: Record<string, MCPServerConfig>;
  tools: JsonMcpTool[];
  prompts: JsonMcpPrompt[];
  resources: JsonMcpResource[];
  blockedServers: Array<{ name: string; extensionName: string }>;
  serverStatus: (serverName: string) => MCPServerStatus;
  authStatus: HistoryItemMcpStatus['authStatus'];
  discoveryInProgress: boolean;
  connectingServers: string[];
  showDescriptions: boolean;
  showSchema: boolean;
}

export const McpStatus: React.FC<McpStatusProps> = ({
  servers,
  tools,
  prompts,
  resources,
  blockedServers,
  serverStatus,
  authStatus,
  discoveryInProgress,
  connectingServers,
  showDescriptions,
  showSchema,
}) => {
  const { t } = useTranslation('common');
  const serverNames = Object.keys(servers);

  if (serverNames.length === 0 && blockedServers.length === 0) {
    return (
      <Box flexDirection="column">
        <Text>{t('mcp.noServersConfigured')}</Text>
        <Text>
          {t('mcp.viewDocs')}{' '}
          <Text color={theme.text.link}>
            https://goo.gle/gemini-cli-docs-mcp
          </Text>{' '}
          {t('mcp.orUseDocs')}
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {discoveryInProgress && (
        <Box flexDirection="column" marginBottom={1}>
          <Text color={theme.status.warning}>
            {t('mcp.serversStartingUp')} (
            {t('mcp.initializing', { count: connectingServers.length })})...
          </Text>
          <Text color={theme.text.primary}>{t('mcp.firstStartupNote')}</Text>
        </Box>
      )}

      <Text bold>{t('mcp.configuredServers')}</Text>
      <Box height={1} />

      {serverNames.map((serverName) => {
        const server = servers[serverName];
        const serverTools = tools.filter(
          (tool) => tool.serverName === serverName,
        );
        const serverPrompts = prompts.filter(
          (prompt) => prompt.serverName === serverName,
        );
        const serverResources = resources.filter(
          (resource) => resource.serverName === serverName,
        );
        const originalStatus = serverStatus(serverName);
        const hasCachedItems =
          serverTools.length > 0 ||
          serverPrompts.length > 0 ||
          serverResources.length > 0;
        const status =
          originalStatus === MCPServerStatus.DISCONNECTED && hasCachedItems
            ? MCPServerStatus.CONNECTED
            : originalStatus;

        let statusIndicator = '';
        let statusText = '';
        let statusColor = theme.text.primary;

        switch (status) {
          case MCPServerStatus.CONNECTED:
            statusIndicator = '🟢';
            statusText = t('mcp.ready');
            statusColor = theme.status.success;
            break;
          case MCPServerStatus.CONNECTING:
            statusIndicator = '🔄';
            statusText = t('mcp.starting');
            statusColor = theme.status.warning;
            break;
          case MCPServerStatus.DISCONNECTED:
          default:
            statusIndicator = '🔴';
            statusText = t('mcp.disconnected');
            statusColor = theme.status.error;
            break;
        }

        let serverDisplayName = serverName;
        if (server.extension?.name) {
          serverDisplayName += ` (${t('mcp.fromExtension', { name: server.extension?.name })})`;
        }

        const toolCount = serverTools.length;
        const promptCount = serverPrompts.length;
        const resourceCount = serverResources.length;
        const parts = [];
        if (toolCount > 0) {
          const key = toolCount === 1 ? 'mcp.tool' : 'mcp.toolPlural';
          parts.push(t(key, { count: toolCount }));
        }
        if (promptCount > 0) {
          const key = promptCount === 1 ? 'mcp.prompt' : 'mcp.promptPlural';
          parts.push(t(key, { count: promptCount }));
        }
        if (resourceCount > 0) {
          const key =
            resourceCount === 1 ? 'mcp.resource' : 'mcp.resourcePlural';
          parts.push(t(key, { count: resourceCount }));
        }

        const serverAuthStatus = authStatus[serverName];
        let authStatusNode: React.ReactNode = null;
        if (serverAuthStatus === 'authenticated') {
          authStatusNode = <Text> ({t('mcp.oauthLabel')})</Text>;
        } else if (serverAuthStatus === 'expired') {
          authStatusNode = (
            <Text color={theme.status.error}> ({t('mcp.oauthExpired')})</Text>
          );
        } else if (serverAuthStatus === 'unauthenticated') {
          authStatusNode = (
            <Text color={theme.status.warning}>
              {' '}
              ({t('mcp.oauthNotAuthenticated')})
            </Text>
          );
        }

        return (
          <Box key={serverName} flexDirection="column" marginBottom={1}>
            <Box>
              <Text color={statusColor}>{statusIndicator} </Text>
              <Text bold>{serverDisplayName}</Text>
              <Text>
                {' - '}
                {statusText}
                {status === MCPServerStatus.CONNECTED &&
                  parts.length > 0 &&
                  ` (${parts.join(', ')})`}
              </Text>
              {authStatusNode}
            </Box>
            {status === MCPServerStatus.CONNECTING && (
              <Text> ({t('mcp.toolsWillAppear')})</Text>
            )}
            {status === MCPServerStatus.DISCONNECTED && toolCount > 0 && (
              <Text> ({t('mcp.toolsCached', { count: toolCount })})</Text>
            )}

            {showDescriptions && server?.description && (
              <Text color={theme.text.secondary}>
                {server.description.trim()}
              </Text>
            )}

            {serverTools.length > 0 && (
              <Box flexDirection="column" marginLeft={2}>
                <Text color={theme.text.primary}>{t('mcp.tools')}</Text>
                {serverTools.map((tool) => {
                  const schemaContent =
                    showSchema &&
                    tool.schema &&
                    (tool.schema.parametersJsonSchema || tool.schema.parameters)
                      ? JSON.stringify(
                          tool.schema.parametersJsonSchema ??
                            tool.schema.parameters,
                          null,
                          2,
                        )
                      : null;

                  return (
                    <Box key={tool.name} flexDirection="column">
                      <Text>
                        - <Text color={theme.text.primary}>{tool.name}</Text>
                      </Text>
                      {showDescriptions && tool.description && (
                        <Box marginLeft={2}>
                          <Text color={theme.text.secondary}>
                            {tool.description.trim()}
                          </Text>
                        </Box>
                      )}
                      {schemaContent && (
                        <Box flexDirection="column" marginLeft={4}>
                          <Text color={theme.text.secondary}>
                            {t('mcp.parameters')}
                          </Text>
                          <Text color={theme.text.secondary}>
                            {schemaContent}
                          </Text>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}

            {serverPrompts.length > 0 && (
              <Box flexDirection="column" marginLeft={2}>
                <Text color={theme.text.primary}>{t('mcp.prompts')}</Text>
                {serverPrompts.map((prompt) => (
                  <Box key={prompt.name} flexDirection="column">
                    <Text>
                      - <Text color={theme.text.primary}>{prompt.name}</Text>
                    </Text>
                    {showDescriptions && prompt.description && (
                      <Box marginLeft={2}>
                        <Text color={theme.text.primary}>
                          {prompt.description.trim()}
                        </Text>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {serverResources.length > 0 && (
              <Box flexDirection="column" marginLeft={2}>
                <Text color={theme.text.primary}>{t('mcp.resources')}</Text>
                {serverResources
                  .slice(0, MAX_MCP_RESOURCES_TO_SHOW)
                  .map((resource, index) => {
                    const label =
                      resource.name ||
                      resource.uri ||
                      t('mcp.resourceFallback');
                    return (
                      <Box
                        key={`${resource.serverName}-resource-${index}`}
                        flexDirection="column"
                      >
                        <Text>
                          - <Text color={theme.text.primary}>{label}</Text>
                          {resource.uri ? ` (${resource.uri})` : ''}
                          {resource.mimeType ? ` [${resource.mimeType}]` : ''}
                        </Text>
                        {showDescriptions && resource.description && (
                          <Box marginLeft={2}>
                            <Text color={theme.text.secondary}>
                              {resource.description.trim()}
                            </Text>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                {serverResources.length > MAX_MCP_RESOURCES_TO_SHOW && (
                  <Text color={theme.text.secondary}>
                    {'  '}...{' '}
                    {t(
                      serverResources.length - MAX_MCP_RESOURCES_TO_SHOW === 1
                        ? 'mcp.resourcesHidden'
                        : 'mcp.resourcesHiddenPlural',
                      {
                        count:
                          serverResources.length - MAX_MCP_RESOURCES_TO_SHOW,
                      },
                    )}
                  </Text>
                )}
              </Box>
            )}
          </Box>
        );
      })}

      {blockedServers.map((server) => (
        <Box key={server.name} marginBottom={1}>
          <Text color={theme.status.error}>🔴 </Text>
          <Text bold>
            {server.name}
            {server.extensionName
              ? ` (${t('mcp.fromExtension', { name: server.extensionName })})`
              : ''}
          </Text>
          <Text> - {t('mcp.blocked')}</Text>
        </Box>
      ))}
    </Box>
  );
};
