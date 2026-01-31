/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CommandContext, SlashCommand } from './types.js';
import { CommandKind } from './types.js';
import process from 'node:process';
import { MessageType, type HistoryItemAbout } from '../types.js';
import {
  IdeClient,
  UserAccountManager,
  debugLogger,
  getVersion,
} from '@google/gemini-cli-core';
import { t } from '../../i18n/index.js';

export const aboutCommand: SlashCommand = {
  name: 'about',
  get description() {
    return t('commands:about.description');
  },
  kind: CommandKind.BUILT_IN,
  autoExecute: true,
  action: async (context) => {
    const osVersion = process.platform;
    let sandboxEnv = t('commands:about.noSandbox');
    if (process.env['SANDBOX'] && process.env['SANDBOX'] !== 'sandbox-exec') {
      sandboxEnv = process.env['SANDBOX'];
    } else if (process.env['SANDBOX'] === 'sandbox-exec') {
      sandboxEnv = t('commands:about.sandboxExec', {
        profile: process.env['SEATBELT_PROFILE'] || t('common:unknown'),
      });
    }
    const modelVersion =
      context.services.config?.getModel() || t('common:unknown');
    const cliVersion = await getVersion();
    const selectedAuthType =
      context.services.settings.merged.security.auth.selectedType || '';
    const gcpProject = process.env['GOOGLE_CLOUD_PROJECT'] || '';
    const ideClient = await getIdeClientName(context);

    const userAccountManager = new UserAccountManager();
    const cachedAccount = userAccountManager.getCachedGoogleAccount();
    debugLogger.log('AboutCommand: Retrieved cached Google account', {
      cachedAccount,
    });
    const userEmail = cachedAccount ?? undefined;

    const aboutItem: Omit<HistoryItemAbout, 'id'> = {
      type: MessageType.ABOUT,
      cliVersion,
      osVersion,
      sandboxEnv,
      modelVersion,
      selectedAuthType,
      gcpProject,
      ideClient,
      userEmail,
    };

    context.ui.addItem(aboutItem);
  },
};

async function getIdeClientName(context: CommandContext) {
  if (!context.services.config?.getIdeMode()) {
    return '';
  }
  const ideClient = await IdeClient.getInstance();
  return ideClient?.getDetectedIdeDisplayName() ?? '';
}
