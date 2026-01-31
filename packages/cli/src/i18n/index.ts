/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import i18n, {
  changeLanguage as changeI18nLanguage,
  t as i18nextT,
  use as i18nextUse,
} from 'i18next';
import { initReactI18next } from 'react-i18next';
import { detectLanguage } from './detector.js';
import {
  type SupportedLanguage,
  type TranslationNamespace,
  DEFAULT_LANGUAGE,
} from './types.js';

// 导入翻译资源
/* eslint-disable import/no-internal-modules -- 需要直接加载本地化 JSON 资源 */
import enCommon from './locales/en/common.json' with { type: 'json' };
import enCommands from './locales/en/commands.json' with { type: 'json' };
import enErrors from './locales/en/errors.json' with { type: 'json' };
import enAuth from './locales/en/auth.json' with { type: 'json' };
import enTips from './locales/en/tips.json' with { type: 'json' };
import enKeyboard from './locales/en/keyboard.json' with { type: 'json' };
import enDialogs from './locales/en/dialogs.json' with { type: 'json' };
import enPrivacy from './locales/en/privacy.json' with { type: 'json' };
import enPhrases from './locales/en/phrases.json' with { type: 'json' };

import zhCNCommon from './locales/zh-CN/common.json' with { type: 'json' };
import zhCNCommands from './locales/zh-CN/commands.json' with { type: 'json' };
import zhCNErrors from './locales/zh-CN/errors.json' with { type: 'json' };
import zhCNAuth from './locales/zh-CN/auth.json' with { type: 'json' };
import zhCNTips from './locales/zh-CN/tips.json' with { type: 'json' };
import zhCNKeyboard from './locales/zh-CN/keyboard.json' with { type: 'json' };
import zhCNDialogs from './locales/zh-CN/dialogs.json' with { type: 'json' };
import zhCNPrivacy from './locales/zh-CN/privacy.json' with { type: 'json' };
import zhCNPhrases from './locales/zh-CN/phrases.json' with { type: 'json' };
/* eslint-enable import/no-internal-modules */

const resources = {
  en: {
    common: enCommon,
    commands: enCommands,
    errors: enErrors,
    auth: enAuth,
    tips: enTips,
    keyboard: enKeyboard,
    dialogs: enDialogs,
    privacy: enPrivacy,
    phrases: enPhrases,
  },
  'zh-CN': {
    common: zhCNCommon,
    commands: zhCNCommands,
    errors: zhCNErrors,
    auth: zhCNAuth,
    tips: zhCNTips,
    keyboard: zhCNKeyboard,
    dialogs: zhCNDialogs,
    privacy: zhCNPrivacy,
    phrases: zhCNPhrases,
  },
};

const fallbackResources = resources.en;

const interpolateFallback = (
  template: string,
  options?: Record<string, unknown>,
): string =>
  template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key) =>
    options && key in options ? String(options[key]) : '',
  );

const parseKey = (key: string): [TranslationNamespace, string] =>
  key.includes(':')
    ? (key.split(':', 2) as [TranslationNamespace, string])
    : ([(i18n.options?.defaultNS as TranslationNamespace) ?? 'common', key] as [
        TranslationNamespace,
        string,
      ]);

const toStringArray = (
  value: unknown,
  options?: Record<string, unknown>,
): string[] =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => interpolateFallback(item, options))
    : [];

const resolveFallbackValue = (
  namespace: TranslationNamespace,
  keyPath: string,
): unknown => {
  const parts = keyPath.split('.');
  let current: unknown = fallbackResources[namespace];
  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    const record = current as Record<string, unknown>;
    if (!(part in record)) {
      return undefined;
    }
    current = record[part];
  }
  return current;
};

/**
 * 带有后备值的翻译函数（用于 i18n 尚未初始化时）。
 */
export function t(key: string, options?: Record<string, unknown>): string {
  const translated = i18nextT(key, {
    ...(options ?? {}),
    returnObjects: false,
    returnDetails: false,
  }) as unknown;
  if (typeof translated === 'string' && translated && translated !== key) {
    return translated;
  }

  const [ns, path] = parseKey(key);

  const fallbackValue = resolveFallbackValue(ns, path);

  if (Array.isArray(fallbackValue)) {
    const joined = fallbackValue
      .map((item) =>
        typeof item === 'string'
          ? interpolateFallback(item, options)
          : String(item),
      )
      .filter((item) => item.length > 0);
    if (joined.length > 0) {
      return joined.join('\n');
    }
  }

  if (typeof fallbackValue === 'string') {
    return interpolateFallback(fallbackValue, options);
  }

  const defaultValue = options?.['defaultValue'];
  if (typeof defaultValue === 'string') {
    return interpolateFallback(defaultValue, options);
  }
  if (Array.isArray(defaultValue)) {
    const joined = defaultValue
      .map((item) =>
        typeof item === 'string'
          ? interpolateFallback(item, options)
          : String(item),
      )
      .filter((item) => item.length > 0);
    if (joined.length > 0) {
      return joined.join('\n');
    }
  }

  return key;
}

const resolveFallbackArray = (
  namespace: TranslationNamespace,
  keyPath: string,
  options?: Record<string, unknown>,
): string[] => {
  const fallbackValue = resolveFallbackValue(namespace, keyPath);
  const fallbackArray = toStringArray(fallbackValue, options);
  if (fallbackArray.length > 0) {
    return fallbackArray;
  }

  if (typeof fallbackValue === 'string') {
    const fallbackString = interpolateFallback(fallbackValue, options);
    if (fallbackString) {
      return [fallbackString];
    }
  }

  const defaultValue = options?.['defaultValue'];
  const defaultArray = toStringArray(defaultValue, options);
  if (defaultArray.length > 0) {
    return defaultArray;
  }
  if (typeof defaultValue === 'string') {
    const fallbackString = interpolateFallback(defaultValue, options);
    if (fallbackString) {
      return [fallbackString];
    }
  }

  return [];
};

/**
 * 获取数组形式的翻译内容。
 */
export function tArray(
  key: string,
  options?: Record<string, unknown>,
): string[] {
  const translated = i18nextT(key, {
    ...(options ?? {}),
    returnObjects: true,
    returnDetails: false,
  }) as unknown;
  const normalized = toStringArray(translated, options);
  if (normalized.length > 0) {
    return normalized;
  }

  if (typeof translated === 'string' && translated && translated !== key) {
    return [interpolateFallback(translated, options)];
  }

  const [ns, path] = parseKey(key);
  return resolveFallbackArray(ns, path, options);
}

/**
 * 获取英语后备值，避免 i18n 未初始化时的空字符串。
 */
export function getFallbackString(
  key: string,
  options?: Record<string, unknown>,
): string {
  const [ns, path] = parseKey(key);
  const fallbackValue = resolveFallbackValue(ns, path);
  if (typeof fallbackValue === 'string') {
    return interpolateFallback(fallbackValue, options);
  }
  if (Array.isArray(fallbackValue)) {
    const joined = toStringArray(fallbackValue, options);
    if (joined.length > 0) {
      return joined.join('\n');
    }
  }

  const defaultValue = options?.['defaultValue'];
  if (typeof defaultValue === 'string') {
    return interpolateFallback(defaultValue, options);
  }
  if (Array.isArray(defaultValue)) {
    const joined = toStringArray(defaultValue, options);
    if (joined.length > 0) {
      return joined.join('\n');
    }
  }

  return key;
}

let initialized = false;
let currentLanguage: SupportedLanguage = DEFAULT_LANGUAGE;

/**
 * 使用检测或指定的语言初始化 i18n。
 */
export async function initI18n(options?: {
  cliLang?: string;
  settingsLang?: string;
}): Promise<void> {
  if (initialized) {
    return;
  }

  const { language } = detectLanguage({
    cliLang: options?.cliLang,
    settingsLang: options?.settingsLang,
  });

  currentLanguage = language;

  await i18nextUse(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: 'common',
    ns: [
      'common',
      'commands',
      'errors',
      'auth',
      'tips',
      'keyboard',
      'dialogs',
      'privacy',
      'phrases',
    ],
    interpolation: {
      escapeValue: false, // React 已自行转义
    },
    react: {
      useSuspense: false, // Ink 不支持 Suspense
    },
  });

  initialized = true;
}

/**
 * 运行时切换当前语言。
 */
export async function changeLanguage(
  language: SupportedLanguage,
): Promise<void> {
  await changeI18nLanguage(language);
  currentLanguage = language;
}

/**
 * 获取当前语言。
 */
export function getCurrentLanguage(): SupportedLanguage {
  return currentLanguage;
}

/**
 * 判断 i18n 是否已经初始化。
 */
export function isI18nInitialized(): boolean {
  return initialized;
}

// 便于外部统一导出
export { i18n };
export * from './types.js';
export { detectLanguage } from './detector.js';
