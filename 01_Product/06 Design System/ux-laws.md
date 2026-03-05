 # Design System — UX Laws (Laws of UX)

 > Single source of truth for how the 30 UX laws are applied in this project.  
 > UX Design, Spec, Build, Review, Explore, and UI Designer agents MUST refer to these laws.  
 > Each law is categorized by area and includes concrete implementation rules.  
 > Reference: https://lawsofux.com/

 ---

 ## Quick index by area

 | Area | Laws | Primary agents |
 |------|------|----------------|
 | **Perception & Layout** | Aesthetic-Usability, Common Region, Proximity, Pragnanz, Similarity, Uniform Connectedness, Von Restorff | ui-designer, ux-design, build |
 | **Cognitive Load** | Cognitive Load, Miller, Chunking, Working Memory, Selective Attention | ux-design, spec, build, ui-designer |
 | **Decision & Navigation** | Hick, Choice Overload, Fitts, Serial Position, Paradox of the Active User | ux-design, ui-designer, build |
 | **Motivation & Engagement** | Flow, Goal-Gradient, Zeigarnik, Peak-End, Doherty Threshold | ux-design, build |
 | **Simplification** | Occam’s Razor, Tesler, Pareto, Parkinson | ux-design, spec |
 | **Coherence & Mental Models** | Jakob’s Law, Mental Models, Postel’s Law, Cognitive Bias | ux-design, spec, review |

 ---

 ## 1. Perception & Layout

 ### 1.1 Aesthetic-Usability Effect

 > A beautiful design is perceived as more usable.

 **Definition**: Users tolerate minor usability issues much more when the interface is visually pleasing. Good aesthetics create trust and patience.

 **Application**:
 - Visual polish is **NOT** optional — it directly strengthens perceived reliability
 - Always use design system tokens (colors, spacing, type) instead of ad‑hoc styles
 - A component that “works” but is visually inconsistent **fails** a user test
 - Complex data UIs (dashboards, tables) benefit the most from this law

 **Agents**: build, ui-designer, explore, review

 ---

 ### 1.2 Law of Common Region

 > Elements sharing the same visual boundary are perceived as a group.

 **Definition**: A container (card, section, border) creates a stronger perceptual group than proximity alone.

 **Application**:
 - Use cards (with DS tokens) to group related information
 - Form sections must have clearly distinct visual containers
 - Do **not** mix unrelated information inside the same card
 - KPI groups that share the same context live in the same container

 **Agents**: ui-designer, build, spec (section layout)

 ---

 ### 1.3 Law of Proximity

 > Objects that are close to each other are perceived as a group.

 **Definition**: Spacing signals relationships. Elements that are close are interpreted as related; distant elements as separate.

 **Application**:
 - 8px gap (`gap-2`) between tightly related elements inside one group
 - 24px gap (`gap-6`) between distinct groups
 - 32px+ gap (`gap-8`) between major sections
 - Always check: “Does spacing match the semantic relationship?”

 **Agents**: ui-designer, build, ux-design

 ---

 ### 1.4 Law of Pragnanz (Good Form)

 > Ambiguous or complex images are interpreted in the simplest possible way.

 **Definition**: The brain prefers simple, regular, ordered structures. Complex interfaces are mentally “simplified” by users, sometimes losing information.

 **Application**:
 - Layouts should be symmetrical and aligned to the 4/8px grid
 - Avoid asymmetries that force users to interpret the structure
 - Icons must be simple and recognizable
 - Data tables should have a predictable, repeating structure

 **Agents**: ui-designer, ux-design

 ---

 ### 1.5 Law of Similarity

 > Elements that look similar are perceived as part of the same group.

 **Definition**: Color, shape, size, and style are grouping signals. Visually similar elements are interpreted as having the same role.

 **Application**:
 - All primary CTAs share the same style (primary color, white text, rounded)
 - All status badges follow the same semantic color logic
 - Cards of the same type have the same layout (no random variations)
 - If two elements look the same, they **MUST** have the same function

 **Agents**: ui-designer, build, ux-design

 ---

 ### 1.6 Law of Uniform Connectedness

 > Visually connected elements are perceived as more related than unconnected ones.

 **Definition**: Lines, borders, arrows, or a shared background color create a strong relationship between elements.

 **Application**:
 - Timelines use a connecting line between milestones
 - Steppers/wizards use a progress bar connecting steps
 - Parent/child relationships are shown via indentation or connecting lines
 - Breadcrumbs use separators (`/` or `>`) to show hierarchy

 **Agents**: ui-designer, build

 ---

 ### 1.7 Von Restorff Effect

 > The item that differs from the rest is most likely to be remembered.

 **Definition**: In a set of similar elements, the one that is visually distinct attracts attention and is better remembered. This underpins visual hierarchy.

 **Application**:
 - The primary CTA is ALWAYS visually distinct (primary color on a neutral background)
 - Critical alerts use a color distinct from the rest of the UI
 - “New” or “Urgent” badges stand out via color and shape
 - In a table, rows requiring attention are highlighted

 **Agents**: ui-designer, build, ux-design, review, explore

 ---

 ## 2. Cognitive Load

 ### 2.1 Cognitive Load

 > The amount of mental effort required to understand and interact with an interface.

 **Definition**: Every UI element consumes attention. The goal is to minimize **extraneous** load so users can focus their limited cognitive resources on the actual task.

 **Application**:
 - Reveal information progressively (progressive disclosure) — accordions, “Show more”
 - Max 3 content sections visible above the fold
 - Complex forms are broken into steps (wizard)
 - Avoid ambiguous labels — prefer descriptive labels

 **Agents**: ux-design, spec, build, ui-designer

 ---

 ### 2.2 Miller’s Law

 > Working memory can hold only about 7 (plus or minus 2) items at once.

 **Definition**: Beyond 5–9 items, users lose the overview. Information must be chunked into digestible groups.

 **Application**:
 - Max 7 items in a primary navigation
 - Max 5–7 tabs per screen (beyond that: a “More” dropdown)
 - Max 7 KPI cards per row (prefer 4 + “View more”)
 - Long lists must be paginated or filterable
 - A screen map should not exceed 7±2 key screens per EPIC

 **Agents**: ux-design, spec, build, ui-designer

 ---

 ### 2.3 Chunking

 > Process of grouping individual pieces of information into meaningful units (“chunks”).

 **Definition**: Chunking organizes elements into logical groups, making them easier to process and remember. A phone number is easier to remember as “06 12 34 56 78” than “0612345678”.

 **Application**:
 - Group form fields by task, not by technical type
 - Organize metadata into themed sections (identity, timeline, team, documents)
 - Dashboards group KPIs into thematic clusters
 - Use clear visual separators to delimit chunks

 **Agents**: ux-design, spec, build, ui-designer, explore

 ---

 ### 2.4 Working Memory

 > The cognitive system that temporarily holds information needed for ongoing tasks.

 **Definition**: Working memory is limited in capacity and duration. Interfaces that require users to remember information across screens overload it.

 **Application**:
 - Don’t force users to memorize information between screens
 - Multi‑step wizards show a summary of previous choices
 - Drawers keep the list/context visible in the background
 - References (IDs, names) remain visible, not hidden

 **Agents**: ux-design, spec

 ---

 ### 2.5 Selective Attention

 > The process of focusing attention on a subset of stimuli in an environment.

 **Definition**: Users naturally filter information. What is outside their focus is effectively ignored, even if visible.

 **Application**:
 - The primary action must live in the natural focus area (top-right or center)
 - Secondary information is visually toned down (muted neutral colors)
 - Non‑critical notifications should not steal focus (toast, not modal)
 - Data tables visually emphasize critical columns (weight, color)

 **Agents**: ux-design, ui-designer, build

 ---

 ## 3. Decision & Navigation

 ### 3.1 Hick’s Law

 > The time to make a decision increases with the number and complexity of choices.

 **Definition**: Each additional option increases decision time logarithmically. Fewer choices = faster decisions.

 **Application**:
 - Max 3 visible actions per card (primary + up to 2 secondary)
 - Max 4 visible filters (beyond that: “More filters”)
 - Max 5 options in a dropdown without scrolling
 - Wizards break large decisions into small sequential decisions
 - If > 5 decisions are required on one screen, split or sequence them

 **Agents**: ux-design, ui-designer, build, review

 ---

 ### 3.2 Choice Overload

 > People tend to feel overwhelmed when presented with too many options.

 **Definition**: Beyond a certain threshold, additional options cause decision paralysis, anxiety, and post‑decision regret. Different from Hick’s (delay) — this is about **blocking**.

 **Application**:
 - Creation flows use smart defaults
 - Selects with > 10 options include a search field
 - Permissions are presented as pre‑configured templates, not dozens of raw checkboxes
 - Dashboards offer role‑based prefiltered views, not one giant unfiltered view

 **Agents**: ux-design, build, review

 ---

 ### 3.3 Fitts’s Law

 > The time to acquire a target depends on its distance and size.

 **Definition**: Large and close targets are easier to hit; small and distant ones are harder. This directly impacts button size and placement.

 **Application**:
 - Primary CTA: minimum 36px height (`h-9`)
 - Secondary CTA: minimum 32px height (`h-8`)
 - Icon button: at least 32×32px
 - Touch targets (mobile): at least 44×44px
 - Destructive actions are kept away from primary actions (`ml-auto` or separate area)
 - Frequently used actions occupy the most accessible positions (corners, edges)

 **Agents**: ux-design, ui-designer, build, review

 ---

 ### 3.4 Serial Position Effect

 > People remember the first and last items in a series best.

 **Definition**: The primacy effect (first item) and recency effect (last item) are strongest. Middle items are least memorable.

 **Application**:
 - Place the primary CTA last in order (bottom-right or end of toolbar)
 - Breadcrumb/title sits first (top-left)
 - In nav menus, the most important item is first or last
 - In forms, the most critical field comes first, submission button last
 - In lists, the most important items are at the top

 **Agents**: ux-design, ui-designer, build, review

 ---

 ### 3.5 Paradox of the Active User

 > Users don’t read manuals — they start using the software immediately.

 **Definition**: Users prefer acting over reading. Long instructions are ignored. The interface must be self‑explanatory.

 **Application**:
 - Screens must be usable without training
 - Prefer descriptive labels to icon‑only controls
 - Long onboarding flows are ignored — prefer contextual tooltips
 - Forms use placeholders and in‑field examples
 - Non‑obvious actions have explicit labels, not ambiguous icons

 **Agents**: ux-design, spec, build

 ---

 ## 4. Motivation & Engagement

 ### 4.1 Flow

 > A mental state of deep immersion, energy, and focus on an activity.

 **Definition**: Flow is reached when challenge matches skills, goals are clear, and feedback is immediate. Interruptions destroy flow.

 **Application**:
 - Creation wizards maintain rhythm — no blocking loads between steps
 - Confirmation modals are fast (max 2 clicks)
 - Screen transitions are smooth (`transition-all duration-200`)
 - Errors are shown inline, not via a full error page that breaks flow
 - Power users should never be blocked by unnecessary screens

 **Agents**: ux-design, build

 ---

 ### 4.2 Goal-Gradient Effect

 > Effort increases as people perceive they are getting closer to the goal.

 **Definition**: Users are more motivated and faster when they feel they’re nearing completion. Visible progress accelerates them.

 **Application**:
 - Multi‑step wizards always show progress (stepper + “Step 2/4”)
 - Progress bars use the primary color for the completed portion
 - The final step is visually distinct (success color)
 - Partially completed tasks show progress (“3/5 sections filled”)

 **Agents**: ux-design, build, ui-designer, review

 ---

 ### 4.3 Zeigarnik Effect

 > Unfinished tasks are remembered better than completed ones.

 **Definition**: The brain keeps unfinished tasks in active memory, creating tension that pushes for completion. Surfacing “in progress” work motivates finishing it.

 **Application**:
 - Drafts and in‑progress work clearly show an “In progress” badge
 - Incomplete items clearly show what’s missing (“2 sections to complete”)
 - Dashboards highlight “awaiting action” items instead of completed ones
 - Notifications remind users of open tasks (without spamming)

 **Agents**: ux-design, build, spec, ui-designer

 ---

 ### 4.4 Peak-End Rule

 > Experiences are judged mostly by their peak (emotional high/low) and their end.

 **Definition**: Users don’t average the whole experience. They remember the most intense moment (positive or negative) and the last moment. A painful flow with a great ending can still be judged positively.

 **Application**:
 - The success screen (end of creation, validation) is purposely designed — not just “Success” text
 - Completion animations (checkmark, subtle confetti) reinforce the positive peak
 - Blocking errors (negative peaks) are accompanied by a clear solution path
 - The last step of a wizard is a gratifying summary, not a jarring redirect

 **Agents**: ux-design, build, spec, review, ui-designer

 ---

 ### 4.5 Doherty Threshold

 > Productivity soars when system and user interact at a pace (<400 ms) where neither has to wait for the other.

 **Definition**: Below ~400 ms latency, interactions feel instant. Above that, users lose rhythm and engagement drops.

 **Application**:
 - Some feedback must appear within < 400 ms (instant skeleton loader)
 - Transitions use `transition-all duration-200`
 - Use optimistic updates for simple actions (toggles, selections)
 - Virtualize lists when > 100 items
 - Long loads (> 2 s) show a progress bar

 **Agents**: build, ux-design, review

 ---

 ## 5. Simplification

 ### 5.1 Occam’s Razor

 > Among competing hypotheses that explain the data equally well, choose the one with the fewest assumptions.

 **Definition**: The simplest solution that solves the problem is usually best. Every extra bit of complexity must be justified by measurable benefit.

 **Application**:
 - If a modal is enough, don’t build a multi‑step wizard
 - If a simple dropdown filter works, don’t build a full “advanced filters” panel
 - If a simple page is enough, don’t introduce a layout with sidebar + tabs + sub‑tabs
 - Every UI element must answer: “What user problem does this solve?”

 **Agents**: ux-design, spec

 ---

 ### 5.2 Tesler’s Law (Law of Conservation of Complexity)

 > For every system there is an irreducible amount of complexity that cannot be removed.

 **Definition**: Irreducible complexity should be handled by the system (code), not dumped on the user (interface). The goal is not to eliminate complexity, but to move it to the right place.

 **Application**:
 - Complex processes (multi‑level approval workflows) need visually simple UIs without losing rigor
 - Permissions (N roles × CRUD) are inherently complex — present them via pre‑configured templates
 - Dense forms can be broken into steps, but without removing necessary fields
 - Complex mappings are guided by the UI, validated by code

 **Agents**: ux-design, spec

 ---

 ### 5.3 Pareto Principle (80/20)

 > Roughly 80% of effects come from 20% of causes.

 **Definition**: In most systems, a minority of elements generates the majority of impact. In UX: 20% of features cover 80% of user needs.

 **Application**:
 - Identify the 20% of features covering 80% of daily usage
 - Power users rely on 3–4 actions 80% of the time — make them ultra‑accessible
 - Dashboards show the most consulted KPIs first
 - The MVP focuses on the 20% of stories delivering 80% of the value

 **Agents**: ux-design, spec

 ---

 ### 5.4 Parkinson’s Law

 > Work expands to fill the time available.

 **Definition**: In design: without clear scope, features and screens expand indefinitely. Specs grow until they fill the time available.

 **Application**:
 - Each screen has a frozen scope before implementation (no scope creep)
 - Specs have a fixed number of sections (9, not more)
 - “Nice to have” features are explicitly deferred, not quietly added
 - The UX agent’s lean filter applies this law: “Is this element necessary for the happy path?”

 **Agents**: ux-design, spec

 ---

 ## 6. Coherence & Mental Models

 ### 6.1 Jakob’s Law

 > Users spend most of their time on OTHER sites. They prefer your site to work like the ones they already know.

 **Definition**: Existing conventions create expectations. Violating them increases cognitive load and frustration. Innovation should be measured.

 **Application**:
 - Use the project’s design system patterns (no gratuitous inventions)
 - Data tables behave like standard tables (sort, filter, pagination)
 - Forms follow web conventions (label above, left‑aligned fields, buttons at the bottom)
 - Primary navigation is in a left sidebar for B2B SaaS (standard pattern)
 - Success toasts appear top‑right (common convention)

 **Agents**: ux-design, spec, build, review, explore

 ---

 ### 6.2 Mental Models

 > A compressed internal model of how a person believes a system works.

 **Definition**: Users carry an internal model of how your system *should* work, based on prior experience. The interface should align with that model instead of forcing a new one.

 **Application**:
 - Personas have different mental models: a technical user vs. a strategic decision‑maker vs. a high‑level reader
 - The interface must reflect each persona’s mental hierarchy
 - Don’t impose technical vocabulary on non‑technical users
 - Dashboards are structured according to the target role’s mental model

 **Agents**: ux-design, spec

 ---

 ### 6.3 Postel’s Law (Robustness Principle)

 > Be liberal in what you accept, and conservative in what you send.

 **Definition**: Inputs accept a variety of formats and tolerate minor errors. Outputs are structured, precise, and standards‑compliant.

 **Application**:
 - Date fields accept multiple formats (DD/MM/YYYY, DD-MM-YYYY, etc.)
 - Search fields are tolerant (case‑insensitive, accent‑insensitive)
 - Forms auto‑save drafts (tolerant of navigation mistakes)
 - Exports (PDF, CSV) follow a strict, predictable format
 - Error messages are specific and actionable (not just “Error 500”)

 **Agents**: spec, build, review

 ---

 ### 6.4 Cognitive Bias

 > Systematic errors in thinking and judgment that influence perception and decisions.

 **Definition**: Cognitive biases affect both users (confirmation bias, anchoring) and designers (familiarity bias, illusion of knowledge). Identifying them is the first step to mitigating them.

 **Application**:
 - **Anchoring bias**: The first number on a dashboard anchors expectations — carefully choose which KPIs appear first
 - **Confirmation bias**: Users look for what confirms their hypothesis — dashboards should also highlight counter‑signals
 - **Familiarity bias (for designers)**: “We’ve always done it this way” is not a justification — challenge it using UX laws
 - **Status quo bias**: Users resist change — new features must deliver visible, immediate benefit

 **Agents**: ux-design, review

 ---

 ## How agents use these laws — summary

 | Agent | Priority laws | Usage |
 |-------|---------------|-------|
 | **ux-design** | All (22 core ones above) | Justify recommendations, challenge hypotheses, feed the solution tree |
 | **ui-designer** | Perception (7) + Cognitive (5) + Serial Position + Goal-Gradient + Peak-End + Zeigarnik + Doherty + Von Restorff | Rules for pixel‑perfect SVG / UI generation |
 | **build** | Fitts, Doherty, Hick, Miller, Chunking, Gestalt, Von Restorff, Goal-Gradient, Cognitive Load, Jakob, Aesthetic-Usability, Flow, Serial Position, Postel, Peak-End, Selective Attention | Implementation rules |
 | **review** | Fitts, Doherty, Hick, Miller, Von Restorff, Goal-Gradient, Peak-End, Jakob, Choice Overload, Chunking, Serial Position, Cognitive Bias, Aesthetic-Usability | Conformity checklist |
 | **spec** | Chunking, Miller, Cognitive Load, Postel, Peak-End, Zeigarnik, Gestalt, Serial Position, Paradox of the Active User, Jakob | Spec quality guardrails |
 | **explore** | Jakob, Hick, Aesthetic-Usability, Chunking, Von Restorff | Minimum viable quality for evaluable prototypes |

