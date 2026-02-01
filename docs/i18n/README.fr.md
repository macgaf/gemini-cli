[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)
| [Français](README.fr.md) | [Deutsch](README.de.md) | [日本語](README.ja.md) |
[한국어](README.ko.md) | [Español](README.es.md) | [Русский](README.ru.md)

# Guide de support multilingue CLI

Ce document explique la portée du support multilingue dans le CLI actuel,
comment changer de langue et comment ajouter des traductions.

## Langues actuellement prises en charge

- Anglais : `en`
- Chinois simplifié : `zh-CN`
- Chinois traditionnel : `zh-TW`
- Français : `fr`
- Japonais : `ja`
- Allemand : `de`
- Coréen : `ko`
- Espagnol : `es`
- Russe : `ru`

### Explication

- `zh-TW` est basé sur une conversion automatisée Simplifié-Traditionnel avec
  révision manuelle. Il est recommandé de revoir la formulation et le ton par
  rapport à l'interface utilisateur réelle.
- Si vous devez ajouter une nouvelle langue, veuillez vous référer à "Comment
  ajouter des traductions" ci-dessous.

## Comment changer de langue

Vous pouvez sélectionner la langue de l'interface des manières suivantes
(redémarrer le CLI pour prendre effet) :

1. **Fichier de paramètres** Définir dans `.gemini/settings.json` :

```json
{
  "general": {
    "language": "ja"
  }
}
```

2. **Variable d'environnement**

```bash
export GEMINI_LANG=fr
```

```bash
export GEMINI_LANG=fr
```

3. **Paramètres interactifs**

Exécutez la commande `gemini settings` (ou entrez dans le menu des paramètres
interactifs), accédez à l'option `language`, sélectionnez votre langue et
confirmez. Redémarrez la CLI pour que les modifications prennent effet.

4. **Paramètres régionaux du système**

Si les configurations ci-dessus ne sont pas définies, la CLI utilisera par
défaut les paramètres régionaux du système (s'ils sont pris en charge).

> Si plusieurs sources sont définies, la priorité est : Arguments de ligne de
> commande (si présents) > Variable d'environnement > Fichier de paramètres >
> Paramètres régionaux du système.

## Comment ajouter des traductions

### Traductions de la couche CLI (Interface et Invites)

1. Créez un répertoire de langue sous `packages/cli/src/i18n/locales/`, par
   exemple `fr` :

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

2. Vous pouvez copier les fichiers anglais comme modèle :

```bash
cp -R packages/cli/src/i18n/locales/en packages/cli/src/i18n/locales/fr
```

3. Modifiez `packages/cli/src/i18n/index.ts` pour mapper les nouvelles
   ressources linguistiques aux fichiers JSON réels.

### Traductions de la couche Core (Journaux et Invites de bas niveau)

- Core fournit actuellement des fichiers de traduction :
  `packages/core/src/i18n/locales/zh-CN.json`,
  `packages/core/src/i18n/locales/zh-TW.json`
- Pour les autres langues, ajoutez le JSON correspondant et enregistrez-le dans
  `packages/core/src/i18n/index.ts`.

## Notes de traduction

- Gardez les clés inchangées, traduisez uniquement les valeurs.
- Gardez les espaces réservés aux variables inchangés, par exemple `{{name}}`,
  `{{count}}`.
- Les traductions de type tableau doivent conserver la structure du tableau.
