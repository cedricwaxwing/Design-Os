# Skills Registry — External Skills Catalog

> Ce registre liste les skills externes disponibles. Les agents les chargent a la volee
> depuis GitHub quand le contexte du projet le justifie. Aucun skill externe n'est actif par defaut.

---

## Source

Repository : https://github.com/vercel-labs/agent-skills
Base URL : `https://raw.githubusercontent.com/vercel-labs/agent-skills/refs/heads/main/skills/`

---

## Catalogue

| Skill | Fichier | Active quand | Agent consommateur |
|-------|---------|-------------|-------------------|
| React Best Practices | `{base}/react-best-practices/SKILL.md` | Framework = React, Next.js | `/build` |
| React Native Guidelines | `{base}/react-native-guidelines/SKILL.md` | Platform = mobile-native, mobile-cross | `/build` |
| Composition Patterns | `{base}/composition-patterns/SKILL.md` | Framework = React (tous) + composant complexe | `/build` |
| Web Design Guidelines | `{base}/web-design-guidelines/SKILL.md` | Platform = web, both + review UI | `/review` |

> `{base}` = Base URL ci-dessus.

---

## Regles d'activation

1. **Jamais charge par defaut** — uniquement quand l'agent en a besoin
2. **Lecture seule** — le skill est lu via WebFetch, pas copie localement
3. **Cache session** — une fois charge dans la session, pas besoin de re-fetch
4. **Stack-driven** — l'activation depend de la stack dans CLAUDE.md (Tech Stack + Platform)
5. **Non-bloquant** — si le fetch echoue (offline, 404), l'agent continue sans le skill
6. **Extensible** — ajouter une ligne au tableau pour un nouveau skill

---

## Comment ajouter un skill externe

1. Trouver le SKILL.md source (GitHub, custom, etc.)
2. Ajouter une ligne au tableau ci-dessus
3. Specifier la condition d'activation (stack, phase, agent)
4. L'agent le chargera automatiquement a la prochaine session

---

## Comment ca marche

```
Build/Review demarre
    │
    ▼
Lit CLAUDE.md → extrait Framework, Platform
    │
    ▼
Lit skills-registry.md → filtre les skills qui matchent
    │
    ▼
WebFetch du SKILL.md depuis GitHub (silencieux)
    │
    ├─ Succes → integre les regles dans le contexte
    └─ Echec → continue sans (graceful degradation)
```

Les regles des skills externes sont **supplementaires** — elles ne remplacent ni le Design System, ni la spec, ni le workflow TDD.
