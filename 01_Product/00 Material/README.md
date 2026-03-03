# 00 Material — Raw Sources

> Entry point for Design OS. Drop here all documents that feed strategy and discovery.

---

## Expected document types

| Type | Examples | Used by |
|------|----------|---------|
| **Briefs & Notes** | Internal briefs, meeting notes, reports | `/onboarding`, `/ux` |
| **Market research** | Market studies, competitive analyses, benchmarks | `/ux`, `/spec` |
| **Product captures** | Screenshots of existing or competitor products | `/ux`, `/ui` |
| **Business constraints** | Regulatory documents, standards, technical constraints | `/spec`, `/build` |
| **User feedback** | Verbatims, surveys, feedback, support tickets | `/ux`, Discovery |
| **Visual assets** | Figma exports, moodboards, scanned paper wireframes | `/ui`, `/ux` |
| **Data** | Analytics exports, usage metrics, current KPIs | Strategy, `/ux` |

## Naming convention

```
[YYYY-MM-DD]-[type]-[name].[ext]
```

**Types**: `brief`, `benchmark`, `interview`, `survey`, `analytics`, `regulatory`, `moodboard`, `notes`

**Examples**:
- `2026-02-21-benchmark-competitors.pdf`
- `2026-01-15-interview-pharmacist-01.md`
- `2026-02-10-brief-product-v2.docx`

## How these documents are used

Design OS agents consult this folder to anchor their decisions in real project context:

1. **`/onboarding`** (Phase 7) — Offers to extract a draft brief/vision from present documents
2. **`/ux`** — Anchors design hypotheses in field insights
3. **`/spec`** — References business constraints in the Dependencies section
4. **`/ui`** — Takes inspiration from moodboards and benchmarks for visual proposals

## Supported formats

Design OS agents read files via Claude Code. Here's what's processable:

| Format | Natively readable | Recommended conversion |
|--------|-------------------|------------------------|
| `.md`, `.txt`, `.csv`, `.json` | Yes | — |
| `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp` | Yes (visual analysis) | — |
| `.svg` | Yes (SVG code) | — |
| `.pdf` | No | `pdftotext "file.pdf" "file.txt"` |
| `.xlsx`, `.xls` | No | `xlsx2csv "file.xlsx" > "file.csv"` |
| `.docx` | No | `pandoc "file.docx" -o "file.md"` |
| `.pptx` | No | Export slides as PNG or note key points in `.md` |
| Figma | Via Figma MCP | Provide `figma.com/design/...` link, agents use MCP integration |

**Rule**: The more content is in `.md` and `.csv`, the better agents work. Binary formats (PDF, Excel, Word) should be converted for optimal extraction.

## Preparing your documents

### Quick conversion

If you have documents in non-readable formats, here are conversion commands:

**PDF → Text**:
```bash
# Install (macOS)
brew install poppler
# Convert
pdftotext "my-document.pdf" "my-document.txt"
# Or to keep layout
pdftotext -layout "my-document.pdf" "my-document.txt"
```

**Excel → CSV**:
```bash
# Install
pip install xlsx2csv
# Convert
xlsx2csv "my-file.xlsx" > "my-file.csv"
# Or for a specific sheet
xlsx2csv -s 2 "my-file.xlsx" > "sheet-2.csv"
```

**Word → Markdown**:
```bash
# Install (macOS)
brew install pandoc
# Convert
pandoc "my-document.docx" -o "my-document.md"
```

**PowerPoint**: No simple CLI conversion. Options:
- Export slides as PNG images from PowerPoint
- Copy-paste key points into a `.md`

### Automatic conversion during onboarding

When you run `/onboarding` (Phase 7) or `/discovery`, agents:
1. Scan the folder and classify files by type
2. Detect conversion tools installed on your machine
3. Offer to automatically convert non-readable files
4. Extract and dispatch content to appropriate Discovery folders

## Material → Product extraction pipeline

Agents can automatically extract from your documents:

| Document type in Material | Extracted to | Agent |
|---------------------------|--------------|-------|
| Briefs, strategic notes | `01 Strategy/product-brief.md`, `northstar-vision.md` | `/onboarding` Phase 7 |
| Business documents, rules | `02 Discovery/01 Domain Context/` | `/onboarding` Phase 7, `/discovery` |
| Interviews, verbatims, transcripts | `02 Discovery/02 User Interviews/` | `/discovery` |
| Benchmarks, surveys, analytics | `02 Discovery/03 Research Insights/` | `/discovery` |
| User descriptions, feedback | `02 Discovery/04 Personas/` | `/onboarding` Phase 7, `/discovery` |
| Moodboards, screenshots, Figma | `05 Specs/{module}/screens/` | `/ui`, `/ux` |

## Tip

The richer this folder, the more contextual and relevant agent outputs become.
An empty folder = agents work on assumptions. A well-fed folder = agents work on facts.
