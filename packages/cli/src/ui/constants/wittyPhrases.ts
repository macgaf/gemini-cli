/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { tArray } from '../../i18n/index.js';

export const getWittyLoadingPhrases = (language?: string): string[] => tArray('phrases:wittyPhrases', {
    defaultValue: [],
    lng: language,
  });
