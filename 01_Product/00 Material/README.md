# 00 Material — Sources brutes

> Point d'entree du Design OS. Depose ici tous les documents qui alimentent la strategie et la discovery.

---

## Types de documents attendus

| Type | Exemples | Utilise par |
|------|----------|-------------|
| **Briefs & Notes** | Briefs internes, notes de reunion, comptes-rendus | `/onboarding`, `/ux` |
| **Recherche marche** | Etudes de marche, analyses concurrentielles, benchmarks | `/ux`, `/spec` |
| **Captures produit** | Screenshots de produits existants ou concurrents | `/ux`, `/ui` |
| **Contraintes metier** | Documents reglementaires, normes, contraintes techniques | `/spec`, `/build` |
| **Retours utilisateurs** | Verbatims, surveys, feedbacks, tickets support | `/ux`, Discovery |
| **Assets visuels** | Exports Figma, moodboards, wireframes papier scannes | `/ui`, `/ux` |
| **Donnees** | Exports analytics, metriques d'usage, KPIs actuels | Strategy, `/ux` |

## Convention de nommage

```
[YYYY-MM-DD]-[type]-[nom].[ext]
```

**Types** : `brief`, `benchmark`, `interview`, `survey`, `analytics`, `regulatory`, `moodboard`, `notes`

**Exemples** :
- `2026-02-21-benchmark-competitors.pdf`
- `2026-01-15-interview-pharmacist-01.md`
- `2026-02-10-brief-product-v2.docx`

## Comment ces documents sont utilises

Les agents du Design OS consultent ce dossier pour ancrer leurs decisions dans le contexte reel du projet :

1. **`/onboarding`** (Phase 7) — Propose d'extraire un draft de brief/vision depuis les documents presents
2. **`/ux`** — Ancre les hypotheses de design dans les insights terrain
3. **`/spec`** — Reference les contraintes metier dans la section Dependencies
4. **`/ui`** — S'inspire des moodboards et benchmarks pour les propositions visuelles

## Formats supportes

Les agents du Design OS lisent les fichiers via Claude Code. Voici ce qui est processable :

| Format | Lisible nativement | Conversion recommandee |
|--------|-------------------|----------------------|
| `.md`, `.txt`, `.csv`, `.json` | Oui | — |
| `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp` | Oui (analyse visuelle) | — |
| `.svg` | Oui (code SVG) | — |
| `.pdf` | Non | `pdftotext "fichier.pdf" "fichier.txt"` |
| `.xlsx`, `.xls` | Non | `xlsx2csv "fichier.xlsx" > "fichier.csv"` |
| `.docx` | Non | `pandoc "fichier.docx" -o "fichier.md"` |
| `.pptx` | Non | Exporter les slides en PNG ou noter les points cles en `.md` |
| Figma | Via MCP Figma | Fournir le lien `figma.com/design/...`, les agents utilisent l'integration MCP |

**Regle** : Plus c'est en `.md` et `.csv`, mieux les agents travaillent. Les formats binaires (PDF, Excel, Word) doivent etre convertis pour une extraction optimale.

## Preparer ses documents

### Conversion rapide

Si tu as des documents dans des formats non lisibles, voici les commandes de conversion :

**PDF → Texte** :
```bash
# Installer (macOS)
brew install poppler
# Convertir
pdftotext "mon-document.pdf" "mon-document.txt"
# Ou pour garder la mise en page
pdftotext -layout "mon-document.pdf" "mon-document.txt"
```

**Excel → CSV** :
```bash
# Installer
pip install xlsx2csv
# Convertir
xlsx2csv "mon-fichier.xlsx" > "mon-fichier.csv"
# Ou pour une feuille specifique
xlsx2csv -s 2 "mon-fichier.xlsx" > "feuille-2.csv"
```

**Word → Markdown** :
```bash
# Installer (macOS)
brew install pandoc
# Convertir
pandoc "mon-document.docx" -o "mon-document.md"
```

**PowerPoint** : Pas de conversion CLI simple. Options :
- Exporter les slides en images PNG depuis PowerPoint
- Copier-coller les points cles dans un `.md`

### Conversion automatique pendant l'onboarding

Quand tu lances `/onboarding` (Phase 7) ou `/discovery`, les agents :
1. Scannent le dossier et classifient les fichiers par type
2. Detectent les outils de conversion installes sur ta machine
3. Proposent de convertir automatiquement les fichiers non lisibles
4. Extraient et dispatchent le contenu dans les bons dossiers Discovery

## Pipeline d'extraction Material → Product

Les agents peuvent extraire automatiquement depuis tes documents :

| Type de document dans Material | Extrait vers | Agent |
|-------------------------------|-------------|-------|
| Briefs, notes strategiques | `01 Strategy/product-brief.md`, `northstar-vision.md` | `/onboarding` Phase 7 |
| Documents metier, regles | `02 Discovery/01 Domain Context/` | `/onboarding` Phase 7, `/discovery` |
| Interviews, verbatims, transcripts | `02 Discovery/02 User Interviews/` | `/discovery` |
| Benchmarks, surveys, analytics | `02 Discovery/03 Research Insights/` | `/discovery` |
| Descriptions d'utilisateurs, retours | `02 Discovery/04 Personas/` | `/onboarding` Phase 7, `/discovery` |
| Moodboards, screenshots, Figma | `04 Specs/{module}/screens/` | `/ui`, `/ux` |

## Astuce

Plus ce dossier est riche, plus les agents produisent des outputs contextuels et pertinents.
Un dossier vide = les agents travaillent sur des assumptions. Un dossier nourri = les agents travaillent sur des faits.
