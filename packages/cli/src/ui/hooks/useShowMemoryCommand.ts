/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Message } from '../types.js';
import { MessageType } from '../types.js';
import { debugLogger, type Config } from '@google/gemini-cli-core';
import type { LoadedSettings } from '../../config/settings.js';
import { i18n } from '../../i18n/index.js';

export function createShowMemoryAction(
  config: Config | null,
  settings: LoadedSettings,
  addMessage: (message: Message) => void,
) {
  return async () => {
    if (!config) {
      addMessage({
        type: MessageType.ERROR,
        content: i18n.t('commands:memory.show.configNotAvailable'),
        timestamp: new Date(),
      });
      return;
    }

    const debugMode = config.getDebugMode();

    if (debugMode) {
      debugLogger.log('[DEBUG] Show Memory command invoked.');
    }

    const currentMemory = config.getUserMemory();
    const fileCount = config.getGeminiMdFileCount();
    const contextFileName = settings.merged.context.fileName;
    const contextFileNames = Array.isArray(contextFileName)
      ? contextFileName
      : [contextFileName];

    if (debugMode) {
      debugLogger.log(
        `[DEBUG] Showing memory. Content from config.getUserMemory() (first 200 chars): ${currentMemory.substring(0, 200)}...`,
      );
      debugLogger.log(`[DEBUG] Number of context files loaded: ${fileCount}`);
    }

    if (fileCount > 0) {
      const allNamesTheSame = new Set(contextFileNames).size < 2;
      const name = allNamesTheSame
        ? contextFileNames[0]
        : i18n.t('commands:memory.show.contextLabel');
      const loadedKey =
        fileCount > 1
          ? 'commands:memory.show.loadedFromPlural'
          : 'commands:memory.show.loadedFromSingle';
      addMessage({
        type: MessageType.INFO,
        content: i18n.t(loadedKey, { count: fileCount, name }),
        timestamp: new Date(),
      });
    }

    if (currentMemory && currentMemory.trim().length > 0) {
      addMessage({
        type: MessageType.INFO,
        content: i18n.t('commands:memory.show.currentContent', {
          content: currentMemory,
        }),
        timestamp: new Date(),
      });
    } else {
      addMessage({
        type: MessageType.INFO,
        content:
          fileCount > 0
            ? i18n.t('commands:memory.show.emptyContent')
            : i18n.t('commands:memory.show.noneLoaded'),
        timestamp: new Date(),
      });
    }
  };
}
