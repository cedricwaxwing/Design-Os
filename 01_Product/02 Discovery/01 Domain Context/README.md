# 01 Domain Context — Contexte metier

> Regles, terminologie et processus du domaine metier.

---

## Quoi mettre ici

| Type | Exemples |
|------|----------|
| **Glossaire** | Termes metier specifiques, acronymes, definitions |
| **Regles metier** | Contraintes reglementaires, regles de validation, workflows metier |
| **Processus existants** | Comment les utilisateurs travaillent aujourd'hui (avant le produit) |
| **Carte du domaine** | Entites, relations, flux de donnees |

## Format recommande

```markdown
# Domaine — [Nom du domaine]

## Glossaire
| Terme | Definition |
|-------|-----------|
| [terme] | [definition] |

## Regles metier
1. [Regle 1 — ex: "Un study ne peut pas etre publie sans validation du PI"]
2. [Regle 2]

## Processus actuel
[Description ou diagramme du processus existant]
```

## Impact sur les agents

- **`/spec`** — Reference les regles metier dans la section Dependencies
- **`/ux`** — Verifie que les parcours respectent les processus metier
- **`/build`** — Implemente les validations metier dans le code
