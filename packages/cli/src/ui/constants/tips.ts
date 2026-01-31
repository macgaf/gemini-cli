/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { tArray } from '../../i18n/index.js';

export const getInformativeTips = (language?: string): string[] => {
  const settingsTips = tArray('phrases:tips.settings', {
    defaultValue: [],
    lng: language,
  });
  const keyboardTips = tArray('phrases:tips.keyboard', {
    defaultValue: [],
    lng: language,
  });
  const commandsTips = tArray('phrases:tips.commands', {
    defaultValue: [],
    lng: language,
  });

  return [...settingsTips, ...keyboardTips, ...commandsTips];
};
