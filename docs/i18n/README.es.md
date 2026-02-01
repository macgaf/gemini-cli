[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)
| [Français](README.fr.md) | [Deutsch](README.de.md) | [日本語](README.ja.md) |
[한국어](README.ko.md) | [Español](README.es.md) | [Русский](README.ru.md)

# Guía de soporte multilingüe de CLI

Este documento explica el alcance del soporte multilingüe en la CLI actual, cómo
cambiar de idioma y cómo agregar traducciones.

## Idiomas soportados actualmente

- Inglés: `en`
- Chino simplificado: `zh-CN`
- Chino tradicional: `zh-TW`
- Francés: `fr`
- Japonés: `ja`
- Alemán: `de`
- Coreano: `ko`
- Español: `es`
- Ruso: `ru`

### Explicación

- `zh-TW` se basa en la conversión automática de simplificado a tradicional con
  revisión manual. Se recomienda revisar la redacción y el tono con respecto a
  la interfaz de usuario real.
- Si necesita agregar un nuevo idioma, consulte "Cómo agregar traducciones" a
  continuación.

## Cómo cambiar de idioma

Puede seleccionar el idioma de la interfaz de las siguientes maneras (reinicie
la CLI para que surta efecto):

1. **Archivo de configuración** Establecer en `.gemini/settings.json`:

```json
{
  "general": {
    "language": "ja"
  }
}
```

2. **Variable de entorno**

```bash
export GEMINI_LANG=fr
```

3. **Configuración Interactiva**

Ejecute el comando `gemini settings` (o ingrese al menú de configuración
interactiva), navegue hasta la opción `language`, seleccione su idioma y
confirme. Reinicie la CLI para que los cambios surtan efecto.

4. **Configuración Regional del Sistema**

Si las configuraciones anteriores no están establecidas, la CLI utilizará de
forma predeterminada la configuración regional del sistema (si es compatible).

> Si se establecen múltiples fuentes, la prioridad es: Argumentos de línea de
> comandos (si los hay) > Variable de entorno > Archivo de configuración >
> Configuración regional del sistema.

## Cómo agregar traducciones

### Traducciones de capa CLI (IU y avisos)

1. Cree un directorio de idioma en `packages/cli/src/i18n/locales/`, por
   ejemplo, `fr`:

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

2. Puede copiar archivos en inglés como plantilla:

```bash
cp -R packages/cli/src/i18n/locales/en packages/cli/src/i18n/locales/fr
```

3. Modifique `packages/cli/src/i18n/index.ts` para asignar los nuevos recursos
   de idioma a los archivos JSON reales.

### Traducciones de capa Core (Registros y avisos de bajo nivel)

- Core proporciona actualmente archivos de traducción:
  `packages/core/src/i18n/locales/zh-CN.json`,
  `packages/core/src/i18n/locales/zh-TW.json`
- Para otros idiomas, agregue el JSON correspondiente y regístrelo en
  `packages/core/src/i18n/index.ts`.

## Notas de traducción

- Mantenga las claves sin cambios, traduzca solo los valores.
- Mantenga los marcadores de posición de variables sin cambios, por ejemplo,
  `{{name}}`, `{{count}}`.
- Las traducciones de tipo matriz deben mantener la estructura de la matriz.
