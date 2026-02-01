[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)
| [Français](README.fr.md) | [Deutsch](README.de.md) | [日本語](README.ja.md) |
[한국어](README.ko.md) | [Español](README.es.md) | [Русский](README.ru.md)

# CLI Multi-Language-Support-Leitfaden

Dieses Dokument erläutert den Umfang der mehrsprachigen Unterstützung in der
aktuellen CLI, wie man die Sprache wechselt und wie man Übersetzungen hinzufügt.

## Aktuell unterstützte Sprachen

- Englisch: `en`
- Vereinfachtes Chinesisch: `zh-CN`
- Traditionelles Chinesisch: `zh-TW`
- Französisch: `fr`
- Japanisch: `ja`
- Deutsch: `de`
- Koreanisch: `ko`
- Spanisch: `es`
- Russisch: `ru`

### Erklärung

- `zh-TW` basiert auf einer automatisierten Konvertierung von vereinfachtem zu
  traditionellem Chinesisch mit manueller Überarbeitung. Es wird empfohlen,
  Wortwahl und Tonfall anhand der tatsächlichen Benutzeroberfläche zu
  überprüfen.
- Wenn Sie eine neue Sprache hinzufügen müssen, lesen Sie bitte unten "Wie man
  Übersetzungen hinzufügt".

## Wie man die Sprache wechselt

Sie können die Oberflächensprache auf folgende Weise auswählen (CLI neu starten,
damit die Änderung wirksam wird):

1. **Einstellungsdatei** In `.gemini/settings.json` festlegen:

```json
{
  "general": {
    "language": "ja"
  }
}
```

2. **Umgebungsvariable**

```bash
export GEMINI_LANG=fr
```

```bash
export GEMINI_LANG=fr
```

3. **Interaktive Einstellungen**

Führen Sie den Befehl `gemini settings` aus (oder rufen Sie das interaktive
Einstellungsmenü auf), navigieren Sie zur Option `language`, wählen Sie Ihre
Sprache aus und bestätigen Sie. Starten Sie die CLI neu, damit die Änderungen
wirksam werden.

4. **Systemgebietsschema**

Wenn die oben genannten Konfigurationen nicht festgelegt sind, verwendet die CLI
standardmäßig das Systemgebietsschema (sofern unterstützt).

> Wenn mehrere Quellen festgelegt sind, ist die Priorität:
> Befehlszeilenargumente (falls vorhanden) > Umgebungsvariable >
> Einstellungsdatei > Systemgebietsschema.

## Wie man Übersetzungen hinzufügt

### Übersetzungen der CLI-Ebene (UI & Eingabeaufforderungen)

1. Erstellen Sie ein Sprachverzeichnis unter `packages/cli/src/i18n/locales/`,
   z. B. `fr`:

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

2. Sie können englische Dateien als Vorlage kopieren:

```bash
cp -R packages/cli/src/i18n/locales/en packages/cli/src/i18n/locales/fr
```

3. Ändern Sie `packages/cli/src/i18n/index.ts`, um die neuen Sprachressourcen
   den tatsächlichen JSON-Dateien zuzuordnen.

### Übersetzungen der Core-Ebene (Protokolle & Low-Level-Eingabeaufforderungen)

- Core bietet derzeit Übersetzungsdateien:
  `packages/core/src/i18n/locales/zh-CN.json`,
  `packages/core/src/i18n/locales/zh-TW.json`
- Für andere Sprachen fügen Sie das entsprechende JSON hinzu und registrieren es
  in `packages/core/src/i18n/index.ts`.

## Übersetzungshinweise

- Schlüssel unverändert lassen, nur Werte übersetzen.
- Variablenplatzhalter unverändert lassen, z. B. `{{name}}`, `{{count}}`.
- Übersetzungen vom Typ Array müssen die Array-Struktur beibehalten.
