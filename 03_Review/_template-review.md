 # Review — [X.Y] [Component/Page name]

 **Spec source**: `01_Product/05 Specs/{module}/specs/X.Y-name.spec.md`  
 **Code**: `02_Build/{module}/src/...`  
 **Tests**: `02_Build/{module}/tests/...`  
 **Date**: [YYYY-MM-DD]  
 **Reviewer**: `/review`

 ---

 ## Conformity score: X/Y

 | # | Criterion (Gherkin) | Status | Detail |
 |---|---------------------|--------|--------|
 | 1 | Given [context] When [action] Then [expected result] | PASS / FAIL | [explanation if failed] |
 | 2 | Given [...] When [...] Then [...] | PASS / FAIL | [detail] |
 | 3 | Given [...] When [...] Then [...] | PASS / FAIL | [detail] |

 ---

 ## Additional checks

 | Check | Status | Detail |
 |--------|--------|--------|
 | Empty state | PASS / FAIL | [conditional render when data is empty] |
 | Loading state | PASS / FAIL | [skeleton loader or spinner] |
 | Error state | PASS / FAIL | [error message + retry] |
 | Success state | PASS / FAIL | [render with data] |
 | Responsive | PASS / FAIL | [breakpoints present in classes] |
 | Accessibility | PASS / FAIL | [`aria-*`, `role=`, `tabIndex`] |
 | Strict types | PASS / FAIL | [no `any` / `@ts-ignore`] |
 | Design system (tokens) | PASS / FAIL | [no hard‑coded colors/spacing] |
 | Tests complete | PASS / FAIL | [one test per AC + one test per state] |

 ## UX checks

 | Check | UX Law | Status | Detail |
 |--------|--------|--------|--------|
 | Cognitive load | Miller, Chunking | PASS / FAIL | [info grouped into blocks vs flat list > 7] |
 | User choices | Hick | PASS / FAIL | [<= 5 visible actions vs > 5 CTAs] |
 | Clickable targets | Fitts | PASS / FAIL | [CTAs ≥ 36px vs buttons < 32px] |
 | Latency feedback | Doherty | PASS / FAIL | [skeleton loader vs no feedback] |
 | Pattern coherence | Jakob | PASS / FAIL | [DS patterns vs invented patterns] |
 | Distinct element | Von Restorff | PASS / FAIL | [primary CTA distinct vs identical buttons] |
 | Progression | Goal-Gradient | PASS / FAIL | [progress bar if multi‑step] |
 | End experience | Peak-End | PASS / FAIL | [gratifying success vs redirect without feedback] |

 ## Design System checks

 | # | Check | Status | Detail |
 |---|-------|--------|--------|
 | DS-1 | Hard‑coded hex colors | PASS / FAIL | [0 occurrences in .tsx] |
 | DS-2 | Inline rgb/rgba colors | PASS / FAIL | [0 occurrences] |
 | DS-3 | Arbitrary values | PASS / FAIL | [0 occurrences of `[#` or raw `[Npx]`] |
 | DS-4 | DS components reused | PASS / FAIL | [existing components used] |
 | DS-5 | Hard‑coded spacing | PASS / FAIL | [0 inline margin/padding] |
 | DS-6 | Hard‑coded font | PASS / FAIL | [0 inline fontSize] |

 ---

 ## Verdict: GO / NO-GO

 ### If NO-GO — identified gaps

 | # | Gap | Type | Required action |
 |---|-----|------|-----------------|
 | 1 | [gap description] | IMPL / SPEC / DESIGN / DISCOVERY | [concrete action] |
 | 2 | [description] | [type] | [action] |

 **Type legend:**
 - **IMPL** — Fix in code → `/build`
 - **SPEC** — Fix in spec → `/spec`
 - **DESIGN** — UX pattern to revisit → `/ux`
 - **DISCOVERY** — Wrong user hypothesis → `/discovery`

 **Return priority**: DISCOVERY > DESIGN > SPEC > IMPL

 **Dominant type**: [type] → Recommendation: relaunch [agent]

