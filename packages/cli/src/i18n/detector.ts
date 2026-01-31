/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import process from 'node:process';
import {
  type SupportedLanguage,
  type LanguageDetectionResult,
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
} from './types.js';

/**
 * 按优先级检测用户的首选语言：
 * 1. 命令行参数（--lang=xx）
 * 2. 环境变量（GEMINI_LANG）
 * 3. 设置文件（language 字段）
 * 4. 系统区域设置
 * 5. 默认值（en）
 */
export function detectLanguage(options: {
  cliLang?: string;
  settingsLang?: string;
}): LanguageDetectionResult {
  const { cliLang, settingsLang } = options;

  // 1. 命令行参数
  if (cliLang && isSupportedLanguage(cliLang)) {
    return { language: cliLang, source: 'cli-arg' };
  }

  // 2. 环境变量
  const envLang = process.env['GEMINI_LANG'];
  if (envLang) {
    const parsedEnvLang = parseLocaleToLanguage(envLang);
    if (parsedEnvLang && isSupportedLanguage(parsedEnvLang)) {
      return { language: parsedEnvLang, source: 'env-var' };
    }
  }

  // 3. 设置文件
  if (settingsLang && isSupportedLanguage(settingsLang)) {
    return { language: settingsLang, source: 'settings' };
  }

  // 4. 系统区域设置
  const systemLang = detectSystemLocale();
  if (systemLang) {
    return { language: systemLang, source: 'system' };
  }

  // 5. 默认值
  return { language: DEFAULT_LANGUAGE, source: 'default' };
}

/**
 * 检测系统区域设置并映射到受支持的语言。
 */
function detectSystemLocale(): SupportedLanguage | null {
  // 检查常见的区域设置环境变量
  const localeEnvVars = ['LC_ALL', 'LC_MESSAGES', 'LANG', 'LANGUAGE'];

  for (const envVar of localeEnvVars) {
    const value = process.env[envVar];
    if (value) {
      const lang = parseLocaleToLanguage(value);
      if (lang && isSupportedLanguage(lang)) {
        return lang;
      }
    }
  }

  return null;
}

/**
 * 将区域设置字符串（如 "zh_CN.UTF-8"）解析为语言代码。
 */
function parseLocaleToLanguage(locale: string): string | null {
  // 移除编码后缀（如 ".UTF-8"）
  const withoutEncoding = locale.split('.')[0];
  if (!withoutEncoding) return null;

  // 处理 "zh_CN"、"en_US"、"zh-CN" 等格式
  const normalized = withoutEncoding.replace('_', '-');

  // 先检查完整匹配
  if (isSupportedLanguage(normalized)) {
    return normalized;
  }

  // 再检查仅语言匹配（如 "zh" -> "zh-CN"）
  const langOnly = normalized.split('-')[0];
  if (langOnly === 'zh') {
    return 'zh-CN';
  }
  if (langOnly === 'en') {
    return 'en';
  }

  return null;
}
