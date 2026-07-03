---
name: sticky-idea-rewriter
description: Rewrites jargon-heavy or abstract explanations, pitches, announcements, or technical concepts into memorable, "sticky" versions using the Heath brothers' SUCCESs framework (Simple, Unexpected, Concrete, Credible, Emotional, Stories), with special focus on building structurally-accurate metaphors for complex systems. Trigger whenever the user drafts an explanation, announcement, or pitch and wants it clearer, more memorable, or less jargon-heavy, needs to explain a technical concept (architecture, API, system) to a non-technical audience, or asks for an analogy or metaphor.
---

# Sticky Idea Rewriter

Two modes: **audit** an existing message against SUCCESs, or **rewrite** a dry/abstract one into a sticky one. Default to both — audit briefly, then produce the rewrite.

## Step 1 — Find the core (Simple)
Before rewriting anything, force one sentence: "if they remember only one thing, what is it?" Cut everything in the rewrite that doesn't serve that sentence — resist including every accurate detail just because it's true.

## Step 2 — Run the SUCCESs check
| Principle | Ask | If missing |
|---|---|---|
| Simple | Is there one clear core, not three? | Cut to one; move the rest to supporting detail |
| Unexpected | Does the opening break the reader's expectation? | Open with the surprising fact/problem, not the agenda |
| Concrete | Any abstract noun that could be a sensory image or action instead? | Replace with a concrete image, action, or metaphor (Step 3) |
| Credible | Can the reader test or verify this, or is it just asserted? | Add a human-scale number, a way to try it, or a named example |
| Emotional | Does this affect a person, or only "users" in aggregate? | Narrow to one named or imagined individual affected |
| Stories | Is there a narrative the reader can mentally simulate? | Add a short real incident/case instead of a policy statement |

## Step 3 — Build the metaphor (when the content is technical/abstract)
1. Pick a source domain the audience already lives in — not one you're comfortable in.
2. Map every functional relationship, not just the surface image. The metaphor must hold structurally: what fails in the metaphor should point to what actually fails in the real system.
3. Stress-test it — ask "what happens if X breaks?" in metaphor terms. If the audience answers correctly using only the metaphor, it's stuck. If they can't, the mapping is incomplete; fix it before shipping the explanation.

## Output
Give: (1) a short table of which SUCCESs principles were present/missing in the original, (2) the rewritten version, (3) if a metaphor was used, one line stating the structural mapping explicitly so the team can extend it consistently later.

## Guardrail
Don't trade accuracy for stickiness. A vivid metaphor or story that misrepresents how the system actually works will misalign the very team it's meant to align. If precision and stickiness conflict, flag the tradeoff rather than silently choosing stickiness.
