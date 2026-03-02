# Getting Started — Walkthrough narratif

> Tu decouvres le Design OS ? Ce guide te montre un parcours complet, etape par etape,
> a travers un exemple concret. En 15 minutes de lecture, tu comprendras tout le systeme.

---

## Etape 0 — Installer le Navigator

Le **Design OS Navigator** est une extension Cursor/VS Code qui affiche ton projet comme un graphe de nodes interactif. Chaque phase (Discovery, UX, Spec, Build, Review) est un node cliquable avec ses actions et son score de readiness.

### Installation rapide

```bash
./setup.sh
```

Ce script detecte automatiquement Cursor ou VS Code et installe l'extension.

### Installation manuelle

1. Ouvre Cursor / VS Code
2. `Cmd+Shift+P` → **"Extensions: Install from VSIX"**
3. Selectionne `design-os-navigator/design-os-navigator-0.1.0.vsix`

### Utilisation

- Le Navigator **s'ouvre automatiquement** la premiere fois que tu ouvres le projet
- Apres ca : clique sur **"Design OS"** dans la barre du bas, ou `Cmd+Shift+P` → **"Design OS: Open Navigator"**
- Clique sur un node pour voir ses fichiers, son score de readiness, et les commandes disponibles
- Les boutons d'action envoient directement les slash commands dans le terminal

---

## Le scenario

**Julie** est fondatrice d'une startup. Elle veut creer **BookRoom**, une app de reservation de salles de reunion pour les PME. Elle n'est pas developpeuse, elle n'est pas designer. Elle a une vision produit et elle veut avancer vite.

Elle a installe Claude Code et clone le repo Design OS. Voici son parcours.

---

## Etape 1 — L'onboarding (`/onboarding`)

Julie ouvre le terminal dans le dossier du projet et tape `/onboarding`.

**L'agent l'accueille** :
```
Bienvenue dans le Design Operating System !

Ce framework t'aide a concevoir et builder des produits digitaux avec des agents IA specialises.
Le cycle : Strategy → Discovery → Design → Spec → Build → Review.

Je vais te poser quelques questions pour configurer ton projet. Ca prend environ 5 minutes.

On commence ?
```

**L'agent pose les questions par petits groupes** (pas tout d'un coup) :

1. "Comment s'appelle ton projet ?" → `BookRoom`
2. "Decris-le en une phrase." → `App de reservation de salles de reunion pour les PME`
3. "Dans quel domaine ?" → `SaaS / productivite`
4. "Ou en es-tu ?" → `Ideation`
5. "Quel est ton role ?" → `Fondatrice`

Puis l'agent detecte le profil :
```
Pour adapter mon style de travail, quel est ton profil principal ?

- Founder / CEO → Vue haut niveau, je te consulte sur les decisions cles uniquement
- Designer → Mode creatif, checkpoints sur chaque decision de design
- Product Manager → Focus specs et couverture des stories
- Developpeur → Focus build, autonome sur le code
```

Julie choisit **Founder**. L'agent configure le mode `minimal` — il ne la sollicitera que pour les decisions strategiques.

**Questions suivantes** : personas, tech stack (avec des defauts intelligents que Julie accepte), couleurs de marque (`#3B82F6`), theme light.

**L'agent montre un resume** :
```
Voici ce que je vais ecrire :

- CLAUDE.md → Rempli avec les infos du projet
- .claude/context.md → Module actif : bookroom
- .claude/profile.md → Profil : founder (mode minimal)
- modules-registry.md → 1 module : bookroom
- tokens.md → Palette generee depuis #3B82F6
- Dossiers du module : specs/, screens/, build/, review/, lab/

On ecrit tout ?
```

Julie confirme. **12 fichiers crees en 3 secondes.**

```
Onboarding termine — 12 fichiers crees.
Profil : founder (mode minimal)
Module actif : bookroom

Ton projet est configure ! En tant que fondatrice, voici l'essentiel :

/o  → Lance l'orchestrateur pour un workflow complet (ton agent principal)
/ux → Explore des directions UX

Mode : minimal — je te consulte sur les decisions cles uniquement.
```

---

## Etape 2 — Explorer les directions UX (`/ux`)

Julie tape `/ux` et dit : "Je veux un dashboard ou les managers voient les salles disponibles et reservent en 2 clics."

**L'agent UX explore 3 directions** :

```
Direction A — Vue calendrier
Un calendrier hebdomadaire avec les creneaux colores par salle.
+ Familier (pattern Google Calendar)
- Dense visuellement, dur a scanner sur mobile

Direction B — Vue carte des salles
Un plan du bureau avec les salles cliquables, couleur = dispo/occupe.
+ Intuitif, spatial
- Necessite un plan du bureau, plus complexe a builder

Direction C — Vue liste smart
Une liste triee par "prochaine salle dispo" avec filtres rapides (capacite, equipement).
+ Simple, rapide, mobile-first
- Moins sexy visuellement

Quel layout te parle le plus ? (ou combine : "le calendrier du A avec les filtres du C")
```

Julie repond : "Le C avec les filtres, mais ajoute un mini-calendrier en haut pour choisir le jour."

L'agent **converge sur une direction fusionnee**, genere un Screen Map, et valide avec Julie :
```
Screen Map mis a jour : 00_screen-map.md
Ecran #1 : Dashboard Reservations (stories 1.1, 1.2, 1.3)
Ecran #2 : Detail Salle (stories 1.4, 1.5)
Ecran #3 : Confirmation Reservation (story 1.6)

On passe a la spec du Dashboard ?
```

---

## Etape 3 — Generer la spec (`/spec`)

Julie dit "oui" et le systeme enchaine vers `/spec`.

L'agent genere une spec complete en 9 sections :

1. **Vue d'ensemble** — Qui, quoi, pourquoi
2. **Acceptance criteria** — En format Gherkin (testable)
3. **Layout** — Schema ASCII de la page
4. **Etats** — Vide (pas de salles), chargement, normal, erreur
5. **Navigation** — D'ou on vient, ou on va
6. **Donnees** — Interfaces TypeScript, endpoints API
7. **Design System** — Tokens utilises, responsive
8. **Roles** — Admin voit tout, Manager voit son etage, Viewer lecture seule
9. **Hors perimetre** — Ce que cette page ne fait PAS

```
Spec generee : 01_Product/05 Specs/bookroom/specs/1.1-dashboard-reservations.spec.md
Statut : VALIDEE
9/9 sections remplies, 0 TBD.

La spec est prete pour le build. On lance /build ?
```

---

## Etape 4 — Coder en TDD (`/build`)

Julie confirme. L'agent Build :

1. Lit la spec
2. Ecrit les tests d'abord (empty state, loading, data, error)
3. Code les composants pour faire passer les tests
4. Utilise les tokens du Design System (pas de couleurs en dur)
5. Gere le responsive (mobile, tablette, desktop)

```
Build termine : 02_Build/bookroom/src/
- DashboardReservations.tsx
- DashboardReservations.test.tsx
- components/RoomCard.tsx
- components/MiniCalendar.tsx
- hooks/useRooms.ts

Tests : 12/12 passed
```

---

## Etape 5 — Review de conformite (`/review`)

L'agent Review score le code vs la spec :

```
Review : Dashboard Reservations
Score : 11/12 criteres passes (92%)

Verdict : NO-GO

Gap detecte :
- [IMPL] L'etat erreur affiche "Error" en anglais au lieu du message UX de la spec
  → Type : IMPL (code a corriger)
  → Action : Renvoyer vers /build pour corriger

Aucun gap DESIGN, SPEC ou DISCOVERY.
```

L'agent renvoie vers `/build` pour le fix. Apres correction :

```
Review : Dashboard Reservations (v2)
Score : 12/12 (100%)
Verdict : GO

Le Dashboard Reservations est conforme a la spec. Pret pour production.
```

---

## Etape 6 — Et ensuite ?

Julie peut maintenant :
- **Continuer** : `/o` pour lancer la spec + build de l'ecran #2 (Detail Salle)
- **Prototyper** : `/explore` pour tester rapidement une idee avant de specer
- **Verifier** : `/screen-map` pour s'assurer que toutes les stories ont un ecran
- **Verifier la sante** : `/health` pour un diagnostic global du projet

---

## Resume du parcours

```
/onboarding          5 min    → Projet configure, profil defini
       ↓
/ux                  10 min   → 3 directions explorees, Screen Map cree
       ↓
/spec                5 min    → Spec complete (9 sections, 0 TBD)
       ↓
/build               15 min   → Code TDD, tests passes
       ↓
/review              2 min    → NO-GO → fix → GO (100%)
       ↓
Ecran #1 livre !
```

**Temps total** : ~35 minutes pour un ecran complet, de l'idee au code teste et review.

---

## Conseils pour debuter

1. **Commence toujours par `/onboarding`** — c'est la fondation
2. **Utilise `/o` quand tu ne sais pas quoi faire** — l'orchestrateur te guide
3. **Mets tes documents dans `00 Material/`** — les agents les utiliseront
4. **N'hesite pas a dire "montre-moi d'autres options"** — le systeme est fait pour explorer
5. **Tape `/why` si tu ne comprends pas un choix** — l'agent expliquera son raisonnement
6. **Un doute ? `/health`** — diagnostic complet du projet en une commande
