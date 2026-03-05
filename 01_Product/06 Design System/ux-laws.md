# Design System — Lois UX (Laws of UX)

> Source de verite pour les 30 lois UX appliquees dans le projet.
> Les agents UX Design, Spec, Build, Review, Explore, et UI Designer DOIVENT consulter ces lois.
> Chaque loi est categorisee par domaine d'application et inclut des regles d'implementation.
> Reference : https://lawsofux.com/

---

## Index rapide par domaine

| Domaine | Lois | Agents principaux |
|---------|------|-------------------|
| **Perception & Layout** | Aesthetic-Usability, Common Region, Proximity, Pragnanz, Similarity, Uniform Connectedness, Von Restorff | ui-designer, ux-design, build |
| **Charge cognitive** | Cognitive Load, Miller, Chunking, Working Memory, Selective Attention | ux-design, spec, build, ui-designer |
| **Decision & Navigation** | Hick, Choice Overload, Fitts, Serial Position, Paradox Active User | ux-design, ui-designer, build |
| **Motivation & Engagement** | Flow, Goal-Gradient, Zeigarnik, Peak-End, Doherty Threshold | ux-design, build |
| **Simplification** | Occam's Razor, Tesler, Pareto, Parkinson | ux-design, spec |
| **Coherence & Modeles mentaux** | Jakob, Mental Model, Postel, Cognitive Bias | ux-design, spec, review |

---

## 1. Perception & Layout

### 1.1 Aesthetic-Usability Effect

> Un design agreable est percu comme plus utilisable.

**Definition** : Les utilisateurs tolerent mieux les problemes mineurs d'utilisabilite quand l'interface est visuellement plaisante. L'esthetique cree de la confiance et de la patience.

**Application** :
- Le polish visuel n'est PAS optionnel — il renforce directement la perception de fiabilite
- Utiliser systematiquement les tokens du design system (couleurs, spacing, typo)
- Un composant fonctionnel mais visuellement incoherent echoue au test utilisateur
- Les ecrans de donnees complexes (dashboards, tableaux) beneficient le plus de cette loi

**Agents** : build, ui-designer, explore, review

---

### 1.2 Law of Common Region

> Les elements partageant une meme frontiere visuelle sont percus comme groupes.

**Definition** : Un conteneur (card, section, bordure) cree un groupement perceptuel plus fort que la proximite seule.

**Application** :
- Utiliser les cards (avec tokens du design system) pour grouper les informations liees
- Les sections d'un formulaire doivent avoir des conteneurs visuels distincts
- Ne PAS grouper dans une meme card des informations de nature differente
- Les groupes de KPIs partageant un meme contexte sont dans un meme conteneur

**Agents** : ui-designer, build, spec (section layout)

---

### 1.3 Law of Proximity

> Les objets proches les uns des autres sont percus comme un groupe.

**Definition** : L'espacement entre elements est un signal de relation. Les elements rapproches sont interpretes comme lies, les elements eloignes comme distincts.

**Application** :
- Gap 8px (`gap-2`) entre elements lies au sein d'un meme groupe
- Gap 24px (`gap-6`) entre groupes distincts
- Gap 32px+ (`gap-8`) entre sections majeures
- Toujours verifier : "est-ce que le spacing reflete la relation semantique ?"

**Agents** : ui-designer, build, ux-design

---

### 1.4 Law of Pragnanz

> Les images ambigues ou complexes sont interpretees sous leur forme la plus simple.

**Definition** : Le cerveau prefere les formes simples, regulieres et ordonnees. Les interfaces complexes sont mentalement "simplifiees" par l'utilisateur, parfois en perdant de l'information.

**Application** :
- Les layouts doivent etre symetriques et alignes sur la grille 4/8px
- Eviter les asymetries qui forcent l'utilisateur a interpreter la structure
- Les icones doivent etre simples et reconnaissables
- Les tableaux de donnees doivent avoir une structure repetitive previsible

**Agents** : ui-designer, ux-design

---

### 1.5 Law of Similarity

> Les elements similaires sont percus comme faisant partie du meme groupe.

**Definition** : Couleur, forme, taille et style sont des signaux de groupement. Des elements visuellement similaires sont interpretes comme ayant la meme fonction.

**Application** :
- Tous les CTAs primaires ont le meme style (couleur primary, texte blanc, rounded)
- Tous les badges de statut suivent la meme logique de couleur semantique
- Les cards de meme type ont le meme layout (pas de variations inutiles)
- Si deux elements ont la meme apparence, ils DOIVENT avoir la meme fonction

**Agents** : ui-designer, build, ux-design

---

### 1.6 Law of Uniform Connectedness

> Les elements visuellement connectes sont percus comme plus lies que les elements sans connexion.

**Definition** : Des lignes, bordures, fleches ou fond colore partagee creent une relation perceptuelle forte.

**Application** :
- Les timelines utilisent une ligne de connexion entre les milestones
- Les steppers/wizards utilisent une barre de progression reliant les etapes
- Les relations parent-enfant sont rendues par indentation ou lignes de connexion
- Les breadcrumbs utilisent des separateurs (`/` ou `>`) pour montrer la hierarchie

**Agents** : ui-designer, build

---

### 1.7 Von Restorff Effect

> L'element qui differe du reste est le plus memorise.

**Definition** : Dans un ensemble d'elements similaires, celui qui est visuellement distinct attire l'attention et est mieux retenu. C'est la base de la hierarchie visuelle.

**Application** :
- Le CTA primaire est TOUJOURS visuellement distinct (couleur primary sur fond neutre)
- Les alertes critiques utilisent une couleur differente du reste de l'interface
- Les badges "nouveau" ou "urgent" se demarquent par couleur et forme
- Dans un tableau, les lignes qui necessitent attention sont surlignees

**Agents** : ui-designer, build, ux-design, review, explore

---

## 2. Charge cognitive

### 2.1 Cognitive Load

> La quantite de ressources mentales necessaires pour comprendre et interagir avec une interface.

**Definition** : Chaque element d'interface consomme de l'attention. L'objectif est de minimiser la charge cognitive non-essentielle (extraneous load) pour maximiser les ressources disponibles pour la tache reelle (germane load).

**Application** :
- Reveler progressivement l'information (progressive disclosure) — accordions, "Voir plus"
- Max 3 sections de contenu visibles sans scroll sur un ecran
- Les formulaires complexes sont decomposes en steps (wizard)
- Eviter les labels ambigus — preferer les labels descriptifs

**Agents** : ux-design, spec, build, ui-designer

---

### 2.2 Miller's Law

> La memoire de travail ne retient que 7 (plus ou moins 2) elements simultanement.

**Definition** : Au-dela de 5-9 elements, l'utilisateur perd la vision d'ensemble. L'information doit etre organisee en chunks digestibles.

**Application** :
- Max 7 items dans une navigation principale
- Max 5-7 tabs par ecran (au-dela : dropdown "More")
- Max 7 KPI cards par rangee (preferer 4 + "voir plus")
- Les listes longues doivent etre paginees ou filtrables
- Un screen map ne devrait pas depasser 7±2 ecrans par EPIC

**Agents** : ux-design, spec, build, ui-designer

---

### 2.3 Chunking

> Un processus par lequel des elements individuels d'information sont regroupes en ensembles significatifs.

**Definition** : Le chunking organise les elements en groupes logiques, facilitant le traitement et la memorisation. Un numero de telephone est plus facile a retenir en "06 12 34 56 78" qu'en "0612345678".

**Application** :
- Les champs de formulaire sont groupes par tache (pas par type technique)
- Les metadata sont organisees en sections thematiques (identite, timeline, equipe, documents)
- Les dashboards organisent les KPIs en clusters thematiques
- Les separateurs visuels delimitent les chunks

**Agents** : ux-design, spec, build, ui-designer, explore

---

### 2.4 Working Memory

> Systeme cognitif qui maintient temporairement l'information necessaire aux taches en cours.

**Definition** : La memoire de travail est limitee en capacite et en duree. Les interfaces qui exigent de retenir des informations d'un ecran a l'autre surchargent cette memoire.

**Application** :
- Ne pas forcer l'utilisateur a memoriser des informations entre les ecrans
- Les wizards multi-step affichent un resume des choix precedents
- Les drawers permettent de voir le contexte (liste) en arriere-plan
- Les references (IDs, noms) sont toujours visibles, pas cachees

**Agents** : ux-design, spec

---

### 2.5 Selective Attention

> Le processus de focalisation de l'attention sur un sous-ensemble de stimuli dans un environnement.

**Definition** : Les utilisateurs filtrent naturellement l'information. Ce qui n'est pas dans leur focus attentionnel est ignore, meme s'il est visible.

**Application** :
- L'element d'action principal doit etre dans la zone de focus naturel (haut-droite ou centre)
- Les informations secondaires sont visuellement attenuees (couleur neutral attenee)
- Les notifications non-critiques ne doivent pas voler le focus (toast, pas modal)
- Les tableaux de donnees mettent en evidence les colonnes critiques (poids visuel, couleur)

**Agents** : ux-design, ui-designer, build

---

## 3. Decision & Navigation

### 3.1 Hick's Law

> Le temps de decision augmente avec le nombre et la complexite des choix.

**Definition** : Chaque option supplementaire augmente le temps de decision de maniere logarithmique. Moins de choix = decisions plus rapides.

**Application** :
- Max 3 actions visibles par card (primary + 2 secondary)
- Max 4 filtres visibles (au-dela : "Plus de filtres")
- Max 5 options dans un dropdown sans scroll
- Les wizards decomposent une grande decision en petites decisions sequentielles
- Si > 5 decisions simultanees sur un ecran, splitter ou sequencer

**Agents** : ux-design, ui-designer, build, review

---

### 3.2 Choice Overload

> La tendance des personnes a etre submergees quand trop d'options sont presentees.

**Definition** : Au-dela d'un seuil, le nombre d'options mene a la paralysie decisionnelle, l'anxiete, et l'insatisfaction post-decision. Distinct de Hick (qui est un delai) — ici c'est un blocage.

**Application** :
- Les formulaires de creation ont des valeurs par defaut intelligentes
- Les selects avec > 10 options ont un champ de recherche
- Les permissions sont presentees par templates pre-configures, pas case par case
- Les dashboards offrent des vues pre-filtrees par role, pas un filtre universel nu

**Agents** : ux-design, build, review

---

### 3.3 Fitts's Law

> Le temps pour atteindre une cible est fonction de la distance et de la taille de cette cible.

**Definition** : Les cibles grandes et proches sont plus faciles a atteindre. Les cibles petites et eloignees sont plus difficiles. Impact direct sur la taille des boutons et leur placement.

**Application** :
- CTA primaire : min 36px height (`h-9`)
- CTA secondaire : min 32px height (`h-8`)
- Icon button : 32x32px minimum
- Touch target (mobile) : 44x44px minimum
- Les actions destructives sont eloignees des actions principales (`ml-auto`)
- Les boutons frequents sont aux positions les plus accessibles (coins, bords)

**Agents** : ux-design, ui-designer, build, review

---

### 3.4 Serial Position Effect

> Les utilisateurs retiennent mieux le premier et le dernier element d'une serie.

**Definition** : L'effet de primaute (premier element) et l'effet de recence (dernier element) sont les plus forts. Les elements au milieu sont les moins memorises.

**Application** :
- Le CTA principal est en derniere position (bas-droite ou fin de toolbar)
- Le breadcrumb/titre est en premiere position (haut-gauche)
- Dans les navigations, l'item le plus important est premier ou dernier
- Dans les formulaires, le champ le plus critique est en premier, le bouton de soumission en dernier
- Dans les listes, les elements les plus importants sont en haut

**Agents** : ux-design, ui-designer, build, review

---

### 3.5 Paradox of the Active User

> Les utilisateurs ne lisent jamais les manuels — ils commencent a utiliser le logiciel immediatement.

**Definition** : Les utilisateurs preferent agir plutot que lire. Les instructions longues sont ignorees. L'interface doit etre auto-explicative.

**Application** :
- Les ecrans doivent etre utilisables sans formation
- Preferer les labels descriptifs aux icones seules
- Les onboarding longs sont ignores — preferer des tooltips contextuels
- Les formulaires ont des placeholders et des exemples dans les champs
- Les actions non-evidentes ont des labels explicites, pas des icones ambigues

**Agents** : ux-design, spec, build

---

## 4. Motivation & Engagement

### 4.1 Flow

> L'etat mental dans lequel une personne est pleinement immergee dans une activite avec un sentiment d'energie et de concentration.

**Definition** : Le flow est atteint quand le defi est equilibre avec les competences, les objectifs sont clairs, et le feedback est immediat. Les interruptions detruisent le flow.

**Application** :
- Les wizards de creation maintiennent un rythme — pas de chargement bloquant entre les etapes
- Les modals de confirmation sont rapides (2 clics max)
- Les transitions entre ecrans sont fluides (`transition-all duration-200`)
- Les erreurs sont signalees inline, pas par une page d'erreur qui casse le flow
- Les power users ne doivent jamais etre bloques par un ecran inutile

**Agents** : ux-design, build

---

### 4.2 Goal-Gradient Effect

> La tendance a augmenter l'effort quand on s'approche du but.

**Definition** : Les utilisateurs sont plus motives et plus rapides quand ils percoivent qu'ils approchent de la fin. La progression visible est un accelerateur.

**Application**:
- Multi‑step wizards always show progress (stepper + “Step 2/4”)
- Progress bars use the primary color for the completed portion
- The final step is visually distinct (success color)
- Partially completed tasks show their progress (“3/5 sections filled”)

**Agents** : ux-design, build, ui-designer, review

---

### 4.3 Zeigarnik Effect

> Les taches incompletes sont mieux retenues que les taches completes.

**Definition** : Le cerveau maintient les taches non-terminees en memoire active, creant une tension qui pousse a les completer. Montrer les taches en cours motive leur completion.

**Application** :
- Les drafts et taches en cours ont un badge "In Progress" visible
- Les items incomplets montrent clairement ce qui manque ("2 sections a completer")
- Les dashboards mettent en avant les taches "en attente d'action" plutot que les taches completees
- Les notifications rappellent les taches ouvertes (sans spammer)

**Agents** : ux-design, build, spec, ui-designer

---

### 4.4 Peak-End Rule

> Les experiences sont jugees principalement sur leur pic (emotionnel) et leur fin.

**Definition** : L'utilisateur ne moyenne pas l'experience. Il retient le moment le plus intense (positif ou negatif) et le dernier moment. Un flow penible avec une fin gratifiante est juge positivement.

**Application** :
- L'ecran de succes (fin de creation, validation) est design — pas un simple "Succes" texte
- Les animations de completion (checkmark, confetti subtil) renforcent le pic positif
- Les erreurs bloquantes (pic negatif) sont accompagnees d'une solution claire
- Le dernier ecran d'un wizard est un resume gratifiant, pas un redirect brutal

**Agents** : ux-design, build, spec, review, ui-designer

---

### 4.5 Doherty Threshold

> La productivite explose quand le systeme et l'utilisateur interagissent a un rythme (<400ms) ou aucun n'attend l'autre.

**Definition** : En dessous de 400ms de latence, l'interaction est percue comme instantanee. Au-dessus, l'utilisateur perd son rythme et son engagement diminue.

**Application** :
- Tout feedback doit apparaitre en < 400ms (skeleton loader immediat)
- Les transitions utilisent `transition-all duration-200`
- Les optimistic updates pour les actions simples (toggle, selection)
- Les listes utilisent la virtualisation si > 100 items
- Les chargements longs (> 2s) ont une barre de progression

**Agents** : build, ux-design, review

---

## 5. Simplification

### 5.1 Occam's Razor

> Parmi les hypotheses qui predisent egalement bien, celle avec le moins d'assumptions doit etre privilegiee.

**Definition** : La solution la plus simple qui resout le probleme est la meilleure. Chaque complexite ajoutee doit etre justifiee par un benefice mesurable.

**Application** :
- Si un modal suffit, ne pas faire un wizard
- Si un filtre dropdown suffit, ne pas faire un panneau de filtres avances
- Si une page simple suffit, ne pas creer un layout avec sidebar + tabs + sous-tabs
- Chaque element d'UI doit repondre a : "Quel probleme utilisateur ca resout ?"

**Agents** : ux-design, spec

---

### 5.2 Tesler's Law

> Pour tout systeme, il existe un certain niveau de complexite qui ne peut pas etre reduit.

**Definition** : La complexite irreductible doit etre geree par le systeme (code), pas par l'utilisateur (interface). L'objectif n'est pas d'eliminer la complexite mais de la deplacer vers le bon endroit.

**Application** :
- Les processus complexes (workflows de validation multi-niveaux) doivent etre simplifies visuellement sans perdre la rigueur
- Les permissions (N roles x CRUD) sont complexes — les presenter via templates pre-configures
- Les formulaires denses sont decomposes en etapes, mais sans supprimer de champs necessaires
- Les mappings complexes sont guides par l'interface, valides par le code

**Agents** : ux-design, spec

---

### 5.3 Pareto Principle

> Environ 80% des effets proviennent de 20% des causes.

**Definition** : Dans la plupart des systemes, une minorite d'elements produit la majorite des resultats. En UX : 20% des features couvrent 80% des besoins utilisateurs.

**Application** :
- Identifier le 20% de features qui couvrent 80% des usages quotidiens
- Les power users utilisent 3-4 actions 80% du temps — les rendre ultra-accessibles
- Les dashboards montrent les KPIs les plus consultes en premier
- Le MVP se concentre sur le 20% des stories qui delivrent 80% de la valeur

**Agents** : ux-design, spec

---

### 5.4 Parkinson's Law

> Toute tache se dilate pour remplir le temps disponible.

**Definition** : Applique au design : sans contrainte de scope, les features et les ecrans se multiplient indefiniment. Les specs grandissent jusqu'a remplir le temps disponible.

**Application** :
- Chaque ecran a un scope fige avant implementation (pas de scope creep)
- Les specs ont un nombre fini de sections (9, pas plus)
- Les features "nice to have" sont reportees explicitement, pas ajoutees en douce
- Le filtre lean de l'agent UX applique cette loi : "Cet element est-il necessaire au happy path ?"

**Agents** : ux-design, spec

---

## 6. Coherence & Modeles mentaux

### 6.1 Jakob's Law

> Les utilisateurs passent la majorite de leur temps sur d'AUTRES sites. Ils preferent que votre site fonctionne comme ceux qu'ils connaissent.

**Definition** : Les conventions existantes creent des attentes. Violer ces conventions augmente la charge cognitive et la frustration. L'innovation doit etre mesuree.

**Application** :
- Utiliser les patterns du design system (pas d'inventions)
- Les tableaux de donnees se comportent comme des tableaux standards (tri, filtre, pagination)
- Les formulaires suivent les conventions web (label au-dessus, champs alignes a gauche, boutons en bas)
- La navigation principale est a gauche (sidebar) — pattern standard B2B SaaS
- Les toasts de succes apparaissent en haut-droite — convention etablie

**Agents** : ux-design, spec, build, review, explore

---

### 6.2 Mental Model

> Un modele compresse de ce que l'utilisateur croit savoir d'un systeme et de son fonctionnement.

**Definition** : Les utilisateurs ont un modele interne de comment le systeme devrait fonctionner, base sur leur experience. L'interface doit s'aligner sur ce modele, pas forcer un nouveau.

**Application** :
- Les personas ont des modeles mentaux differents : un utilisateur technique vs un decideur strategique vs un lecteur haut-niveau
- L'interface doit refleter la hierarchie mentale de chaque persona
- Ne pas imposer un vocabulaire technique a des utilisateurs non-techniques
- Les dashboards sont structures selon le modele mental du role cible

**Agents** : ux-design, spec

---

### 6.3 Postel's Law

> Soyez liberal dans ce que vous acceptez, conservateur dans ce que vous envoyez.

**Definition** : Les inputs acceptent des formats varies et tolerent les erreurs mineures. Les outputs sont structures, precis et conformes aux standards.

**Application** :
- Les champs de date acceptent plusieurs formats (DD/MM/YYYY, DD-MM-YYYY, etc.)
- Les champs de recherche sont tolerants (insensible a la casse, accents)
- Les formulaires sauvegardent les drafts automatiquement (tolerant aux erreurs de navigation)
- Les exports (PDF, CSV) suivent un format strict et predictible
- Les messages d'erreur sont specifiques et actionnables (pas de "Erreur 500")

**Agents** : spec, build, review

---

### 6.4 Cognitive Bias

> Une erreur systematique de pensee ou de rationalite dans le jugement qui influence notre perception et nos decisions.

**Definition** : Les biais cognitifs affectent tant les utilisateurs (biais de confirmation, ancrage) que les designers (biais de familiarite, illusion du savoir). Les identifier est la premiere etape pour les mitiger.

**Application** :
- **Biais d'ancrage** : Le premier chiffre vu dans un dashboard ancre les attentes — choisir avec soin les KPIs en haut
- **Biais de confirmation** : Les utilisateurs cherchent ce qui confirme leur hypothese — les dashboards doivent montrer les contre-signaux aussi
- **Biais de familiarite** (pour les designers) : "On fait toujours comme ca" n'est pas une justification — challenger avec les lois UX
- **Biais de statu quo** : Les utilisateurs resistant au changement — les nouvelles features doivent apporter un benefice visible et immediat

**Agents** : ux-design, review

---

## Utilisation par les agents — resume

| Agent | Lois prioritaires | Usage |
|-------|------------------|-------|
| **ux-design** | Toutes (22 pertinentes) | Justifier les recommandations, challenger les hypotheses, alimenter le Solution Tree |
| **ui-designer** | Perception (7) + Cognitive (5) + Serial Position + Goal-Gradient + Peak-End + Zeigarnik + Doherty + Von Restorff | Regles de generation SVG pixel-perfect |
| **build** | Fitts, Doherty, Hick, Miller, Chunking, Gestalt, Von Restorff, Goal-Gradient, Cognitive Load, Jakob, Aesthetic-Usability, Flow, Serial Position, Postel, Peak-End, Selective Attention | Regles d'implementation |
| **review** | Fitts, Doherty, Hick, Miller, Von Restorff, Goal-Gradient, Peak-End, Jakob, Choice Overload, Chunking, Serial Position, Cognitive Bias, Aesthetic-Usability | Criteres de verification conformite UX |
| **spec** | Chunking, Miller, Cognitive Load, Postel, Peak-End, Zeigarnik, Gestalt, Serial Position, Paradox Active User, Jakob | Garde-fous qualite des specs |
| **explore** | Jakob, Hick, Aesthetic-Usability, Chunking, Von Restorff | Minimum vital pour un prototype evaluable |
