# Glossary — Design OS

> All technical terms used in the Design Operating System, explained in plain English.

---

## A

### Acceptance Criteria
Precise conditions that a screen or component must meet to be considered "done". Written in **Gherkin** format (see below). Example: "When I click Book, then the room status changes to Booked."

### Agent
An AI assistant specialized in a specific task. Each agent has its own command: `/ux` for design, `/spec` for specs, `/build` for code. You invoke them like expert teammates.

### Auto‑layout
Automatic arrangement of elements inside a container (horizontal, vertical, evenly spaced). Equivalent to CSS flexbox.

---

## B

### Breakpoint
Screen width at which the layout changes. For example, below 768px the layout switches to mobile. Design OS breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).

### Build
Phase where code is written. In Design OS, build always follows a validated spec and uses TDD (tests first).

---

## C

### Checkpoint
Moment when the system pauses to ask for your input before continuing. Three levels: `minimal` (few pauses), `standard` (pause between phases), `granular` (pause on every decision).

### Component
A reusable UI element: button, card, form, modal. A screen is composed of multiple components.

---

## D

### Design System (DS)
The full set of visual rules for your product: colors, typography, spacing, components. It is your digital "brand book". Stored in `01_Product/06 Design System/`.

### Design Tokens
See **Tokens**.

### Discovery
Exploration phase where you understand your users: interviews, research, domain analysis. Stored in `01_Product/02 Discovery/`.

### Draft
Status of an incomplete spec. A DRAFT spec can have sections marked "TBD". It cannot be used by `/build` — you must first promote it to VALIDATED.

---

## E

### Edge Case
Rare or boundary scenario that the code still needs to handle. Example: "What happens if the user books 100 rooms at the same time?"

### Empty State
Screen shown when there is no data yet. Example: "No rooms configured — add your first room." Always planned explicitly in Design OS specs.

### EPIC
A large functional objective broken down into multiple user stories. Example: EPIC "Room booking" contains the stories "View rooms", "Book a slot", "Cancel a booking".

---

## F

### Flow
Sequence of steps or agents. A full flow: `/ux` → `/spec` → `/build` → `/review`. The orchestrator (`/o`) manages flows.

---

## G

### Gherkin
Standard format for writing acceptance criteria. Structure: **Given** (starting context) → **When** (user action) → **Then** (expected result). Example:
```gherkin
Given I am on the dashboard
When I click "Book" for Room A
Then a booking form opens with Room A pre‑selected
```

### GO / NO‑GO
Review verdict. **GO** = the code is compliant with the spec and ready for production. **NO‑GO** = discrepancies remain and must be fixed.

---

## H

### Handoff
Moment when one agent hands over to the next. Example: `/ux` hands off to `/spec` and passes design decisions and produced artifacts.

### Happy Path
The "everything works" scenario — no errors, no edge cases. Prototypes (`/explore`) only implement the happy path to validate ideas quickly.

### Health Check
Global project diagnostic. The `/health` agent verifies that everything is in order: onboarding complete, tokens filled, specs without TBD, etc.

---

## K

### Key Screen
A primary screen of your product. Several user stories can converge on the same key screen. The Screen Map lists all key screens.

---

## L

### Layout
The arrangement of elements on a screen: where the header, sidebar, and main content live, etc.

### Lean UX
Approach where you explore several solutions before converging. Design OS enforces a minimum of 2 alternatives before choosing.

---

## M

### Module
A functional area of your product. Example: "bookings", "admin", "billing". Each module has its own specs, screens, code, and reviews. Defined in `modules-registry.md`.

### Moodboard
Collection of images, colors, or websites that represent the desired visual atmosphere. Used during onboarding to calibrate the Design System.

---

## N

### NO‑GO
See **GO / NO‑GO**.

---

## O

### Orchestrator
The `/o` agent that coordinates other agents. It understands your intent, proposes a plan, and chains agents in the right order. Think of it as the "conductor".

### Override
Command to take back control while the system is working. Examples: `/stop` (pause), `/back` (go back), `/skip` (skip a step).

---

## P

### Persona
A typical profile of a user of your product. Each persona has a name, role, key need, and primary frustration. Example: "Marie, Office Manager, needs to book 5 rooms per day and is frustrated by double bookings."

### Pillar
A group of related modules. Example: the "Collaboration" pillar groups the "bookings" and "messaging" modules.

---

## R

### Review
Phase where code is compared to the spec to verify conformity. The `/review` agent gives a score and a GO/NO‑GO verdict.

---

## S

### Screen Map
Central document that maps N user stories → M screens. Prevents you from creating one screen per story (an anti‑pattern). Stored in `01_Product/05 Specs/{module}/00_screen-map.md`.

### Skeleton
Grey, animated version of a screen shown while data is loading. Gives the impression that content is arriving (instead of a spinner).

### Slug
Short identifier without spaces for a module. Examples: `bookroom`, `admin-panel`, `user-settings`. Used in folder names and paths.

### Spec (Specification)
Detailed document that describes exactly what a screen or component must do. 9 sections: overview, acceptance criteria, layout, states, navigation, data, design system, roles, out of scope.

---

## T

### TDD (Test‑Driven Development)
Development method where you write **tests first**, then code to make them pass. Design OS enforces TDD in the `/build` phase.

### Tokens
Named values from the Design System. Instead of writing `#3B82F6` everywhere, you use `primary`. Instead of `16px`, you use `space-4`. Tokens live in `01_Product/06 Design System/tokens.md`.

### Triage
Classification of gaps found in review. 4 types:
- **IMPL** → Code bug → send back to `/build`
- **SPEC** → Spec is incomplete → send back to `/spec`
- **DESIGN** → Design needs revision → send back to `/ux`
- **DISCOVERY** → Missing user knowledge → send back to Discovery

Priority: DISCOVERY > DESIGN > SPEC > IMPL.

---

## U

### User Story
A feature described from the user's point of view. Format: "As a [role], I want [action] so that [benefit]." Example: "As a manager, I want to see available rooms so I can book quickly."

### UX (User Experience)
The overall experience a user has with your product. The "what it feels like" when someone uses your app.

---

## V

### VALIDATED
Status of a complete and approved spec. All 9 sections are filled, zero TBD. Only a VALIDATED spec can be used by `/build`.
