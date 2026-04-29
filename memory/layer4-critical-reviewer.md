---
name: Layer 4 — Critical Reviewer
description: Adversarial review pass — decisions, persona, stats, takeaway, UI Evidence Audit, Archetype Audit. Runs after Layer 3 build is complete.
type: reference
---

# Layer 4 — Critical Reviewer

> **Role**: Adversarial reviewer. Your job is to break the case study before it ships. Find generic writing, unverified claims, weak decisions, invisible fingerprints. Every audit below is a gate — not a suggestion.

> **When to run**: After Layer 3 has produced final JSX and content_blocks. Before any entry is added to `work_projects.json`.

> **Output format**: For each audit, report PASS / FAIL + severity + required action. A single SEV-1 blocks ship. A single SEV-2 requires return to specified layer before re-review.

---

## Audit Index

| # | Name | Severity if fail |
|---|------|-----------------|
| 1 | Decision Quality | SEV-1 |
| 2 | Persona Grounding | SEV-2 |
| 3 | Stat Integrity | SEV-1 |
| 4 | Outcome Specificity | SEV-2 |
| 5 | Narrative Arc Completeness | SEV-2 |
| 6 | Scannability Default | SEV-2 |
| 7 | Motion Purpose | SEV-2 |
| 8 | Content Budget Compliance | SEV-2 |
| 9 | UI Evidence Audit | SEV-1 |
| 10 | PROVE-IT Action | SEV-2 |
| 11 | Archetype Audit | SEV-2 |
| 12 | Token Compliance | SEV-2 |
| 13 | Input Parity | SEV-2 |
| 14 | Anti-Pattern Check | SEV-2 |
| 15 | Signature Move | SEV-2 |

---

## Audit 1 — Decision Quality

**Question**: Do all decisions in `decisions` / `structured_decision` sections follow the 4-part format?

Required fields per decision:
- Problem statement (observable, not abstract)
- Options considered (minimum 2, named)
- Choice made (specific, not "we chose the best option")
- Outcome (measurable or observable — not "it worked well")

**FAIL (SEV-1)**: Any decision missing a field, or outcome is vague/unmeasurable.

**Return to**: Layer 2 (narrative) for rewrite.

---

## Audit 2 — Persona Grounding

**Question**: Are personas based on [REAL] or [UI-SIGNAL] evidence, or are they [FABRICATED]?

- Personas drawn from research, quotes, or observed behavior = PASS
- Personas invented from "common sense" with no evidence tag = FAIL

**FAIL (SEV-2)**: Any persona field (goals, frustrations, behavior) is [FABRICATED] with no evidence anchor.

**Return to**: Layer 1 (evidence curator) to label and validate.

---

## Audit 3 — Stat Integrity

**Question**: Are all statistics in the case study attributed, plausible, and scoped?

- Stats must include: value + unit + source or context
- Stats derived from a prototype/pilot must be labeled as such
- No rounding that changes meaning (e.g. "50%" when n=2)

**FAIL (SEV-1)**: Any unattributed stat, inflated precision, or stat presented as production when it is prototype-only.

**Return to**: Layer 1 for stat audit.

---

## Audit 4 — Outcome Specificity

**Question**: Does the final outcome / impact section contain at least one measurable or observable result?

- "Reduced classification time by 40%" = PASS
- "Improved the user experience" = FAIL

**FAIL (SEV-2)**: Outcome section contains only qualitative sentiment with no observable anchor.

**Return to**: Layer 2 to rewrite outcome with specificity.

---

## Audit 5 — Narrative Arc Completeness

**Question**: Does the case study follow a complete arc — problem → insight → decision → resolution?

- All four beats present and sequenced = PASS
- Arc skips from problem directly to solution without insight = FAIL

**FAIL (SEV-2)**: Insight / turning-point beat is absent or buried past scroll depth 3.

**Return to**: Layer 2 for arc restructure.

---

## Audit 6 — Scannability Default

**Question**: Is the first pass of every section scannable without reading body copy?

- Each section has: headline + 1–2 line thesis + ≤3 bullets at top level = PASS
- Long paragraphs visible on first load with no progressive disclosure = FAIL

**FAIL (SEV-2)**: Any section with density=high or max_words > 200 that lacks `disclosure: collapsed` on overflow.

**Return to**: Layer 3 to enforce budget + disclosure.

---

## Audit 7 — Motion Purpose

**Question**: Does every animation answer one of: "what changed?" / "where am I?" / "what happened next?"

- Decorative animation with no functional feedback = FAIL
- All animations honor `prefers-reduced-motion: reduce` = required

**FAIL (SEV-2)**: Motion is purely decorative, or `prefers-reduced-motion` is not respected.

**Return to**: Layer 3 for motion audit pass.

---

## Audit 8 — Content Budget Compliance

**Question**: Does every section's actual word count and block count fit within its `meta` budget?

Check each section:
- `max_words` — count body copy words; exclude headlines
- `max_blocks` — count top-level content blocks before any collapsed disclosure

**FAIL (SEV-2)**: Any section exceeds its declared budget without a `disclosure: collapsed` container for overflow.

**Return to**: Layer 3 verifier pass.

---

## Audit 9 — UI Evidence Audit

**Question**: Is every UI claim in the case study backed by pixel-level observation, [REAL] data, or [UI-SIGNAL] label?

Forbidden patterns:
- "Clean interface" — not a claim, not evidence
- "Users found it intuitive" — requires a source
- "The layout is clear" — needs an observation

Required: every descriptive UI claim carries a label ([UI-SIGNAL] / [REAL]) or is removed.

**FAIL (SEV-1)**: Any unlabeled subjective UI claim presented as fact.

**Return to**: Layer 1 for re-labeling.

---

## Audit 10 — PROVE-IT Action

**Question**: Does the primary demo interaction force the viewer to prove the project's central argument themselves?

- The viewer must take an action that reveals the core insight = PASS
- The demo plays out passively or auto-advances without viewer agency = FAIL

**FAIL (SEV-2)**: Demo is passive (auto-play, slideshow, static screenshot) with no viewer-driven proof moment.

**Return to**: Layer 3 to redesign interaction trigger/feedback loop.

---

## Audit 11 — Archetype Audit

**Question**: Is the demo's `archetype_id` registered in the Interaction Archetype Library (`memory/interaction-archetype-library.md`)?

- `archetype_id` present in content_blocks AND exists in library Index = PASS
- Invented archetype not in library = FAIL

**FAIL (SEV-2)**: Unregistered archetype_id, or no archetype_id declared for a demo section.

**Return to**: Layer 3 to select from library or register new archetype before use.

---

## Audit 12 — Token Compliance

**Question**: Are all visual values (color, spacing, duration, easing, font size) expressed as design tokens, not hardcoded values?

- All values reference CSS custom properties (`--color-*`, `--spacing-*`, `--motion-*`, etc.) = PASS
- Any `#hex`, `px`, `ms`, or numeric font-size literal in component code = FAIL

**FAIL (SEV-2)**: Hardcoded visual value found in JSX or CSS for a component shipped in this case study.

**Return to**: Layer 3 to replace literals with tokens.

---

## Audit 13 — Input Parity

**Question**: Does every interactive element work equivalently via keyboard, mouse, and touch?

Check:
- All buttons/toggles reachable by Tab
- Space/Enter activates focused controls
- Touch targets ≥ 44×44px

**FAIL (SEV-2)**: Any interactive control unreachable or non-functional without a pointer device.

**Return to**: Layer 3 for accessibility pass.

---

## Audit 14 — Anti-Pattern Check

**Question**: Does the case study avoid the following anti-patterns?

| Anti-pattern | Why it fails |
|---|---|
| "I designed X" without why | No decision signal |
| Outcome = "improved UX" with no metric | Unmeasurable |
| Demo only shows happy path | Hides real complexity |
| Section order: hero → solution → problem | Breaks narrative arc |
| Stats without scope (n=?) | Misleading precision |
| Persona with no evidence anchor | Fabricated grounding |

**FAIL (SEV-2)**: Any anti-pattern present.

**Return to**: Appropriate layer per anti-pattern type (L1 for evidence, L2 for narrative, L3 for demo).

---

## Audit 15 — Signature Move

**Question**: Does the case study contain at least one visual move — argumentative OR atmospheric — that could only belong to this project?

A signature move is a visual or interactive expression of the project's core fingerprint (established in Layer 0). It must be present somewhere in the case study **outside of** (or in addition to) the functional demo section. If the fingerprint has no visual expression anywhere except inside the demo, the case study reads as generic.

---

### Two Valid Modes

**MODE A — Argumentative Signature**

An interactive or structural visual move that makes the viewer prove the argument themselves. The viewer takes an action that reveals or confirms the core insight.

Criteria:
- Viewer agency is required — the insight is not delivered, it is earned
- The interaction directly enacts the project's central claim
- Could not be re-skinned for a different project without changing its logic

Examples:
- Allianz demo: interactive toggle revealing confidence bands — the viewer proves invisibility → visibility by acting
- Budget tool: approval chain rendered as a filling progress bar — viewer sees how many sign-offs block progress
- Design system: token swatches shown at live component scale — viewer proves token-to-UI relationship directly

---

**MODE B — Atmospheric Signature**

A visual-mood expression that makes the viewer feel the project fingerprint before understanding it cognitively. Atmosphere precedes argument.

Criteria:
- A specific visual treatment (shape, motion, color shift, spacing weight, palette progression) tied to the project's emotional core
- The viewer feels the fingerprint as mood before reading the explanation
- Removing this treatment would make the section generic / interchangeable

Examples:
- Allianz problem section: abstract shapes fade from flat gray → colored confidence bands on scroll — the viewer feels the weight of invisibility becoming visible, before reading why it mattered
- Financial anxiety project: heavy spacing and muted palette building to relief-toned resolution — the emotional arc is expressed typographically before the copy explains it
- Clinical workflow project: structured grid with surgical whitespace — precision is felt as atmosphere before being described as a design principle

---

### Both Modes Require

- At least 1 visual detail tied directly to the project fingerprint (from Layer 0)
- The move could not appear in a generic portfolio template unchanged
- Design system token compliance — no hardcoded values
- Project-specific — if removed, the case study would lose its unique expression

---

### Pass Conditions

*(Either mode qualifies — both is stronger)*

- At least 1 argumentative OR atmospheric signature move is present outside the functional demo section (or the demo itself qualifies as one mode while another section qualifies as the other)
- The move is identifiable as "this could only belong to this project"

---

### Fail Conditions (SEV-2)

- Every visual detail is transferable to a different case study with no modification
- Project fingerprint has no visual expression — argumentative or atmospheric — anywhere in the case study
- Fingerprint exists only inside the demo section, nowhere else in the narrative

---

**FAIL (SEV-2)**: No signature move (either mode) found outside-or-alongside the demo section. All visual treatments are generic.

**Return to**: Layer 2 (narrative) to identify where in the arc the fingerprint should surface, then Layer 3 to implement the atmospheric or argumentative expression.
