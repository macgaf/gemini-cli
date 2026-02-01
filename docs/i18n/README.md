[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)
| [Français](README.fr.md) | [Deutsch](README.de.md) | [日本語](README.ja.md) |
[한국어](README.ko.md) | [Español](README.es.md) | [Русский](README.ru.md)

# CLI Multi-language Support Guide

This document explains the scope of multi-language support in the current CLI,
how to switch languages, and how to add translations.

## Currently Supported Languages

- English: `en`
- Simplified Chinese: `zh-CN`
- Traditional Chinese: `zh-TW`
- French: `fr`
- Japanese: `ja`
- German: `de`
- Korean: `ko`
- Spanish: `es`
- Russian: `ru`

### Explanation

- `zh-TW` is based on automated Simplified-Traditional conversion with manual
  revision. It is recommended to review wording and tone against the actual UI.
- If you need to add a new language, please refer to "How to Add Translations"
  below.

## How to Switch Languages

You can select the interface language in the following ways (restart CLI to take
effect):

1. **Settings File** Set in `.gemini/settings.json`:

```json
{
  "general": {
    "language": "ja"
  }
}
```

2. **Environment Variable**

```bash
export GEMINI_LANG=fr
```

```bash
export GEMINI_LANG=fr
```

3. **Interactive Settings**

Run the `gemini settings` command (or enter the interactive settings menu),
navigate to the `language` option, select your language, and confirm. Restart
the CLI for changes to take effect.

4. **System Locale**

If the above configurations are not set, the CLI will default to using the
system's locale (if supported).

> If multiple sources are set, priority is: Command Line Args (if any) >
> Environment Variable > Settings File > System Locale.

## How to Add Translations

### CLI Layer Translations (UI & Prompts)

1. Create a language directory under `packages/cli/src/i18n/locales/`, e.g.,
   `fr`:

```
packages/cli/src/i18n/locales/fr/
  common.json
  commands.json
  errors.json
  auth.json
  tips.json
  keyboard.json
  dialogs.json
  privacy.json
  phrases.json
```

2. You can copy English files as a template:

```bash
cp -R packages/cli/src/i18n/locales/en packages/cli/src/i18n/locales/fr
```

3. Modify `packages/cli/src/i18n/index.ts` to map the new language resources to
   the actual JSON files.

### Core Layer Translations (Logs & Low-level Prompts)

- Core currently provides translation files:
  `packages/core/src/i18n/locales/zh-CN.json`,
  `packages/core/src/i18n/locales/zh-TW.json`
- For other languages, add corresponding JSON and register in
  `packages/core/src/i18n/index.ts`.

## Translation Notes

- Keep keys unchanged, translate only values.
- Keep variable placeholders unchanged, e.g., `{{name}}`, `{{count}}`.
- Array type translations must maintain array structure.
