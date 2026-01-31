/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import process from 'node:process';
import { type HistoryItemWithoutId, MessageType } from '../types.js';
import { i18n } from '../../i18n/index.js';

export const MEMORY_WARNING_THRESHOLD = 7 * 1024 * 1024 * 1024; // 7GB in bytes
export const MEMORY_CHECK_INTERVAL = 60 * 1000; // one minute

interface MemoryMonitorOptions {
  addItem: (item: HistoryItemWithoutId, timestamp: number) => void;
}

export const useMemoryMonitor = ({ addItem }: MemoryMonitorOptions) => {
  useEffect(() => {
    const intervalId = setInterval(() => {
      const usage = process.memoryUsage().rss;
      if (usage > MEMORY_WARNING_THRESHOLD) {
        const usageGb = (usage / (1024 * 1024 * 1024)).toFixed(2);
        addItem(
          {
            type: MessageType.WARNING,
            text: i18n.t('common:memory.highUsage', { usage: usageGb }),
          },
          Date.now(),
        );
        clearInterval(intervalId);
      }
    }, MEMORY_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [addItem]);
};
