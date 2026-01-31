/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CommandModule } from 'yargs';
import { debugLogger } from '@google/gemini-cli-core';
import { getErrorMessage } from '../../utils/errors.js';
import {
  INSTALL_WARNING_MESSAGE,
  requestConsentNonInteractive,
} from '../../config/extensions/consent.js';
import {
  ExtensionManager,
  inferInstallMetadata,
} from '../../config/extension-manager.js';
import { loadSettings } from '../../config/settings.js';
import { promptForSetting } from '../../config/extensions/extensionSettings.js';
import { exitCli } from '../utils.js';

interface InstallArgs {
  source: string;
  ref?: string;
  autoUpdate?: boolean;
  allowPreRelease?: boolean;
  consent?: boolean;
}

import { t } from '../../i18n/index.js';

export async function handleInstall(args: InstallArgs) {
  try {
    const { source } = args;
    const installMetadata = await inferInstallMetadata(source, {
      ref: args.ref,
      autoUpdate: args.autoUpdate,
      allowPreRelease: args.allowPreRelease,
    });

    const requestConsent = args.consent
      ? () => Promise.resolve(true)
      : requestConsentNonInteractive;
    if (args.consent) {
      debugLogger.log(
        t('commands:extensions.install.log.consent', {
          defaultValue: 'You have consented to the following:',
        }),
      );
      debugLogger.log(INSTALL_WARNING_MESSAGE);
    }

    const workspaceDir = process.cwd();
    const extensionManager = new ExtensionManager({
      workspaceDir,
      requestConsent,
      requestSetting: promptForSetting,
      settings: loadSettings(workspaceDir).merged,
    });
    await extensionManager.loadExtensions();
    const extension =
      await extensionManager.installOrUpdateExtension(installMetadata);
    debugLogger.log(
      t('commands:extensions.install.log.success', {
        name: extension.name,
        defaultValue: `Extension "${extension.name}" installed successfully and enabled.`,
      }),
    );
  } catch (error) {
    debugLogger.error(getErrorMessage(error));
    process.exit(1);
  }
}

export const installCommand: CommandModule = {
  command: 'install <source> [--auto-update] [--pre-release]',
  describe: t('commands:extensions.install.describe', {
    defaultValue:
      'Installs an extension from a git repository URL or a local path.',
  }),
  builder: (yargs) =>
    yargs
      .positional('source', {
        describe: t('commands:extensions.install.source', {
          defaultValue:
            'The github URL or local path of the extension to install.',
        }),
        type: 'string',
        demandOption: true,
      })
      .option('ref', {
        describe: t('commands:extensions.install.ref', {
          defaultValue: 'The git ref to install from.',
        }),
        type: 'string',
      })
      .option('auto-update', {
        describe: t('commands:extensions.install.autoUpdate', {
          defaultValue: 'Enable auto-update for this extension.',
        }),
        type: 'boolean',
      })
      .option('pre-release', {
        describe: t('commands:extensions.install.preRelease', {
          defaultValue: 'Enable pre-release versions for this extension.',
        }),
        type: 'boolean',
      })
      .option('consent', {
        describe: t('commands:extensions.install.consent', {
          defaultValue:
            'Acknowledge the security risks of installing an extension and skip the confirmation prompt.',
        }),
        type: 'boolean',
        default: false,
      })
      .check((argv) => {
        if (!argv.source) {
          throw new Error(
            t('commands:extensions.install.error.noSource', {
              defaultValue: 'The source argument must be provided.',
            }),
          );
        }
        return true;
      }),
  handler: async (argv) => {
    await handleInstall({
      source: argv['source'] as string,
      ref: argv['ref'] as string | undefined,
      autoUpdate: argv['auto-update'] as boolean | undefined,
      allowPreRelease: argv['pre-release'] as boolean | undefined,
      consent: argv['consent'] as boolean | undefined,
    });
    await exitCli();
  },
};
