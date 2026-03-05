# Getting Started — Narrative walkthrough

> Discovering the Design OS for the first time?  
> This guide walks you through a complete, end‑to‑end example.  
> In ~15 minutes of reading, you will understand how the whole system hangs together.

---

## Step 0 — Install the Navigator

The **Design OS Navigator** is a Cursor/VS Code extension that displays your project as an interactive node graph. Each phase (Discovery, UX, Spec, Build, Review) is a clickable node with its actions and readiness score.

### Quick install

```bash
./setup.sh
```

This script automatically detects Cursor or VS Code and installs the extension.

### Manual install

1. Open Cursor / VS Code
2. `Cmd+Shift+P` → **"Extensions: Install from VSIX"**
3. Select `design-os-navigator/design-os-navigator-0.1.0.vsix`

### Using it

- The Navigator **opens automatically** the first time you open the project.
- After that: click **"Design OS"** in the side bar, or `Cmd+Shift+P` → **"Design OS: Open Navigator"**.
- Click a node to see its files, readiness score, and available commands.
- Action buttons send the slash commands directly into the terminal.

---

## The scenario

**Julie** is the founder of a startup. She wants to create **BookRoom**, a meeting‑room booking app for SMBs. She is not a developer, she is not a designer. She has a product vision and wants to move fast.

She has installed Cursor (or Claude Code) and cloned the Design OS repo. Here is her journey.

---

## Step 1 — Onboarding (`/onboarding`)

Julie opens a terminal in the project folder and types `/onboarding`.

**The agent welcomes her:**
```
Welcome to the Design Operating System!

This framework helps you design and build digital products with specialized AI agents.
The cycle: Strategy → Discovery → Design → Spec → Build → Review.

I’ll ask you a few questions to configure your project. It takes about 5 minutes.

Shall we start?
```

**The agent asks questions in small groups** (not all at once):

1. "What is your project called?" → `BookRoom`
2. "Describe it in one sentence." → `Meeting‑room booking app for SMBs`
3. "Which domain?" → `SaaS / productivity`
4. "Where are you in the journey?" → `Ideation`
5. "What is your role?" → `Founder`

Then the agent asks for her profile:
```
To adapt my working style, what’s your main profile?

- Founder / CEO → High‑level view, I only consult you on key decisions
- Designer → Creative mode, checkpoints on every design decision
- Product Manager → Focus on specs and story coverage
- Developer → Focus on build, autonomous on code
```

Julie chooses **Founder**. The agent switches to `minimal` mode — it will only interrupt her for strategic decisions.

**Next questions**: personas, tech stack (with smart defaults Julie accepts), brand color (`#3B82F6`), light theme.

**The agent shows a summary:**
```
Here’s what I’m going to write:

- CLAUDE.md → Filled with your project info
- .claude/context.md → Active module: bookroom
- .claude/profile.md → Profile: founder (minimal mode)
- modules-registry.md → 1 module: bookroom
- tokens.md → Palette generated from #3B82F6
- Module folders: specs/, screens/, build/, review/, lab/

Shall I write everything?
```

Julie confirms. **12 files created in 3 seconds.**

```
Onboarding complete — 12 files created.  
Profile: founder (minimal mode)  
Active module: bookroom

Your project is configured! As a founder, here’s what matters:

/o  → Launch the orchestrator for a full workflow (your main agent)  
/ux → Explore UX directions

Mode: minimal — I’ll only ask you for key decisions.
```

---

## Step 2 — Explore UX directions (`/ux`)

Julie types `/ux` and says: “I want a dashboard where managers can see available rooms and book in 2 clicks.”

**The UX agent explores 3 directions:**

```
Direction A — Calendar view  
A weekly calendar with time slots colored by room.  
+ Familiar (Google Calendar‑style pattern)  
− Visually dense, harder to scan on mobile

Direction B — Floor‑plan view  
An office map with clickable rooms, color = available/occupied.  
+ Intuitive, spatial  
− Requires a floor plan, more complex to build

Direction C — Smart list view  
A list sorted by “next available room” with quick filters (capacity, equipment).  
+ Simple, fast, mobile‑first  
− Less visually “wow”

Which layout speaks to you most? (or mix: “calendar from A with filters from C”)
```

Julie answers: “C with filters, but add a mini‑calendar at the top to pick the day.”

The agent **converges on a merged direction**, generates a Screen Map, and confirms with Julie:
```
Screen Map updated: 00_screen-map.md  
Screen #1: Dashboard Reservations (stories 1.1, 1.2, 1.3)  
Screen #2: Room Detail (stories 1.4, 1.5)  
Screen #3: Reservation Confirmation (story 1.6)

Shall we move on to the Dashboard spec?
```

---

## Step 3 — Generate the spec (`/spec`)

Julie says “yes” and the system chains into `/spec`.

The agent generates a full spec in 9 sections:

1. **Overview** — Who, what, why  
2. **Acceptance criteria** — Gherkin format (testable)  
3. **Layout** — ASCII sketch of the page  
4. **States** — Empty (no rooms), loading, normal, error  
5. **Navigation** — Where we come from, where we go  
6. **Data** — TypeScript interfaces, API endpoints  
7. **Design System** — Tokens used, responsive behavior  
8. **Roles** — Admin sees everything, Manager sees their floor, Viewer is read‑only  
9. **Out of scope** — What this page explicitly does NOT do

```
Spec generated: 01_Product/05 Specs/bookroom/specs/1.1-dashboard-reservations.spec.md  
Status: VALIDEE (validated)  
9/9 sections filled, 0 TBD.

The spec is ready for build. Launch /build?
```

---

## Step 4 — Code in TDD (`/build`)

Julie confirms. The Build agent:

1. Reads the spec  
2. Writes tests first (empty state, loading, data, error)  
3. Codes the components to make the tests pass  
4. Uses Design System tokens (no hard‑coded colors)  
5. Handles responsive behavior (mobile, tablet, desktop)

```
Build complete: 02_Build/bookroom/src/
- DashboardReservations.tsx
- DashboardReservations.test.tsx
- components/RoomCard.tsx
- components/MiniCalendar.tsx
- hooks/useRooms.ts

Tests: 12/12 passed
```

---

## Step 5 — Conformity review (`/review`)

The Review agent scores the code against the spec:

```
Review: Dashboard Reservations  
Score: 11/12 criteria passed (92%)

Verdict: NO‑GO

Gap detected:  
- [IMPL] The error state shows “Error” in English instead of the UX copy defined in the spec  
  → Type: IMPL (code to fix)  
  → Action: Send back to /build to correct

No DESIGN, SPEC or DISCOVERY gaps.
```

The agent sends it back to `/build` for a fix. After correction:

```
Review: Dashboard Reservations (v2)  
Score: 12/12 (100%)  
Verdict: GO

Dashboard Reservations is now fully compliant with the spec. Ready for production.
```

---

## Step 6 — What next?

Julie can now:
- **Continue**: `/o` to launch spec + build of screen #2 (Room Detail)  
- **Prototype**: `/explore` to quickly test an idea before spec‑ing it  
- **Check coverage**: `/screen-map` to ensure every story maps to a screen  
- **Check health**: `/health` for a global project diagnostic

---

## Journey recap

```
/onboarding          5 min    → Project configured, profile set
       ↓
/ux                  10 min   → 3 directions explored, Screen Map created
       ↓
/spec                5 min    → Spec complete (9 sections, 0 TBD)
       ↓
/build               15 min   → TDD code, tests passing
       ↓
/review              2 min    → NO‑GO → fix → GO (100%)
       ↓
Screen #1 shipped!
```

**Total time**: ~35 minutes for a complete screen, from idea to tested and reviewed code.

---

## Tips to get started

1. **Always start with `/onboarding`** — it’s the foundation.  
2. **Use `/o` when you’re not sure what to do next** — the orchestrator will guide you.  
3. **Drop your materials into `01_Product/00 Material/`** — the agents will use them.  
4. **Feel free to say “show me other options”** — the system is built for exploration.  
5. **Type `/why` if you don’t understand a choice** — the agent will explain its reasoning.  
6. **In doubt? `/health`** — full project health check in a single command.
