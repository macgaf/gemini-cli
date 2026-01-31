/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import type { Config } from '@google/gemini-cli-core';
import { loadTrustedFolders } from '../../config/trustedFolders.js';
import { expandHomeDir } from '../utils/directoryUtils.js';
import {
  debugLogger,
  refreshServerHierarchicalMemory,
} from '@google/gemini-cli-core';
import { MultiFolderTrustDialog } from '../components/MultiFolderTrustDialog.js';
import type { UseHistoryManagerReturn } from './useHistoryManager.js';
import { MessageType, type HistoryItem } from '../types.js';
import { i18n } from '../../i18n/index.js';

async function finishAddingDirectories(
  config: Config,
  addItem: (
    itemData: Omit<HistoryItem, 'id'>,
    baseTimestamp?: number,
  ) => number,
  added: string[],
  errors: string[],
) {
  if (!config) {
    addItem({
      type: MessageType.ERROR,
      text: i18n.t('commands:directory.configNotAvailable'),
    });
    return;
  }

  try {
    if (config.shouldLoadMemoryFromIncludeDirectories()) {
      await refreshServerHierarchicalMemory(config);
    }
  } catch (error) {
    errors.push(
      i18n.t('commands:directory.errorRefreshingMemory', {
        error: (error as Error).message,
      }),
    );
  }

  if (added.length > 0) {
    const gemini = config.getGeminiClient();
    if (gemini) {
      await gemini.addDirectoryContext();
    }
  }

  if (errors.length > 0) {
    addItem({ type: MessageType.ERROR, text: errors.join('\n') });
  }
}

export function useIncludeDirsTrust(
  config: Config,
  isTrustedFolder: boolean | undefined,
  historyManager: UseHistoryManagerReturn,
  setCustomDialog: (dialog: React.ReactNode | null) => void,
) {
  const { addItem } = historyManager;

  useEffect(() => {
    // Don't run this until the initial trust is determined.
    if (isTrustedFolder === undefined || !config) {
      return;
    }

    const pendingDirs = config.getPendingIncludeDirectories();
    if (pendingDirs.length === 0) {
      return;
    }

    // If folder trust is disabled, isTrustedFolder will be undefined.
    // In that case, or if the user decided not to trust the main folder,
    // we can just add the directories without checking them.
    if (config.getFolderTrust() === false || isTrustedFolder === false) {
      const added: string[] = [];
      const errors: string[] = [];
      const workspaceContext = config.getWorkspaceContext();
      for (const pathToAdd of pendingDirs) {
        try {
          workspaceContext.addDirectory(expandHomeDir(pathToAdd.trim()));
          added.push(pathToAdd.trim());
        } catch (e) {
          const error = e as Error;
          errors.push(
            i18n.t('commands:directory.errorAdding', {
              path: pathToAdd.trim(),
              error: error.message,
            }),
          );
        }
      }

      if (added.length > 0 || errors.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        finishAddingDirectories(config, addItem, added, errors);
      }
      config.clearPendingIncludeDirectories();
      return;
    }

    const trustedFolders = loadTrustedFolders();
    const untrustedDirs: string[] = [];
    const undefinedTrustDirs: string[] = [];
    const trustedDirs: string[] = [];
    const added: string[] = [];
    const errors: string[] = [];

    for (const pathToAdd of pendingDirs) {
      const expandedPath = expandHomeDir(pathToAdd.trim());
      const isTrusted = trustedFolders.isPathTrusted(expandedPath);
      if (isTrusted === false) {
        untrustedDirs.push(pathToAdd.trim());
      } else if (isTrusted === undefined) {
        undefinedTrustDirs.push(pathToAdd.trim());
      } else {
        trustedDirs.push(pathToAdd.trim());
      }
    }

    if (untrustedDirs.length > 0) {
      errors.push(
        `${i18n.t('commands:directory.untrustedDirs')}\n- ${untrustedDirs.join(
          '\n- ',
        )}\n${i18n.t('commands:directory.usePermissionsCommand')}`,
      );
    }

    const workspaceContext = config.getWorkspaceContext();
    for (const pathToAdd of trustedDirs) {
      try {
        workspaceContext.addDirectory(expandHomeDir(pathToAdd));
        added.push(pathToAdd);
      } catch (e) {
        const error = e as Error;
        errors.push(
          i18n.t('commands:directory.errorAdding', {
            path: pathToAdd,
            error: error.message,
          }),
        );
      }
    }

    if (undefinedTrustDirs.length > 0) {
      debugLogger.log(
        'Creating custom dialog with undecidedDirs:',
        undefinedTrustDirs,
      );
      setCustomDialog(
        <MultiFolderTrustDialog
          folders={undefinedTrustDirs}
          onComplete={() => {
            setCustomDialog(null);
            config.clearPendingIncludeDirectories();
          }}
          trustedDirs={added}
          errors={errors}
          finishAddingDirectories={finishAddingDirectories}
          config={config}
          addItem={addItem}
        />,
      );
    } else if (added.length > 0 || errors.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      finishAddingDirectories(config, addItem, added, errors);
      config.clearPendingIncludeDirectories();
    }
  }, [isTrustedFolder, config, addItem, setCustomDialog]);
}
