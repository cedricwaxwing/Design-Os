# 04 Lab — Sandbox & Prototypes

> Espace de test libre, en dehors du cycle Spec/Build/Review.

---

## Quand utiliser le Lab

| Usage | Agent | Exemple |
|-------|-------|---------|
| **Prototype rapide** | `/explore` | Valider un layout avant d'investir dans une spec |
| **POC technique** | Manuel | Tester une integration API, un pattern de composant |
| **Experimentation visuelle** | `/ui` | Comparer des variantes de layout |
| **Spike** | Manuel | Explorer une technologie avant de s'engager |

## Regles

1. **Tout est jetable** — Ne jamais dependre du Lab pour la production
2. **Un fichier = une intention** — Nommer clairement : `[nom]-explore.tsx`, `[nom]-poc.tsx`
3. **Pas de tests ici** — Les tests sont dans `02_Build/{module}/tests/`
4. **Design system respecte** — Meme en prototype, utiliser les tokens (pas de hardcodes)

## Structure

```
04_Lab/
└── {module}/
    ├── [nom]-explore.tsx       ← Prototype /explore (happy path)
    ├── [nom]-poc.tsx           ← POC technique
    └── [nom]-spike/            ← Spike multi-fichiers
```

## Cycle de vie

```
Idee → Lab (prototype) → Feedback
  ├── "Bonne direction" → /spec → /build (le prototype est remplace)
  ├── "A modifier" → Iterer dans le Lab
  └── "Mauvaise approche" → Supprimer, repenser
```

Le Lab n'est PAS une etape du cycle Spec/Build/Review. C'est un espace parallele pour reduire le risque avant d'investir dans une spec complete.
