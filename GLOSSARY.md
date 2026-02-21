# Glossaire — Design OS

> Tous les termes techniques utilises dans le Design Operating System, expliques simplement.

---

## A

### Acceptance Criteria
Conditions precises qu'un ecran ou composant doit remplir pour etre considere "termine". Ecrites en format **Gherkin** (voir ci-dessous). Exemple : "Quand je clique sur Reserver, alors la salle passe en statut Reservee."

### Agent
Un assistant IA specialise dans une tache precise. Chaque agent a sa commande : `/ux` pour le design, `/spec` pour les specs, `/build` pour le code. Tu les appelles comme des collegues experts.

### Auto-layout
Organisation automatique des elements dans un conteneur (horizontal, vertical, espacement regulier). Equivalent du flexbox en CSS.

---

## B

### Breakpoint
Largeur d'ecran a laquelle le layout change. Par exemple, en dessous de 768px on passe en mode mobile. Les breakpoints du Design OS : `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).

### Build
Phase ou le code est ecrit. Dans le Design OS, le build suit toujours une spec validee et utilise le TDD (tests d'abord).

---

## C

### Checkpoint
Moment ou le systeme s'arrete pour te demander ton avis avant de continuer. Trois niveaux : `minimal` (peu de pauses), `standard` (pause entre chaque phase), `granular` (pause a chaque decision).

### Component (Composant)
Un element d'interface reutilisable : bouton, carte, formulaire, modal. Un ecran est compose de plusieurs composants.

---

## D

### Design System (DS)
L'ensemble des regles visuelles de ton produit : couleurs, typographie, espacements, composants. C'est la "charte graphique" numerique. Stocke dans `01_Product/05 Design System/`.

### Design Tokens
Voir **Tokens**.

### Discovery
Phase d'exploration ou tu comprends tes utilisateurs : interviews, recherche, analyse du domaine. Stocke dans `01_Product/02 Discovery/`.

### Draft
Statut d'une spec incomplete. Une spec DRAFT peut avoir des sections marquees "TBD" (a definir). Elle ne peut pas etre utilisee par `/build` — il faut d'abord la passer en VALIDEE.

---

## E

### Edge Case
Scenario rare ou limite que le code doit quand meme gerer. Exemple : "Que se passe-t-il si l'utilisateur reserve 100 salles en meme temps ?"

### Empty State
L'ecran affiche quand il n'y a pas encore de donnees. Exemple : "Aucune salle configuree — ajoutez votre premiere salle." Toujours prevu dans les specs du Design OS.

### EPIC
Un grand objectif fonctionnel decoupe en plusieurs user stories. Exemple : EPIC "Reservation de salles" contient les stories "Voir les salles", "Reserver un creneau", "Annuler une reservation".

---

## F

### Flow
Enchainement d'etapes ou d'agents. Un flow complet : `/ux` → `/spec` → `/build` → `/review`. L'orchestrateur (`/o`) gere les flows.

---

## G

### Gherkin
Format standard pour ecrire des criteres de validation. Structure : **Given** (contexte de depart) → **When** (action de l'utilisateur) → **Then** (resultat attendu). Exemple :
```
Given je suis sur le dashboard
When je clique sur "Reserver" pour la Salle A
Then un formulaire de reservation s'ouvre avec la Salle A pre-selectionnee
```

### GO / NO-GO
Verdict de la review. **GO** = le code est conforme a la spec, pret pour production. **NO-GO** = il y a des ecarts a corriger.

---

## H

### Handoff
Le moment ou un agent passe le relais au suivant. Exemple : `/ux` fait un handoff vers `/spec` en transmettant les decisions de design et les artefacts produits.

### Happy Path
Le scenario "tout se passe bien" — pas d'erreurs, pas de cas limites. Les prototypes (`/explore`) ne codent que le happy path pour valider vite.

### Health Check
Diagnostic global du projet. L'agent `/health` verifie que tout est en ordre : onboarding complet, tokens remplis, specs sans TBD, etc.

---

## K

### Key Screen (Ecran cle)
Un ecran principal de ton produit. Plusieurs user stories peuvent converger sur le meme ecran cle. Le Screen Map liste tous les ecrans cles.

---

## L

### Layout
La disposition des elements sur un ecran : ou sont le header, la sidebar, le contenu principal, etc.

### Lean UX
Approche ou tu explores plusieurs solutions avant de converger. Le Design OS impose un minimum de 2 alternatives avant de choisir.

---

## M

### Module
Une zone fonctionnelle de ton produit. Exemple : "reservations", "admin", "facturation". Chaque module a ses propres specs, ecrans, code et reviews. Definis dans `modules-registry.md`.

### Moodboard
Collection d'images, couleurs ou sites web qui representent l'ambiance visuelle souhaitee. Utilise pendant l'onboarding pour calibrer le Design System.

---

## N

### NO-GO
Voir **GO / NO-GO**.

---

## O

### Orchestrateur
L'agent `/o` qui coordonne les autres agents. Il comprend ton intention, propose un plan, et enchaine les agents dans le bon ordre. C'est le "chef d'orchestre".

### Override
Commande pour reprendre le controle quand le systeme est en train de travailler. Exemples : `/stop` (pause), `/back` (revenir en arriere), `/skip` (sauter une etape).

---

## P

### Persona
Un profil type d'utilisateur de ton produit. Chaque persona a un nom, un role, un besoin cle et une frustration principale. Exemple : "Marie, Office Manager, doit reserver 5 salles par jour, frustrée par les doubles reservations."

### Pillar (Pilier)
Un regroupement de modules lies. Exemple : le pilier "Collaboration" regroupe les modules "reservations" et "messagerie".

---

## R

### Review
Phase ou le code est compare a la spec pour verifier la conformite. L'agent `/review` donne un score et un verdict GO ou NO-GO.

---

## S

### Screen Map
Document central qui mappe N user stories → M ecrans. Evite de creer un ecran par story (anti-pattern). Stocke dans `01_Product/04 Specs/{module}/00_screen-map.md`.

### Skeleton (Squelette)
Version grise/animee d'un ecran affichee pendant le chargement des donnees. Donne l'impression que le contenu arrive (au lieu d'un spinner).

### Slug
Un identifiant court et sans espaces pour un module. Exemples : `bookroom`, `admin-panel`, `user-settings`. Utilise dans les noms de dossiers et les chemins.

### Spec (Specification)
Document detaille qui decrit exactement ce qu'un ecran ou composant doit faire. 9 sections : vue d'ensemble, criteres, layout, etats, navigation, donnees, design system, roles, hors perimetre.

---

## T

### TDD (Test-Driven Development)
Methode de developpement ou tu ecris les **tests d'abord**, puis le code pour les faire passer. Le Design OS impose le TDD dans la phase `/build`.

### Tokens
Valeurs nommees du Design System. Au lieu d'ecrire `#3B82F6` partout, tu ecris `primary`. Au lieu de `16px`, tu ecris `space-4`. Les tokens sont dans `01_Product/05 Design System/tokens.md`.

### Triage
Classification des ecarts trouves en review. 4 types :
- **IMPL** → Le code a un bug → renvoyer vers `/build`
- **SPEC** → La spec est incomplete → renvoyer vers `/spec`
- **DESIGN** → Le design est a revoir → renvoyer vers `/ux`
- **DISCOVERY** → Il manque de la connaissance utilisateur → renvoyer vers la Discovery

Priorite : DISCOVERY > DESIGN > SPEC > IMPL.

---

## U

### User Story
Une fonctionnalite decrite du point de vue de l'utilisateur. Format : "En tant que [role], je veux [action] pour [benefice]." Exemple : "En tant que manager, je veux voir les salles disponibles pour reserver rapidement."

### UX (User Experience)
L'experience globale de l'utilisateur avec ton produit. Le "comment ca se passe" quand quelqu'un utilise ton app.

---

## V

### VALIDEE
Statut d'une spec complete et approuvee. Toutes les 9 sections sont remplies, zero TBD. Seule une spec VALIDEE peut etre utilisee par `/build`.
