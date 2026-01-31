/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { TestRig } from './test-helper.js';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const extension = `{
  "name": "test-extension-install",
  "version": "0.0.1"
}`;

const extensionUpdate = `{
  "name": "test-extension-install",
  "version": "0.0.2"
}`;

describe('extension install', () => {
  let rig: TestRig;

  beforeEach(() => {
    rig = new TestRig();
  });

  afterEach(async () => await rig.cleanup());

  it('installs a local extension, verifies a command, and updates it', async () => {
    rig.setup('extension install test', {
      settings: {
        security: {
          auth: {
            selectedType: '',
          },
        },
      },
    });
    const testServerPath = join(rig.testDir!, 'gemini-extension.json');
    writeFileSync(testServerPath, extension);
    try {
      const result = await rig.runCommand(
        ['extensions', 'install', `${rig.testDir!}`],
        { stdin: 'y\n', env: { GEMINI_API_KEY: 'dummy' } },
      );
      expect(result).toContain('test-extension-install');

      const listResult = await rig.runCommand(['extensions', 'list'], {
        env: { GEMINI_API_KEY: 'dummy' },
      });
      expect(listResult).toContain('test-extension-install');
      writeFileSync(testServerPath, extensionUpdate);
      const updateResult = await rig.runCommand(
        ['extensions', 'update', `test-extension-install`],
        { env: { GEMINI_API_KEY: 'dummy' } },
      );
      expect(updateResult).toContain('0.0.2');
    } finally {
      await rig.runCommand(
        ['extensions', 'uninstall', 'test-extension-install'],
        { env: { GEMINI_API_KEY: 'dummy' } },
      );
    }
  });
});
