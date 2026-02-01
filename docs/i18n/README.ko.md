[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)
| [Français](README.fr.md) | [Deutsch](README.de.md) | [日本語](README.ja.md) |
[한국어](README.ko.md) | [Español](README.es.md) | [Русский](README.ru.md)

# CLI 다국어 지원 가이드

이 문서는 현재 CLI의 다국어 지원 범위, 언어 전환 방법 및 번역 추가 방법을
설명합니다.

## 현재 지원되는 언어

- 영어: `en`
- 중국어 간체: `zh-CN`
- 중국어 번체: `zh-TW`
- 프랑스어: `fr`
- 일본어: `ja`
- 독일어: `de`
- 한국어: `ko`
- 스페인어: `es`
- 러시아어: `ru`

### 설명

- `zh-TW`는 자동화된 간체-번체 변환 및 수동 수정에 기반합니다. 실제 UI와
  비교하여 용어와 어조를 검토하는 것이 좋습니다.
- 새 언어를 추가해야 하는 경우 아래의 "번역 추가 방법"을 참조하세요.

## 언어 전환 방법

다음과 같은 방법으로 인터페이스 언어를 선택할 수 있습니다 (변경 사항을
적용하려면 CLI를 다시 시작해야 함):

1. **설정 파일** `.gemini/settings.json`에서 설정:

```json
{
  "general": {
    "language": "ja"
  }
}
```

2. **환경 변수**

```bash
export GEMINI_LANG=fr
```

3. **대화형 설정**

`gemini settings` 명령을 실행하고(또는 대화형 설정 메뉴로 이동), `language`
옵션으로 이동하여 언어를 선택하고 확인하십시오. 변경 사항을 적용하려면 CLI를
다시 시작하십시오.

4. **시스템 로캘**

위의 구성이 설정되지 않은 경우, CLI는 기본적으로 시스템 로캘을
사용합니다(지원되는 경우)。.

> 여러 소스가 설정된 경우 우선순위는 다음과 같습니다: 명령줄 인수 (있는 경우) >
> 환경 변수 > 설정 파일 > 시스템 로케일.

## 번역 추가 방법

### CLI 레이어 번역 (UI 및 프롬프트)

1. `packages/cli/src/i18n/locales/` 아래에 언어 디렉터리를 생성합니다. 예: `fr`:

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

2. 영어 파일을 템플릿으로 복사할 수 있습니다:

```bash
cp -R packages/cli/src/i18n/locales/en packages/cli/src/i18n/locales/fr
```

3. `packages/cli/src/i18n/index.ts`를 수정하여 새 언어 리소스를 실제 JSON 파일에
   매핑합니다.

### Core 레이어 번역 (로그 및 저수준 프롬프트)

- Core는 현재 다음 번역 파일을 제공합니다:
  `packages/core/src/i18n/locales/zh-CN.json`,
  `packages/core/src/i18n/locales/zh-TW.json`
- 다른 언어의 경우 해당 JSON을 추가하고 `packages/core/src/i18n/index.ts`에
  등록하세요.

## 번역 시 주의 사항

- 키는 변경하지 말고 값만 번역하세요.
- `{{name}}`, `{{count}}`와 같은 변수 자리 표시자는 변경하지 마세요.
- 배열 유형의 번역은 배열 구조를 유지해야 합니다.
