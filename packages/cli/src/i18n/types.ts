/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CLI 支持的语言列表。
 */
export type SupportedLanguage = 'en' | 'zh-CN';

/**
 * 语言检测的来源（按优先级）。
 */
export type LanguageSource =
  | 'cli-arg'
  | 'env-var'
  | 'settings'
  | 'system'
  | 'default';

/**
 * 语言检测结果。
 */
export interface LanguageDetectionResult {
  language: SupportedLanguage;
  source: LanguageSource;
}

/**
 * 应用使用的翻译命名空间。
 */
export type TranslationNamespace =
  | 'common'
  | 'commands'
  | 'errors'
  | 'auth'
  | 'tips'
  | 'keyboard'
  | 'dialogs'
  | 'privacy'
  | 'phrases';

/**
 * 当没有其他来源时的默认语言。
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/**
 * 所有受支持语言列表。
 */
export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  'en',
  'zh-CN',
];

/**
 * 判断语言代码是否受支持。
 */
export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}
