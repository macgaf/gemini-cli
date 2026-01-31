/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { themeManager } from '../themes/theme-manager.js';
import type {
  LoadableSettingScope,
  LoadedSettings,
} from '../../config/settings.js'; // Import LoadedSettings, AppSettings, MergedSetting
import { MessageType } from '../types.js';
import process from 'node:process';
import type { UseHistoryManagerReturn } from './useHistoryManager.js';
import { i18n } from '../../i18n/index.js';

interface UseThemeCommandReturn {
  isThemeDialogOpen: boolean;
  openThemeDialog: () => void;
  closeThemeDialog: () => void;
  handleThemeSelect: (themeName: string, scope: LoadableSettingScope) => void;
  handleThemeHighlight: (themeName: string | undefined) => void;
}

export const useThemeCommand = (
  loadedSettings: LoadedSettings,
  setThemeError: (error: string | null) => void,
  addItem: UseHistoryManagerReturn['addItem'],
  initialThemeError: string | null,
): UseThemeCommandReturn => {
  const [isThemeDialogOpen, setIsThemeDialogOpen] =
    useState(!!initialThemeError);

  const openThemeDialog = useCallback(() => {
    if (process.env['NO_COLOR']) {
      addItem(
        {
          type: MessageType.INFO,
          text: i18n.t('dialogs:theme.noColorUnsupported'),
        },
        Date.now(),
      );
      return;
    }
    setIsThemeDialogOpen(true);
  }, [addItem]);

  const applyTheme = useCallback(
    (themeName: string | undefined) => {
      if (!themeManager.setActiveTheme(themeName)) {
        // If theme is not found, open the theme selection dialog and set error message
        setIsThemeDialogOpen(true);
        setThemeError(i18n.t('dialogs:theme.notFound', { name: themeName }));
      } else {
        setThemeError(null); // Clear any previous theme error on success
      }
    },
    [setThemeError],
  );

  const handleThemeHighlight = useCallback(
    (themeName: string | undefined) => {
      applyTheme(themeName);
    },
    [applyTheme],
  );

  const closeThemeDialog = useCallback(() => {
    // Re-apply the saved theme to revert any preview changes from highlighting
    applyTheme(loadedSettings.merged.ui.theme);
    setIsThemeDialogOpen(false);
  }, [applyTheme, loadedSettings]);

  const handleThemeSelect = useCallback(
    (themeName: string, scope: LoadableSettingScope) => {
      try {
        // Merge user and workspace custom themes (workspace takes precedence)
        const mergedCustomThemes = {
          ...(loadedSettings.user.settings.ui?.customThemes || {}),
          ...(loadedSettings.workspace.settings.ui?.customThemes || {}),
        };
        // Only allow selecting themes available in the merged custom themes or built-in themes
        const isBuiltIn = themeManager.findThemeByName(themeName);
        const isCustom = themeName && mergedCustomThemes[themeName];
        if (!isBuiltIn && !isCustom) {
          setThemeError(
            i18n.t('dialogs:theme.notFoundInScope', { name: themeName }),
          );
          setIsThemeDialogOpen(true);
          return;
        }
        loadedSettings.setValue(scope, 'ui.theme', themeName); // Update the merged settings
        if (loadedSettings.merged.ui.customThemes) {
          themeManager.loadCustomThemes(loadedSettings.merged.ui.customThemes);
        }
        applyTheme(loadedSettings.merged.ui.theme); // Apply the current theme
        setThemeError(null);
      } finally {
        setIsThemeDialogOpen(false); // Close the dialog
      }
    },
    [applyTheme, loadedSettings, setThemeError],
  );

  return {
    isThemeDialogOpen,
    openThemeDialog,
    closeThemeDialog,
    handleThemeSelect,
    handleThemeHighlight,
  };
};
