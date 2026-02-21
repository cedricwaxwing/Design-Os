# 02 Discovery — Comprendre les utilisateurs et le domaine

> Tout ce qui concerne la recherche utilisateur et la comprehension du domaine.

---

## Sous-dossiers

| Dossier | Contenu | Quand le remplir |
|---------|---------|------------------|
| `01 Domain Context/` | Regles metier, terminologie, processus existants | Au demarrage du projet |
| `02 User Interviews/` | Comptes-rendus d'entretiens, verbatims | Pendant la phase Discovery |
| `03 Research Insights/` | Syntheses, patterns identifies, hypotheses | Apres les interviews |
| `04 Personas/` | Fiches personas (template fourni) | Pendant l'onboarding ou Discovery |

## Comment alimenter la Discovery

### Option 1 — Pipeline Material (recommande si tu as des documents)
Place tes documents dans `00 Material/`, puis :
- **`/onboarding`** (Phase 7) scanne, convertit et extrait automatiquement
- **`/discovery`** (Etape 0b) detecte le material non exploite et propose l'ingestion

| Type de document dans Material | Extrait vers |
|-------------------------------|-------------|
| Documents metier, regles, processus | `01 Domain Context/` |
| Interviews, verbatims, transcripts | `02 User Interviews/` |
| Benchmarks, surveys, analytics | `03 Research Insights/` |
| Descriptions d'utilisateurs, retours | `04 Personas/` |

### Option 2 — Avec les agents (recommande si tu pars de zero)
- **`/discovery`** — Workshop guide complet pour construire le contexte par la conversation
- **`/discovery personas`** — Approfondir les personas existants
- **`/discovery hypotheses`** — Cartographier et prioriser les hypotheses

### Option 3 — Manuellement
Cree les fichiers directement dans les sous-dossiers ci-dessous. Chaque sous-dossier contient un template (`_template-*.md`) pour guider la structure.

## Templates disponibles

| Sous-dossier | Template | Contenu |
|-------------|----------|---------|
| `01 Domain Context/` | `_template-domain-context.md` | Glossaire, regles metier, processus, contraintes, ecosystem |
| `02 User Interviews/` | `_template-interview.md` | Metadata, points cles, verbatims, pain points, besoins |
| `03 Research Insights/` | `_template-insight.md` | Constat, impact produit, evidence, recommandation |
| `03 Research Insights/` | `_template-synthesis.md` | Patterns, JTBD, opportunities (synthese cross-interviews) |
| `04 Personas/` | `_template-persona.md` | Profil, journee type, frustrations, objectifs, outils |

## Impact sur les agents

Les agents consultent cette section pour :
- **`/ux`** — Ancrer les hypotheses de design dans des insights reels
- **`/spec`** — Reference les contraintes metier dans les dependances
- **`/onboarding`** — Genere les personas et le brief produit
- **`/discovery`** — Enrichit et structure le contenu de recherche
- **`/review`** — Identifie les gaps de type DISCOVERY

## Astuce

Plus la Discovery est riche, meilleurs sont les outputs des agents. Un dossier vide = les agents travaillent sur des assumptions.
