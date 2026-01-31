/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import type {
  LoadableSettingScope,
  LoadedSettings,
} from '../../config/settings.js';
import { MessageType } from '../types.js';
import type { EditorType } from '@google/gemini-cli-core';
import {
  allowEditorTypeInSandbox,
  checkHasEditorType,
  getEditorDisplayName,
} from '@google/gemini-cli-core';
import type { UseHistoryManagerReturn } from './useHistoryManager.js';

import { SettingPaths } from '../../config/settingPaths.js';
import { t } from '../../i18n/index.js';
import { SettingScope } from '../../config/settings.js';

interface UseEditorSettingsReturn {
  isEditorDialogOpen: boolean;
  openEditorDialog: () => void;
  handleEditorSelect: (
    editorType: EditorType | undefined,
    scope: LoadableSettingScope,
  ) => void;
  exitEditorDialog: () => void;
}

export const useEditorSettings = (
  loadedSettings: LoadedSettings,
  setEditorError: (error: string | null) => void,
  addItem: UseHistoryManagerReturn['addItem'],
): UseEditorSettingsReturn => {
  const [isEditorDialogOpen, setIsEditorDialogOpen] = useState(false);

  const openEditorDialog = useCallback(() => {
    setIsEditorDialogOpen(true);
  }, []);

  const handleEditorSelect = useCallback(
    (editorType: EditorType | undefined, scope: LoadableSettingScope) => {
      if (
        editorType &&
        (!checkHasEditorType(editorType) ||
          !allowEditorTypeInSandbox(editorType))
      ) {
        return;
      }

      try {
        loadedSettings.setValue(
          scope,
          SettingPaths.General.PreferredEditor,
          editorType,
        );
        const scopeLabel =
          scope === SettingScope.User
            ? t('dialogs:scope.user')
            : scope === SettingScope.Workspace
              ? t('dialogs:scope.workspace')
              : t('dialogs:scope.system');
        addItem(
          {
            type: MessageType.INFO,
            text: editorType
              ? t('dialogs:editor.preferenceSet', {
                  editor: getEditorDisplayName(editorType),
                  scope: scopeLabel,
                })
              : t('dialogs:editor.preferenceCleared', {
                  scope: scopeLabel,
                }),
          },
          Date.now(),
        );
        setEditorError(null);
        setIsEditorDialogOpen(false);
      } catch (error) {
        setEditorError(
          t('dialogs:editor.preferenceSetFailed', {
            error: String(error),
          }),
        );
      }
    },
    [loadedSettings, setEditorError, addItem],
  );

  const exitEditorDialog = useCallback(() => {
    setIsEditorDialogOpen(false);
  }, []);

  return {
    isEditorDialogOpen,
    openEditorDialog,
    handleEditorSelect,
    exitEditorDialog,
  };
};
