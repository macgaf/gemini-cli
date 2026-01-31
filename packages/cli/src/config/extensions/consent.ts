/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { debugLogger, type SkillDefinition } from '@google/gemini-cli-core';
import chalk from 'chalk';

import type { ConfirmationRequest } from '../../ui/types.js';
import { escapeAnsiCtrlCodes } from '../../ui/utils/textUtils.js';
import type { ExtensionConfig } from '../extension.js';
import { t } from '../../i18n/index.js';

export const INSTALL_WARNING_MESSAGE = chalk.yellow(
  t('commands:extensions.consent.installWarning', {
    defaultValue:
      'The extension you are about to install may have been created by a third-party developer and sourced from a public repository. Google does not vet, endorse, or guarantee the functionality or security of extensions. Please carefully inspect any extension and its source code before installing to understand the permissions it requires and the actions it may perform.',
  }),
);

export const SKILLS_WARNING_MESSAGE = chalk.yellow(
  t('commands:extensions.consent.skillsWarning', {
    defaultValue:
      "Agent skills inject specialized instructions and domain-specific knowledge into the agent's system prompt. This can change how the agent interprets your requests and interacts with your environment. Review the skill definitions at the location(s) provided below to ensure they meet your security standards.",
  }),
);

/**
 * Builds a consent string for installing agent skills.
 */
export async function skillsConsentString(
  skills: SkillDefinition[],
  source: string,
  targetDir?: string,
): Promise<string> {
  const output: string[] = [];
  output.push(
    t('commands:skills.consent.installingSkillsFrom', {
      source,
      defaultValue: 'Installing agent skill(s) from "{{source}}".',
    }),
  );
  output.push(
    '\n' +
      t('commands:skills.consent.skillsWillBeInstalled', {
        defaultValue: 'The following agent skill(s) will be installed:',
      }) +
      '\n',
  );
  output.push(...(await renderSkillsList(skills)));

  if (targetDir) {
    output.push(
      t('commands:skills.consent.installDestination', {
        path: targetDir,
        defaultValue: 'Install Destination: {{path}}',
      }),
    );
  }
  output.push('\n' + SKILLS_WARNING_MESSAGE);

  return output.join('\n');
}

/**
 * Requests consent from the user to perform an action, by reading a Y/n
 * character from stdin.
 *
 * This should not be called from interactive mode as it will break the CLI.
 *
 * @param consentDescription The description of the thing they will be consenting to.
 * @returns boolean, whether they consented or not.
 */
export async function requestConsentNonInteractive(
  consentDescription: string,
): Promise<boolean> {
  debugLogger.log(consentDescription);
  const result = await promptForConsentNonInteractive(
    t('commands:extensions.consent.continuePromptWithDefault', {
      defaultValue: 'Do you want to continue? [Y/n]: ',
    }),
  );
  return result;
}

/**
 * Requests consent from the user to perform an action, in interactive mode.
 *
 * This should not be called from non-interactive mode as it will not work.
 *
 * @param consentDescription The description of the thing they will be consenting to.
 * @param addExtensionUpdateConfirmationRequest A function to actually add a prompt to the UI.
 * @returns boolean, whether they consented or not.
 */
export async function requestConsentInteractive(
  consentDescription: string,
  addExtensionUpdateConfirmationRequest: (value: ConfirmationRequest) => void,
): Promise<boolean> {
  return promptForConsentInteractive(
    consentDescription +
      '\n\n' +
      t('commands:extensions.consent.continuePrompt', {
        defaultValue: 'Do you want to continue?',
      }),
    addExtensionUpdateConfirmationRequest,
  );
}

/**
 * Asks users a prompt and awaits for a y/n response on stdin.
 *
 * This should not be called from interactive mode as it will break the CLI.
 *
 * @param prompt A yes/no prompt to ask the user
 * @returns Whether or not the user answers 'y' (yes). Defaults to 'yes' on enter.
 */
async function promptForConsentNonInteractive(
  prompt: string,
): Promise<boolean> {
  const readline = await import('node:readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(['y', ''].includes(answer.trim().toLowerCase()));
    });
  });
}

/**
 * Asks users an interactive yes/no prompt.
 *
 * This should not be called from non-interactive mode as it will break the CLI.
 *
 * @param prompt A markdown prompt to ask the user
 * @param addExtensionUpdateConfirmationRequest Function to update the UI state with the confirmation request.
 * @returns Whether or not the user answers yes.
 */
async function promptForConsentInteractive(
  prompt: string,
  addExtensionUpdateConfirmationRequest: (value: ConfirmationRequest) => void,
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    addExtensionUpdateConfirmationRequest({
      prompt,
      onConfirm: (resolvedConfirmed) => {
        resolve(resolvedConfirmed);
      },
    });
  });
}

/**
 * Builds a consent string for installing an extension based on it's
 * extensionConfig.
 */
async function extensionConsentString(
  extensionConfig: ExtensionConfig,
  hasHooks: boolean,
  skills: SkillDefinition[] = [],
): Promise<string> {
  const sanitizedConfig = escapeAnsiCtrlCodes(extensionConfig);
  const output: string[] = [];
  const mcpServerEntries = Object.entries(sanitizedConfig.mcpServers || {});
  output.push(
    t('commands:extensions.consent.installingExtension', {
      name: sanitizedConfig.name,
      defaultValue: 'Installing extension "{{name}}".',
    }),
  );

  if (mcpServerEntries.length) {
    output.push(
      t('commands:extensions.consent.mcpServersTitle', {
        defaultValue: 'This extension will run the following MCP servers:',
      }),
    );
    for (const [key, mcpServer] of mcpServerEntries) {
      const isLocal = !!mcpServer.command;
      const source =
        mcpServer.httpUrl ??
        `${mcpServer.command || ''}${mcpServer.args ? ' ' + mcpServer.args.join(' ') : ''}`;
      const location = isLocal
        ? t('commands:extensions.consent.mcpServerLocal', {
            defaultValue: 'local',
          })
        : t('commands:extensions.consent.mcpServerRemote', {
            defaultValue: 'remote',
          });
      output.push(
        t('commands:extensions.consent.mcpServerEntry', {
          name: key,
          location,
          source,
          defaultValue: '  * {{name}} ({{location}}): {{source}}',
        }),
      );
    }
  }
  if (sanitizedConfig.contextFileName) {
    output.push(
      t('commands:extensions.consent.contextFile', {
        name: sanitizedConfig.contextFileName,
        defaultValue:
          'This extension will append info to your gemini.md context using {{name}}',
      }),
    );
  }
  if (sanitizedConfig.excludeTools) {
    output.push(
      t('commands:extensions.consent.excludeTools', {
        tools: sanitizedConfig.excludeTools.join(','),
        defaultValue:
          'This extension will exclude the following core tools: {{tools}}',
      }),
    );
  }
  if (hasHooks) {
    output.push(
      t('commands:extensions.consent.hooksWarning', {
        defaultValue:
          '⚠️  This extension contains Hooks which can automatically execute commands.',
      }),
    );
  }
  if (skills.length > 0) {
    output.push(
      `\n${chalk.bold(
        t('commands:extensions.consent.agentSkillsTitle', {
          defaultValue: 'Agent Skills:',
        }),
      )}`,
    );
    output.push(
      '\n' +
        t('commands:extensions.consent.agentSkillsIntro', {
          defaultValue:
            'This extension will install the following agent skills:',
        }) +
        '\n',
    );
    output.push(...(await renderSkillsList(skills)));
  }

  output.push('\n' + INSTALL_WARNING_MESSAGE);
  if (skills.length > 0) {
    output.push('\n' + SKILLS_WARNING_MESSAGE);
  }

  return output.join('\n');
}

/**
 * Shared logic for formatting a list of agent skills for a consent prompt.
 */
async function renderSkillsList(skills: SkillDefinition[]): Promise<string[]> {
  const output: string[] = [];
  for (const skill of skills) {
    output.push(`  * ${chalk.bold(skill.name)}: ${skill.description}`);
    const skillDir = path.dirname(skill.location);
    let fileCountStr = '';
    try {
      const skillDirItems = await fs.readdir(skillDir);
      fileCountStr =
        ' ' +
        t('commands:extensions.consent.skillItemsCount', {
          count: skillDirItems.length,
          defaultValue: '({{count}} items in directory)',
        });
    } catch {
      fileCountStr =
        ' ' +
        chalk.red(
          t('commands:extensions.consent.skillItemsCountFailed', {
            defaultValue: '⚠️ (Could not count items in directory)',
          }),
        );
    }
    output.push(
      chalk.dim(
        `    (${t('commands:extensions.consent.skillSourceLabel', {
          defaultValue: 'Source',
        })}: ${skill.location})${fileCountStr}`,
      ),
    );
    output.push('');
  }
  return output;
}

/**
 * Requests consent from the user to install an extension (extensionConfig), if
 * there is any difference between the consent string for `extensionConfig` and
 * `previousExtensionConfig`.
 *
 * Always requests consent if previousExtensionConfig is null.
 *
 * Throws if the user does not consent.
 */
export async function maybeRequestConsentOrFail(
  extensionConfig: ExtensionConfig,
  requestConsent: (consent: string) => Promise<boolean>,
  hasHooks: boolean,
  previousExtensionConfig?: ExtensionConfig,
  previousHasHooks?: boolean,
  skills: SkillDefinition[] = [],
  previousSkills: SkillDefinition[] = [],
) {
  const extensionConsent = await extensionConsentString(
    extensionConfig,
    hasHooks,
    skills,
  );
  if (previousExtensionConfig) {
    const previousExtensionConsent = await extensionConsentString(
      previousExtensionConfig,
      previousHasHooks ?? false,
      previousSkills,
    );
    if (previousExtensionConsent === extensionConsent) {
      return;
    }
  }
  if (!(await requestConsent(extensionConsent))) {
    throw new Error(`Installation cancelled for "${extensionConfig.name}".`);
  }
}
