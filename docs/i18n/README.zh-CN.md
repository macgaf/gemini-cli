[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)
| [Français](README.fr.md) | [Deutsch](README.de.md) | [日本語](README.ja.md) |
[한국어](README.ko.md) | [Español](README.es.md) | [Русский](README.ru.md)

# CLI 多语言支持说明

本文档说明当前 CLI 的多语言支持范围、切换方式，以及如何补充翻译内容。

## 当前支持的语言

- 英语：`en`
- 简体中文：`zh-CN`
- 繁体中文：`zh-TW`
- 法语：`fr`
- 日语：`ja`
- 德语：`de`
- 韩语：`ko`
- 西班牙语：`es`
- 俄语：`ru`

### 说明

- `zh-TW` 基于简繁自动转换并进行了人工修订，仍建议结合实际 UI 复核用词与语气。
- 若需要添加新语言，请参考下文“如何补充翻译”。

## 如何切换语言

你可以通过以下方式选择界面语言（修改后需要重启 CLI 生效）：

1. **设置文件** 在 `.gemini/settings.json` 中设置：

```json
{
  "general": {
    "language": "ja"
  }
}
```

2. **环境变量**

```bash
export GEMINI_LANG=fr
```

```bash
export GEMINI_LANG=fr
```

3. **交互式设置**

运行 `gemini settings` 命令（或进入交互模式的设置菜单），导航至 `language`
选项，选择语言并在确认后重启 CLI。

4. **系统区域设置**

若未配置上述选项，CLI 将默认使用系统的区域设置（如果支持）。

> 若同时设置了多种来源，优先级为：命令行参数（若存在） > 环境变量 > 设置文件 > 系统区域设置。

## 如何补充翻译

### CLI 层翻译（界面与提示）

1. 在 `packages/cli/src/i18n/locales/` 下创建语言目录，例如 `fr`：

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

2. 可以先复制英文文件作为模板：

```bash
cp -R packages/cli/src/i18n/locales/en packages/cli/src/i18n/locales/fr
```

3. 修改 `packages/cli/src/i18n/index.ts`，将新语言资源映射到实际的 JSON 文件。

### Core 层翻译（日志与底层提示）

- Core 目前提供中文翻译文件：`packages/core/src/i18n/locales/zh-CN.json`、`packages/core/src/i18n/locales/zh-TW.json`
- 如需其他语言，可新增对应 JSON，并在 `packages/core/src/i18n/index.ts` 中注册

## 翻译注意事项

- 保持 key 不变，仅翻译 value
- 保持变量占位符不变，例如 `{{name}}`、`{{count}}`
- 数组类型的翻译需保持数组结构
