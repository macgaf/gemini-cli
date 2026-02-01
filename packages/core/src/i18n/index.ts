/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import process from 'node:process';
/* eslint-disable import/no-internal-modules -- 需要直接加载本地化 JSON 资源 */
import zhCN from './locales/zh-CN.json' with { type: 'json' };
import zhTW from './locales/zh-TW.json' with { type: 'json' };
/* eslint-enable import/no-internal-modules */

export type SupportedLanguage =
  | 'en'
  | 'zh-CN'
  | 'zh-TW'
  | 'fr'
  | 'ja'
  | 'es'
  | 'ru'
  | 'de';

const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
const SUPPORTED_LANGUAGES = new Set<SupportedLanguage>([
  'en',
  'zh-CN',
  'zh-TW',
  'fr',
  'ja',
  'es',
  'ru',
  'de',
]);

const translations: Partial<Record<SupportedLanguage, Record<string, string>>> =
  {
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    fr: zhCN,
    ja: zhCN,
    es: zhCN,
    ru: zhCN,
    de: zhCN,
  };

const PLACEHOLDER_PREFIX: Partial<Record<SupportedLanguage, string>> = {
  // 当前不使用占位前缀，避免干扰中文输出
};

const shouldApplyPlaceholder = (language: SupportedLanguage): boolean =>
  Boolean(PLACEHOLDER_PREFIX[language]);

const applyPlaceholder = (
  value: string,
  language: SupportedLanguage,
): string => {
  const prefix = PLACEHOLDER_PREFIX[language];
  if (!prefix) {
    return value;
  }
  return `${prefix}${value}`;
};

const localeEnvVars = ['LC_ALL', 'LC_MESSAGES', 'LANG', 'LANGUAGE'];

const isSupportedLanguage = (value: string): value is SupportedLanguage =>
  SUPPORTED_LANGUAGES.has(value as SupportedLanguage);

const interpolate = (
  template: string,
  options?: Record<string, unknown>,
): string => {
  if (!options) {
    return template;
  }
  const { defaultValue: _defaultValue, ...values } = options;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key) =>
    key in values ? String(values[key]) : '',
  );
};

const parseLocaleToLanguage = (locale: string): SupportedLanguage | null => {
  const withoutEncoding = locale.split('.')[0];
  if (!withoutEncoding) return null;

  const normalized = withoutEncoding.replace('_', '-');
  if (isSupportedLanguage(normalized)) {
    return normalized;
  }

  const lower = normalized.toLowerCase();
  if (lower === 'zh-tw' || lower === 'zh-hk' || lower === 'zh-mo') {
    return 'zh-TW';
  }
  if (lower === 'zh-hant') {
    return 'zh-TW';
  }
  if (lower === 'zh-cn' || lower === 'zh-hans' || lower === 'zh-sg') {
    return 'zh-CN';
  }

  const langOnly = lower.split('-')[0];
  if (langOnly === 'zh') return 'zh-CN';
  if (langOnly === 'en') return 'en';
  if (langOnly === 'fr') return 'fr';
  if (langOnly === 'ja') return 'ja';
  if (langOnly === 'es') return 'es';
  if (langOnly === 'ru') return 'ru';
  if (langOnly === 'de') return 'de';
  return null;
};

const detectSystemLocale = (): SupportedLanguage | null => {
  for (const envVar of localeEnvVars) {
    const value = process.env[envVar];
    if (!value) continue;
    const lang = parseLocaleToLanguage(value);
    if (lang && isSupportedLanguage(lang)) {
      return lang;
    }
  }
  return null;
};

const detectLanguage = (): SupportedLanguage => {
  const envLang = process.env['GEMINI_LANG'];
  if (envLang) {
    const parsedEnvLang = parseLocaleToLanguage(envLang);
    if (parsedEnvLang && isSupportedLanguage(parsedEnvLang)) {
      return parsedEnvLang;
    }
  }

  const systemLang = detectSystemLocale();
  if (systemLang) {
    return systemLang;
  }

  return DEFAULT_LANGUAGE;
};

let cachedLanguage: SupportedLanguage | null = null;

export const getCurrentLanguage = (): SupportedLanguage => {
  if (!cachedLanguage) {
    cachedLanguage = detectLanguage();
  }
  return cachedLanguage;
};

export const setCurrentLanguage = (language: SupportedLanguage): void => {
  cachedLanguage = language;
};

export const t = (
  key: string,
  options?: { defaultValue?: string } & Record<string, unknown>,
): string => {
  const language = getCurrentLanguage();
  const translated = translations[language]?.[key];
  const template =
    typeof translated === 'string'
      ? translated
      : typeof options?.defaultValue === 'string'
        ? options.defaultValue
        : key;
  const text = interpolate(template, options);
  return shouldApplyPlaceholder(language)
    ? applyPlaceholder(text, language)
    : text;
};
