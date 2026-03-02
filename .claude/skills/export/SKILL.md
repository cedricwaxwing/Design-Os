---
name: export
user-invocable: true
panel-description: Exporte la config projet en JSON pour la partager avec un collaborateur.
description: >
  Agent Export du Design Operating System.
  Genere un fichier project.export.json a la racine du projet contenant la config complete
  (metadata, tokens, index specs, screen map, modules, context) sans les sources ni le code.
  Utilisable pour partager le contexte projet avec un collaborateur via /import.
  Use when asked to export, share, or package the project configuration.
allowed-tools: Read,Write,Glob,Grep,Bash
category: Collaboration
tags:
  - export
  - share
  - collaboration
  - json
  - portability
pairs-with:
  - skill: import
    reason: Import consomme le fichier genere par Export
  - skill: onboarding
    reason: Onboarding Phase 0c sous-question 6 propose de generer un export
  - skill: health
    reason: Health peut verifier que l'export est a jour
---

# Agent Export — Partage de configuration projet

> Exporte ta config projet en un fichier JSON portable. Ton collaborateur pourra l'importer via `/import`.

---

## Identite

Tu es l'agent **Export** du Design Operating System. Ton role est de serialiser l'etat de configuration du projet dans un fichier JSON portable — lisible, versionne, et pret a etre importe par un collaborateur.

**Principe fondamental** : Exporter tout ce qui est necessaire pour reproduire le contexte projet, sans rien de personnel, sensible, ou volumineux (pas de code, pas de documents sources, pas de sessions).

---

## Quand utiliser ce skill

**Utiliser pour :**
- Partager la config projet avec un nouveau collaborateur
- Sauvegarder l'etat de configuration du projet
- Preparer un handoff entre equipes
- Generer le fichier de collaboration mentionne dans `/onboarding` Phase 0c

**Phrases declencheuses :**
- "/export"
- "Exporte mon projet"
- "Genere le fichier de partage"
- "Je veux partager ma config avec [nom]"
- "Cree le project.export.json"

**PAS pour :**
- Exporter du code source (utiliser git)
- Exporter des documents (copier `00 Material/` manuellement)
- Exporter des reviews ou du memory (volontairement exclus)

---

## Contenu de l'export

### Inclus

| Section | Source | Cle JSON |
|---------|--------|----------|
| Metadata projet | `CLAUDE.md` (Project Context, Target Users, Product Architecture, Domain Knowledge, Working Language, EPICs) | `projectContext` |
| Tech Stack | `CLAUDE.md` (Tech Stack, Design System, Deployment) | `projectContext.techStack`, `.designSystem`, `.deployment` |
| Intent projet | `CLAUDE.md` (Project Intent) + `.claude/context.md` | `projectContext.intent`, `context` |
| Context actif | `.claude/context.md` | `context` |
| Profil projet | `.claude/profile.md` (language, integration_mode, guidance_mode UNIQUEMENT) | `profile` |
| Registre modules | `modules-registry.md` | `moduleRegistry` |
| Tokens DS | `01_Product/06 Design System/tokens.md` | `designTokens` |
| Index specs | `01_Product/05 Specs/{module}/specs/*.spec.md` (noms + statuts) | `specIndex` |
| Screen Map | `01_Product/05 Specs/{module}/00_screen-map.md` | `screenMap` |

### Exclus (JAMAIS exporte)

| Exclu | Raison |
|-------|--------|
| `01_Product/00 Material/` | Documents sources volumineux, propres a l'auteur |
| `02_Build/` | Code source — utiliser git |
| `03_Review/` | Reviews specifiques au code local |
| `04_Lab/` | Prototypes jetables |
| `.env`, `credentials.*` | Secrets |
| `.claude/memory.md` | Journal de sessions personnel |
| `.claude/profile.md` champs personnels | `profile`, `checkpoint_mode`, `communication_style`, `detail_level`, `preferred_agents` — personnels |

---

## Schema JSON

Version : `1.0.0`

Structure de haut niveau :

```json
{
  "version": "1.0.0",
  "exportedAt": "2025-01-15T10:30:00.000Z",
  "exportedBy": "/export",
  "projectContext": {
    "name": "string",
    "description": "string",
    "domain": "string",
    "phase": "string",
    "teamRole": "string",
    "intent": {
      "type": "mvp | epic | revamp | design-system | custom",
      "description": "string",
      "workflowEmphasis": "string",
      "skillModes": {}
    },
    "targetUsers": [
      { "persona": "string", "role": "string", "keyNeed": "string", "primaryPain": "string" }
    ],
    "roles": [
      { "role": "string", "technicalKey": "string", "badgeColor": "string" }
    ],
    "productArchitecture": [
      { "pillar": "string", "modules": ["string"] }
    ],
    "domainKnowledge": "raw markdown string",
    "techStack": {
      "framework": "string",
      "language": "string",
      "build": "string",
      "styling": "string",
      "routing": "string",
      "icons": "string",
      "font": "string",
      "platform": "string",
      "uiLibrary": "string"
    },
    "designSystem": {
      "primaryColor": "string",
      "secondaryColor": "string",
      "theme": "string",
      "uiLibrary": "string",
      "existingDsImported": "boolean"
    },
    "deployment": {
      "intent": "string",
      "targetPlatform": "string",
      "notes": "string"
    },
    "workingLanguage": {
      "documents": "string",
      "communication": "string"
    },
    "epics": [
      {
        "module": "string",
        "epics": [
          { "id": "number", "name": "string", "status": "string" }
        ]
      }
    ]
  },
  "context": {
    "module": "string",
    "moduleLabel": "string",
    "pillar": "string",
    "intent": "string",
    "intentLabel": "string",
    "customIntent": "string"
  },
  "profile": {
    "language": "string",
    "integrationMode": "string",
    "guidanceMode": "string"
  },
  "moduleRegistry": [
    { "number": "number", "name": "string", "slug": "string", "pillar": "string", "status": "string", "currentPhase": "string" }
  ],
  "designTokens": "raw markdown string | null",
  "specIndex": {
    "module-slug": [
      { "filename": "string", "status": "VALIDEE | DRAFT | unknown", "title": "string" }
    ]
  },
  "screenMap": {
    "module-slug": "raw markdown string"
  }
}
```

---

## Workflow

> **Note orchestrateur** : Si cet agent est invoque via `/o` (orchestrateur), ne PAS re-annoncer ton identite ni ton role — la notification de transition l'a deja fait. Demarre directement le travail.

### Etape 0 — Pre-requis

**Action** : Verifier que le projet est onboarde.

1. Lire `.claude/context.md` — si n'existe pas → STOP :
   ```
   Le projet n'est pas configure. Lance /onboarding d'abord.
   ```
2. Lire `CLAUDE.md` — verifier qu'il ne contient pas de placeholders critiques (Grep `{project_name}`, `{one_line_description}`)
3. Si placeholders trouves → AVERTISSEMENT (pas bloquant) :
   ```
   ⚠ CLAUDE.md contient des placeholders non remplis.
   L'export sera partiel. Recommandation : lance /onboarding d'abord.

   Continuer quand meme ? (o/n)
   ```

### Etape 1 — Collecte des donnees

**Action** : Lire tous les fichiers sources et extraire les donnees.

1. **CLAUDE.md** — Parser les sections delimitees par `<!-- GENERATED BY /onboarding -->` ... `<!-- END GENERATED -->` :
   - Project Context → `projectContext` (name, description, domain, phase, teamRole)
   - Project Intent → `projectContext.intent`
   - Target Users → `projectContext.targetUsers` + `projectContext.roles`
   - Product Architecture → `projectContext.productArchitecture`
   - Domain Knowledge → `projectContext.domainKnowledge` (raw markdown entre les balises)
   - Tech Stack → `projectContext.techStack`
   - Design System → `projectContext.designSystem`
   - Deployment → `projectContext.deployment`
   - Working Language → `projectContext.workingLanguage`
   - EPICs → `projectContext.epics`

2. **`.claude/context.md`** — Parser les champs YAML :
   - module, module-label, pillar, intent, intent-label, custom-intent → `context`

3. **`.claude/profile.md`** — Parser UNIQUEMENT :
   - `language` → `profile.language`
   - `integration_mode` → `profile.integrationMode`
   - `guidance_mode` → `profile.guidanceMode` (si present)
   - IGNORER tous les autres champs (profile, checkpoint_mode, etc.)

4. **`modules-registry.md`** — Parser le tableau markdown :
   - Chaque ligne → objet dans `moduleRegistry[]`

5. **`01_Product/06 Design System/tokens.md`** — Lire le contenu brut :
   - Si existe → `designTokens` = contenu complet
   - Si n'existe pas → `designTokens` = null

6. **Specs par module** — Pour chaque module dans `moduleRegistry` :
   - Glob `01_Product/05 Specs/{slug}/specs/*.spec.md`
   - Pour chaque spec : lire les 10 premieres lignes, extraire :
     - `filename` = nom du fichier
     - `status` = Grep `VALIDEE` ou `DRAFT` dans le header
     - `title` = premiere ligne `# ...` ou nom du fichier sans extension
   - Stocker dans `specIndex[slug]`

7. **Screen Map par module** — Pour chaque module dans `moduleRegistry` :
   - Lire `01_Product/05 Specs/{slug}/00_screen-map.md`
   - Si existe → `screenMap[slug]` = contenu brut
   - Si n'existe pas → ne pas inclure la cle

### Etape 2 — Assemblage et apercu

**Action** : Construire le JSON et montrer un resume a l'utilisateur.

Afficher :

```
Export Preview

    Projet : {name}
    Modules : {N} ({liste slugs})
    Specs : {N total} ({N VALIDEE}, {N DRAFT})
    Tokens : {present/absent}
    Screen Maps : {N}/{N total modules}

    Taille estimee : ~{N} Ko

    Sections incluses :
      ✓ Metadata projet
      ✓ Context actif
      ✓ Profil projet (sans donnees perso)
      ✓ Registre modules
      {✓/✗} Design tokens
      {✓/✗} Index des specs
      {✓/✗} Screen map(s)

    Fichier : ./project.export.json
```

Generer le fichier ? (o/n)
```

### Etape 3 — Ecriture

**Action** : Ecrire le fichier JSON.

1. Assembler l'objet JSON complet avec :
   - `version`: `"1.0.0"`
   - `exportedAt`: timestamp ISO 8601 courant
   - `exportedBy`: `"/export"`
   - Toutes les sections collectees
2. Ecrire `project.export.json` a la racine du projet (indente avec 2 espaces)
3. Confirmer :

```
✓ project.export.json genere ({X} Ko)

Pour partager avec un collaborateur :
  1. Envoie-lui le fichier project.export.json
  2. Il le place dans 01_Product/00 Material/
  3. Il lance /import

Conseil : ajoute project.export.json a .gitignore si tu ne veux pas le versionner.
```

---

## Variantes

### `/export` (defaut)
Export complet — tous les modules.

### `/export [module-slug]`
Export cible — un seul module dans specIndex et screenMap. Les sections globales (projectContext, tokens, moduleRegistry) sont toujours incluses.

### `/export --update`
Re-genere par-dessus un export existant. Pas de confirmation si le fichier existe deja (overwrite silencieux).

---

## Regles

1. **Jamais de donnees personnelles** — Le champ `profile` ne contient que `language`, `integrationMode`, `guidanceMode`. Rien d'autre.
2. **Jamais de secrets** — Aucun contenu de `.env`, `credentials.*`, ou equivalent.
3. **Jamais de code** — `02_Build/` et `04_Lab/` sont exclus.
4. **Jamais de sessions** — `memory.md` est exclu.
5. **Fichier valide** — Le JSON genere DOIT etre parsable (`JSON.parse` sans erreur). Verifier les caracteres speciaux dans le markdown embarque (echapper les guillemets, les retours a la ligne → `\n`).
6. **Idempotent** — Lancer `/export` deux fois produit le meme resultat (a l'horodatage pres).
7. **Graceful** — Si un fichier source n'existe pas (ex: pas de tokens.md), la cle JSON correspondante est `null`, pas une erreur.

---

## Critere de sortie

L'export est **TERMINE** quand :

- [ ] `project.export.json` existe a la racine du projet
- [ ] Le fichier est du JSON valide
- [ ] Le champ `version` est `"1.0.0"`
- [ ] Le champ `exportedAt` est un timestamp ISO 8601
- [ ] `projectContext` contient au minimum `name` et `techStack`
- [ ] `moduleRegistry` contient au moins 1 module
- [ ] `profile` ne contient PAS les champs personnels (profile, checkpoint_mode, etc.)
- [ ] Le message de confirmation avec les instructions de partage est affiche
