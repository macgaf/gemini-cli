[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)
| [Français](README.fr.md) | [Deutsch](README.de.md) | [日本語](README.ja.md) |
[한국어](README.ko.md) | [Español](README.es.md) | [Русский](README.ru.md)

# CLI 多語言支援說明

本文件說明當前 CLI 的多語言支援範圍、切換方式，以及如何補充翻譯內容。

## 當前支援的語言

- 英語：`en`
- 簡體中文：`zh-CN`
- 繁體中文：`zh-TW`
- 法語：`fr`
- 日語：`ja`
- 德語：`de`
- 韓語：`ko`
- 西班牙語：`es`
- 俄語：`ru`

### 說明

- `zh-TW` 基於簡繁自動轉換並進行了人工修訂，仍建議結合實際 UI 複核用詞與語氣。
- 若需要新增語言，請參考下文「如何補充翻譯」。

## 如何切換語言

您可以透過以下方式選擇介面語言（修改後需要重啟 CLI 生效）：

1. **設定檔** 在 `.gemini/settings.json` 中設定：

```json
{
  "general": {
    "language": "ja"
  }
}
```

2. **環境變數**

```bash
export GEMINI_LANG=fr
```

```bash
export GEMINI_LANG=fr
```

3. **交互式設定**

運行 `gemini settings` 命令（或進入交互模式的設定選單），導航至 `language`
選項，選擇語言並在確認後重啟 CLI。

4. **系統區域設定**

若未配置上述選項，CLI 將預設使用系統的區域設定（如果支援）。

> 若同時設定了多種來源，優先級為：命令列參數（若存在） > 環境變數 > 設定檔 > 系統區域設定。

## 如何補充翻譯

### CLI 層翻譯（介面與提示）

1. 在 `packages/cli/src/i18n/locales/` 下建立語言目錄，例如 `fr`：

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

2. 可以先複製英文檔案作為範本：

```bash
cp -R packages/cli/src/i18n/locales/en packages/cli/src/i18n/locales/fr
```

3. 修改 `packages/cli/src/i18n/index.ts`，將新語言資源映射到實際的 JSON 檔案。

### Core 層翻譯（日誌與底層提示）

- Core 目前提供中文翻譯檔案：`packages/core/src/i18n/locales/zh-CN.json`、`packages/core/src/i18n/locales/zh-TW.json`
- 如需其他語言，可新增對應 JSON，並在 `packages/core/src/i18n/index.ts` 中註冊

## 翻譯注意事項

- 保持 key 不變，僅翻譯 value
- 保持變數佔位符不變，例如 `{{name}}`、`{{count}}`
- 陣列類型的翻譯需保持陣列結構
