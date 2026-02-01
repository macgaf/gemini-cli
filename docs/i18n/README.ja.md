[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)
| [Français](README.fr.md) | [Deutsch](README.de.md) | [日本語](README.ja.md) |
[한국어](README.ko.md) | [Español](README.es.md) | [Русский](README.ru.md)

# CLI 多言語サポートガイド

このドキュメントでは、現在の CLI における多言語サポートの範囲、言語の切り替え方法、および翻訳の追加方法について説明します。

## 現在サポートされている言語

- 英語：`en`
- 簡体字中国語：`zh-CN`
- 繁体字中国語：`zh-TW`
- フランス語：`fr`
- 日本語：`ja`
- ドイツ語：`de`
- 韓国語：`ko`
- スペイン語：`es`
- ロシア語：`ru`

### 説明

- `zh-TW`
  は、自動化された簡体字-繁体字変換と手動修正に基づいています。実際の UI と比較して、用語やトーンを確認することをお勧めします。
- 新しい言語を追加する必要がある場合は、以下の「翻訳の追加方法」を参照してください。

## 言語の切り替え方法

以下の方法でインターフェース言語を選択できます（変更を反映するには CLI を再起動する必要があります）：

1. **設定ファイル** `.gemini/settings.json` で設定：

```json
{
  "general": {
    "language": "ja"
  }
}
```

2. **環境変数**

```bash
export GEMINI_LANG=fr
```

3. **インタラクティブ設定**

`gemini settings`
コマンドを実行し（またはインタラクティブな設定メニューに入り）、`language`
オプションに移動して言語を選択し、確認します。変更を適用するには、CLI を再起動してください。

4. **システムロケール**

上記の設定が行われていない場合、CLI はデフォルトでシステムのロケールを使用します（サポートされている場合）。

> 複数のソースが設定されている場合、優先順位は次のとおりです：コマンドライン引数（存在する場合） > 環境変数 > 設定ファイル > システムロケール。

## 翻訳の追加方法

### CLI レイヤー翻訳（UI とプロンプト）

1. `packages/cli/src/i18n/locales/`
   の下に言語ディレクトリを作成します。例：`fr`：

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

2. 英語のファイルをテンプレートとしてコピーできます：

```bash
cp -R packages/cli/src/i18n/locales/en packages/cli/src/i18n/locales/fr
```

3. `packages/cli/src/i18n/index.ts`
   を修正して、新しい言語リソースを実際の JSON ファイルにマッピングします。

### Core レイヤー翻訳（ログと低レベルプロンプト）

- Core は現在、以下の翻訳ファイルを提供しています：`packages/core/src/i18n/locales/zh-CN.json`、`packages/core/src/i18n/locales/zh-TW.json`
- その他の言語については、対応する JSON を追加し、`packages/core/src/i18n/index.ts`
  に登録してください。

## 翻訳に関する注意事項

- キーは変更せず、値のみを翻訳してください。
- `{{name}}`、`{{count}}` などの変数のプレースホルダーは変更しないでください。
- 配列タイプの翻訳は、配列構造を維持する必要があります。
