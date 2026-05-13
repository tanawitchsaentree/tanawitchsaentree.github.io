---
name: Runtime Vocabulary
description: Complete reference for every section type ProjectModal.tsx can render — read by Layer 3 before choosing section types
type: reference
---

# Runtime Vocabulary — ProjectModal Section Types

> **Layer 3 instruction**: Read this file before choosing section types. Stop defaulting to the same 5–7 types. Every section type here is live and renderable. Mismatched content → wrong type → broken UX.

---

## Quick Index

| Type | Visual Form | Typical Intent |
|------|-------------|----------------|
| `hero` | Full-width headline + meta row + cover image | hook |
| `cover` | Centered image / illustration panel | hook / orient |
| `statement` | Large bold sentence + optional sub-copy | hook / reflect |
| `text_media` | 2-col: prose left + image/callout right | explain |
| `before_after` | 2-col side-by-side comparison cards | prove |
| `insight_cards` | Horizontal card row, 3–5 insight tiles | explain / prove |
| `decisions` | Accordion list of key design decisions | prove |
| `structured_decision` | Single decision: problem → options → choice → outcome | prove |
| `pinned_cards` | Physical "pinned memo" cards on a board, zigzag layout | prove / reflect |
| `personas` | Persona cards with avatar, goals, frustrations | orient / explain |
| `affinity_map` | Grouped tags / sticky-note clusters | explain |
| `feature_matrix` | Table: features × dimensions | prove |
| `research_method` | Method cards: icon + name + description | orient / explain |
| `quote` | Blockquote with attribution | prove / reflect |
| `pull_quote` | Oversized typographic pullout, no attribution | hook / reflect |
| `big_number` | Single hero stat, large numeral + label | prove |
| `stat_grid` | 2–4 stats in a grid row | prove |
| `ds_tokens` | Token swatch grid: color, spacing, type | explain |
| `ds_atomic` | Component showcase with live interactive states | prove |
| `audit_table` | Before/after table with severity labels | prove |
| `user_flow` | Step-by-step flow diagram (icon + label) | explain |
| `design_brief` | Structured brief card: goal, constraints, stakeholders | orient |
| `project_overview` | Meta block: role, timeline, tools, team | orient |
| `word_reveal` | Mask-reveal animated headline | hook |
| `timeline` | Vertical/horizontal phase strip with labels | orient / explain |
| `demo` | Full interactive component embedded in modal | prove |
| `atmospheric_opener` | 3 scroll-revealed pill-bars: gray → confidence colors. Fingerprint mood, no text. | hook |

---

## Section Type Reference

### `hero`

**Visual description**: Full-width section at the top of the case study. Headline in large type (48–72px range via token), sub-headline or tagline, a horizontal meta row (role · timeline · team), and optionally a cover image that bleeds to edges. Uses the project's `cover_color` accent from ProjectAccentCtx.

**Required fields**:
```json
{
  "id": "hero",
  "label": "Project Name",
  "type": "hero",
  "meta": { "intent": "hook", "density": "low", "max_words": 80, "max_blocks": 2, "proof_required": "none", "disclosure": "inline" },
  "data": {
    "headline": "Short project headline",
    "subheadline": "One-sentence framing",
    "role": "Lead Product Designer",
    "timeline": "Q3 2023 – Q1 2024",
    "team": "2 designers, 3 engineers"
  }
}
```

**Optional fields**: `cover_image` (URL or placeholder key), `tags` (string array), `award` (string)

**When to use**: Always first section of every case study. One per project.

**When NOT to use**: Never repeat within a case study. Never use for mid-story context.

**Visual signature**: Project accent color bar on left edge or top border. Headline uses `--font-display` weight. Meta row uses muted small-caps style.

**Real usage**: All 6 case studies — Allianz, Profita, Invitrace, Drift, Stellar, Roomvu.

---

### `cover`

**Visual description**: Full-width image panel with minimal text overlay. Intended for product screenshots, mockup showcases, or illustration plates that tell the story visually without prose. Can appear after `hero` or between narrative sections as a visual breathing space.

**Required fields**:
```json
{
  "type": "cover",
  "data": {
    "image": "/images/allianz-cover.png",
    "alt": "Document classification interface"
  }
}
```

**Optional fields**: `caption` (string), `aspect` ("16:9" | "4:3" | "cinema"), `overlay_text`

**When to use**: After hero to establish visual context. After a dense `explain` section to give eyes a rest. For a "ta-da" moment before a demo.

**When NOT to use**: Don't use as a placeholder for missing content. Don't use consecutively (two `cover` sections back-to-back = visual dead zone).

**Visual signature**: Image fills full section width, natural shadow or rounded corners, optional bottom caption in muted small type.

**Real usage**: Allianz (`allianz-cover.png`), Drift (phone frame illustration).

---

### `statement`

**Visual description**: Single large sentence — often a thesis, insight, or provocation — set at display size (32–48px). No decoration. Optional supporting line in regular weight below. Creates narrative momentum between sections.

**Required fields**:
```json
{
  "type": "statement",
  "data": {
    "text": "Analysts weren't slow — they were working without a safety net."
  }
}
```

**Optional fields**: `sub` (string — supporting sentence), `accent` (bool — applies cover_color underline to key phrase)

**When to use**: Pivotal narrative moments. After research findings to crystallize insight. Before the solution section as a bridge. End of case study as a reflection beat.

**When NOT to use**: Don't use more than 2 per case study. Never use as a section heading replacement. Text must be a real insight, not a summary sentence.

**Visual signature**: No card container. Full column width. High contrast. Line slightly narrower than full container (centered with max-width constraint).

**Real usage**: Allianz ("Reviewers weren't wrong — the interface just never showed them enough to be right"), Profita summary beat.

---

### `text_media`

**Visual description**: Two-column layout at desktop — prose on the left (60%), image or callout card on the right (40%). At mobile, stacks vertically with prose first. The media column can hold: a screenshot, a diagram, a code snippet, a metric card, or an inline component.

**Required fields**:
```json
{
  "type": "text_media",
  "data": {
    "body": "Rich text prose explaining the problem or solution.",
    "media": { "type": "image", "src": "/images/flow.png", "alt": "User flow diagram" }
  }
}
```

**Optional fields**: `headline` (string), `media.type` ("image" | "video" | "callout" | "code"), `media.caption`, `flip` (bool — swaps media to left)

**When to use**: Explaining a specific decision with a supporting visual. Walking through a process step. Any time prose alone would lose the reader without a visual anchor.

**When NOT to use**: Don't use when you have 3+ supporting images (use `insight_cards` or `cover` instead). Don't force a text_media when prose alone suffices.

**Visual signature**: Subtle column gap. Media column may have a light background tone if it's a callout card. Prose uses `renderRich()` — supports `**bold**` and paragraph breaks.

**Real usage**: Drift (problem framing + journey strip), Invitrace (token rationale + swatch preview), Roomvu (research framing).

---

### `before_after`

**Visual description**: Two columns labeled "Before" and "After" (or custom labels). Each column contains a screenshot or description card. A visual diff — left side shows the pain, right side shows the fix. Can include metric callout below ("Time on task: 4.2 min → 1.1 min").

**Required fields**:
```json
{
  "type": "before_after",
  "data": {
    "before": { "label": "Before", "image": "/images/old-ui.png", "caption": "Manual triage took 12 steps" },
    "after": { "label": "After", "image": "/images/new-ui.png", "caption": "AI-assisted triage: 3 steps" }
  }
}
```

**Optional fields**: `metric` (string — outcome delta displayed between columns), `before.bullets` / `after.bullets` (string array for text-only comparison)

**When to use**: Anywhere you're showing measurable improvement. Redesigns, system migrations, flow simplifications. When a before/after screenshot tells more than 200 words of prose.

**When NOT to use**: Don't fabricate before states. Don't use for conceptual comparisons — use `feature_matrix` instead. Don't use when images aren't available (text-only before/after is weak).

**Visual signature**: Card treatment for each column. "Before" in muted tone, "After" in accent tone. Optional metric badge centered between.

**Real usage**: Roomvu (homepage before/after), Allianz (triage interface comparison).

---

### `insight_cards`

**Visual description**: Horizontal scroll row of 3–5 cards, each card containing: an icon or number, a bold headline (1 line), and 2–3 lines of supporting text. Used to surface research findings, principles, or key insights in scannable form. Cards may have subtle color tinting by theme.

**Required fields**:
```json
{
  "type": "insight_cards",
  "data": {
    "cards": [
      { "icon": "🔍", "title": "Finding title", "body": "Short explanation of the insight." },
      { "icon": "⚡", "title": "Second finding", "body": "What this means for design." }
    ]
  }
}
```

**Optional fields**: `layout` ("row" | "grid"), `card.color` (accent hex), `card.tag` (label string like "Research" | "Principle")

**When to use**: Research synthesis. Design principles. Sprint retrospective takeaways. Anywhere you have 3–5 parallel items that shouldn't be a bullet list.

**When NOT to use**: Don't use for more than 5 cards (becomes overwhelming — split into two sections or use `audit_table`). Don't use for sequential steps (use `user_flow`).

**Visual signature**: Cards are equal-width, horizontal at desktop, stacked at mobile. Subtle card border, slight hover lift. Icon or emoji top-left, headline below.

**Real usage**: Profita (research findings), Roomvu (heuristic audit results), Drift (nomad pain points).

---

### `decisions`

**Visual description**: An accordion list of design decisions. Each item has: a decision question as the heading, collapsed by default, with options considered + rationale revealed on expand. Uses the `PinnedCard` visual style as variant, or a flat accordion.

**Required fields**:
```json
{
  "type": "decisions",
  "data": {
    "items": [
      {
        "question": "Should the confidence score be numeric or categorical?",
        "options": ["Numeric (0–100%)", "Categorical (Low/Med/High)", "Visual bar only"],
        "chosen": "Categorical (Low/Med/High)",
        "rationale": "Analysts anchored on exact numbers and over-trusted 73% vs 74%."
      }
    ]
  }
}
```

**Optional fields**: `items[].outcome` (string — what happened after), `items[].evidence` (string — data supporting the choice)

**When to use**: Showing design thinking rigor. When you have 3–7 meaningful decisions to defend. Great for demonstrating alternatives-considered thinking to senior reviewers.

**When NOT to use**: Don't pad with obvious or trivial decisions. Every item must show a real tradeoff — not "we chose blue because the brand is blue."

**Visual signature**: Chevron expand/collapse. Chosen option highlighted with accent color. Rationale in muted text.

**Real usage**: Allianz (confidence score format decision), Profita (risk profile display), Drift (crypto wallet display).

---

### `structured_decision`

**Visual description**: A single decision rendered as a 4-part structured card: (1) Problem framed as a question, (2) Options considered (2–4 items), (3) Chosen option highlighted, (4) Outcome or follow-up. More prominent than a single `decisions` accordion item. Used when ONE decision is complex enough to deserve its own section beat.

**Required fields**:
```json
{
  "type": "structured_decision",
  "data": {
    "question": "How should the AI surface document ambiguity to reviewers?",
    "options": [
      { "label": "Inline warning flags", "pro": "Visible immediately", "con": "Adds visual noise" },
      { "label": "Sidebar confidence panel", "pro": "Clean main view", "con": "Easy to ignore" },
      { "label": "Progressive reveal on hover", "pro": "Low friction default", "con": "Discoverability risk" }
    ],
    "chosen": "Progressive reveal on hover",
    "outcome": "Reduced review abandonment by 31% in usability testing."
  }
}
```

**Optional fields**: `data.evidence` (string), `data.stakeholder_constraint` (string), `data.image` (screenshot of the implemented choice)

**When to use**: The single most critical design decision in a case study. When you need to show a full options-considered + evidence-backed chain for one pivotal call.

**When NOT to use**: Don't use more than 2 per case study (dilutes impact). Don't use for minor UI decisions.

**Visual signature**: 4-part layout. Options as a horizontal list with pro/con. Chosen option in accent box. Outcome as a metric or quote below.

**Real usage**: Allianz (L4 audit introduced this for the confidence score decision), Drift (ia_guided_tour trigger decision).

---

### `pinned_cards`

**Visual description**: Physical "memo on board" aesthetic — cards with a pushpin at top, slight rotation (alternating ±2–4°), subtle paper texture. 3–5 cards arranged in zigzag horizontal layout. Index prop drives both rotation direction and accent color cycling. Best for decisions, learnings, or insights that benefit from the "pinned to a wall" metaphor.

**Required fields**:
```json
{
  "type": "pinned_cards",
  "data": {
    "cards": [
      { "title": "Decision or learning", "body": "Short explanation. Keep under 40 words." },
      { "title": "Second card", "body": "What you learned or decided." }
    ]
  }
}
```

**Optional fields**: `cards[].icon` (emoji or icon name), `cards[].tag` (string label)

**When to use**: 3–5 lessons learned / retrospective insights / key decisions as a visual pause before conclusion. When `decisions` accordion feels too clinical and you want warmth.

**When NOT to use**: Don't use for more than 5 cards (layout breaks). Don't use for sequential items (use `user_flow`). Not appropriate for formal audit contexts.

**Visual signature**: Paper-white or warm cream card backgrounds. Colorful pushpins (cycles through accent palette). Zigzag Y-offset alternating ±8px. Slight drop shadow.

**Real usage**: Profita (retro learnings), Invitrace (design system decisions), Stellar (recipe UX learnings).

---

### `personas`

**Visual description**: Persona cards displayed in a 2–3 column grid (or horizontal scroll at mobile). Each card has: avatar (illustration or placeholder circle), name, role/title, age, primary goal, top frustration, and optionally a quote. Cards use soft, rounded style.

**Required fields**:
```json
{
  "type": "personas",
  "data": {
    "personas": [
      {
        "name": "Maria",
        "role": "Senior Claims Analyst",
        "goal": "Clear the daily document queue without second-guessing AI flags",
        "frustration": "Confidence scores feel arbitrary — she can't tell why the model flagged something"
      }
    ]
  }
}
```

**Optional fields**: `personas[].age`, `personas[].quote`, `personas[].avatar` (image URL), `personas[].tags` (string array of attributes)

**When to use**: Early in a case study to establish who the design is for. Essential for any user research-driven project. Must reflect real user research — not invented archetypes.

**When NOT to use**: Don't fabricate personas. Don't use if the project had no user research phase. Don't use for internal tooling with a single obvious user type.

**Visual signature**: Soft card with rounded avatar circle at top. Name bold, role muted. Goal in green-tinted text, frustration in amber-tinted text. Tags as pill badges.

**Real usage**: Allianz (claims analyst persona), Profita (investor personas), Drift (crypto nomad persona).

---

### `affinity_map`

**Visual description**: Clusters of "sticky note" tags grouped under theme headings. Each cluster has a bold theme title, followed by 4–8 tag chips. Tags represent raw research notes, interview quotes, or observations that were grouped together. Conveys "we did synthesis" visually.

**Required fields**:
```json
{
  "type": "affinity_map",
  "data": {
    "clusters": [
      {
        "theme": "Trust & Confidence",
        "tags": ["'I don't trust the score'", "Reviews it anyway", "Wants source doc link", "Double-checks manually"]
      }
    ]
  }
}
```

**Optional fields**: `clusters[].color` (accent hex for cluster), `clusters[].count` (number of raw notes in cluster)

**When to use**: After user research section to show synthesis process. Before problem statement to show how insights were derived. Good for research-heavy projects (Type C).

**When NOT to use**: Don't fabricate tags from imagined research. Don't use if you have fewer than 2 clusters. Not appropriate for projects with no research phase.

**Visual signature**: Tags as soft rounded chips in muted yellow/orange. Theme heading bold above each cluster. Clusters in a masonry or 2-col grid layout.

**Real usage**: Roomvu (usability study clustering), Profita (investor interview synthesis).

---

### `feature_matrix`

**Visual description**: A comparison table with features as rows, dimensions (competitors, versions, or states) as columns. Cells contain checkmarks, X marks, or short text values. Used for competitive analysis, before/after feature coverage, or design system component inventory comparisons.

**Required fields**:
```json
{
  "type": "feature_matrix",
  "data": {
    "columns": ["Our design", "Competitor A", "Competitor B"],
    "rows": [
      { "feature": "Confidence score", "values": ["✓ visible", "Hidden", "Numeric only"] },
      { "feature": "Audit trail", "values": ["✓ per document", "✗", "Summary only"] }
    ]
  }
}
```

**Optional fields**: `highlight_column` (index — applies accent background to one column), `caption` (string)

**When to use**: Competitive analysis. Feature gap analysis. Design system coverage comparison. When you have structured parallel data that a prose paragraph would make confusing.

**When NOT to use**: Don't use for more than 8 rows (table becomes unreadable). Don't use for non-parallel data.

**Visual signature**: Sticky header row. Alternating row backgrounds. Checkmarks in accent green, X in muted red. Highlighted column in accent tint.

**Real usage**: Invitrace (component coverage matrix), Roomvu (competitive analysis).

---

### `research_method`

**Visual description**: A set of method cards — each card shows: icon, method name (e.g., "Contextual Inquiry"), brief description (2–3 lines), and optionally sample size or duration. Cards arranged in 2–3 column grid. Establishes research rigor upfront.

**Required fields**:
```json
{
  "type": "research_method",
  "data": {
    "methods": [
      {
        "icon": "🎙",
        "name": "Semi-structured interviews",
        "description": "8 sessions with claims analysts, 45 min each. Focused on current triage workflow and trust in AI outputs."
      }
    ]
  }
}
```

**Optional fields**: `methods[].sample` (string), `methods[].duration` (string), `methods[].tag` ("qual" | "quant" | "mixed")

**When to use**: Research-led projects (Type A, C). In the orient/explain phase after the hero. Signals that the work was evidence-based.

**When NOT to use**: Don't use for concept projects (Type B) with no real research. Don't use if the research was superficial desk research only.

**Visual signature**: Icon large at top of card. Method name bold. Description in body text. Optional tag pill at bottom-right.

**Real usage**: Allianz (interviews + contextual inquiry), Roomvu (5-second test + heuristic audit).

---

### `quote`

**Visual description**: Blockquote — a user or stakeholder quote in large italic text, with attribution (name, role) below. Left border accent bar in the project's cover_color. Used to introduce a user voice as evidence or emotional anchor.

**Required fields**:
```json
{
  "type": "quote",
  "data": {
    "text": "I know the AI is probably right, but I still have to verify everything myself because I can't explain why it flagged it.",
    "attribution": "Senior Claims Analyst, Allianz Thailand"
  }
}
```

**Optional fields**: `attribution_role` (string), `context` (string — when/where the quote was collected)

**When to use**: After research synthesis to humanize a finding. To support a design decision with user voice. 1–2 max per case study.

**When NOT to use**: Don't fabricate quotes. Don't use without attribution. Don't use the same quote as multiple sections.

**Visual signature**: Left border bar in accent color. Quote text in italic. Attribution in small-caps muted text below.

**Real usage**: Allianz (analyst trust quote), Profita (investor anxiety quote).

---

### `pull_quote`

**Visual description**: An oversized typographic pullout — no attribution, no card border. A single sentence or phrase extracted from the surrounding narrative, blown up to 32–48px to create a visual pause and emphasis. Purely typographic, no decoration.

**Required fields**:
```json
{
  "type": "pull_quote",
  "data": {
    "text": "Speed without comprehension is a liability, not a feature."
  }
}
```

**Optional fields**: `size` ("large" | "xl"), `align` ("left" | "center")

**When to use**: As a visual beat between sections. To emphasize a core thesis. When the case study needs a typographic pause before a dense section.

**When NOT to use**: Don't use for factual claims (use `quote` with attribution instead). Don't use more than once per case study. Text must be memorable, not generic.

**Visual signature**: Full column width. No box or card. Accent color on a key word (optional). Bold weight, tight line-height.

**Real usage**: Profita (risk insight), Drift (nomad lifestyle thesis).

---

### `big_number`

**Visual description**: A single hero stat — the number itself at massive scale (80–120px, display weight), a short label below it (2–4 words), and optionally a context line. Fills most of the section width. Maximum visual impact for one key metric.

**Required fields**:
```json
{
  "type": "big_number",
  "data": {
    "value": "31%",
    "label": "reduction in review abandonment",
    "context": "Usability testing, n=18"
  }
}
```

**Optional fields**: `data.color` (hex), `data.delta` (string — e.g., "↓ from 52%"), `data.timeframe`

**When to use**: When you have ONE metric that defines success. Outcome sections. When the number is remarkable enough to carry a section solo.

**When NOT to use**: Don't use for weak or fabricated stats. Don't use more than 2 per case study (diminishing returns). Use `stat_grid` for 2+ numbers.

**Visual signature**: Number in accent color at display size. Label in muted body text. Context in small-caps. Centered or left-aligned layout.

**Real usage**: Allianz (31% abandonment reduction), Profita (RBI Asia 2023 metric).

---

### `stat_grid`

**Visual description**: A horizontal row of 2–4 stat tiles, each showing: metric value (large, bold), label below, and optional delta indicator. Less drama than `big_number` — suited for presenting several outcomes together as a proof cluster.

**Required fields**:
```json
{
  "type": "stat_grid",
  "data": {
    "stats": [
      { "value": "4.2→1.1 min", "label": "Time on task" },
      { "value": "18/18", "label": "Task completion" },
      { "value": "+31%", "label": "Trust score" }
    ]
  }
}
```

**Optional fields**: `stats[].context` (string), `stats[].color` (hex), `layout` ("3col" | "4col" | "2col")

**When to use**: Outcomes section with multiple metrics. After a demo or before/after section. When you have 2–4 supporting stats that together form a proof cluster.

**When NOT to use**: Don't pad with vanity stats. Every stat must be real and sourced. Don't use for a single metric — use `big_number`.

**Visual signature**: Equal-width tiles. Value in large bold. Label in muted small text. Optional thin top border in accent per tile.

**Real usage**: Allianz outcome section, Roomvu usability results, Profita launch metrics.

---

### `ds_tokens`

**Visual description**: A design token swatch grid — organized by token category (color, spacing, typography, radius, shadow). Each swatch shows: visual preview (color block, spacing bar, type specimen), token name, and value. Used exclusively for design system case studies.

**Required fields**:
```json
{
  "type": "ds_tokens",
  "data": {
    "categories": [
      {
        "name": "Color",
        "tokens": [
          { "name": "--color-primary-500", "value": "#7c6bff", "preview": "swatch" },
          { "name": "--color-surface-1", "value": "#0a0a0f", "preview": "swatch" }
        ]
      }
    ]
  }
}
```

**Optional fields**: `categories[].tokens[].usage` (string — "use for: CTA buttons"), `categories[].tokens[].deprecated` (bool)

**When to use**: Design system case studies only (Invitrace pattern). Token documentation section. When the output IS the token system.

**When NOT to use**: Don't use for product case studies. Don't use to show design specs — that's a different concern.

**Visual signature**: Grid of swatches. Color tokens as filled squares. Spacing tokens as a horizontal bar with px label. Type tokens as a specimen line at scale.

**Real usage**: Invitrace (`invitrace-design-system.json`, token showcase section).

---

### `ds_atomic`

**Visual description**: An interactive component showcase — renders live component states (default, hover, active, disabled, error, focus) side by side. Supports: buttons, inputs, badges, cards. User can click tabs to toggle between component types, and see all states simultaneously. This is the `DsAtomicShowcase` component in ProjectModal.tsx.

**Required fields**:
```json
{
  "type": "ds_atomic",
  "data": {
    "components": [
      {
        "name": "AppointmentCard",
        "states": ["idle", "pending", "confirmed", "cancelled", "error"],
        "description": "5-state appointment card with status-driven visual system"
      }
    ]
  }
}
```

**Optional fields**: `data.default_tab` (component name), `data.show_code` (bool — reveals token usage beneath each state)

**When to use**: Design system case studies to prove the system works across real states. When the output is a component library with defined states. Use when interactivity helps more than a screenshot.

**When NOT to use**: Don't use for product case studies. Don't use if component states are trivial (only default + disabled).

**Visual signature**: Tab strip for component types. State grid below. Each state in a labeled card. Hover triggers state tooltip. Subtle animation on state change.

**Real usage**: Invitrace (AppointmentCard 5-state showcase).

---

### `audit_table`

**Visual description**: A heuristic or UX audit table — rows are issues found, columns are: heuristic violated, severity (SEV-1/2/3), current state, recommended fix. Severity indicators are color-coded (red/amber/green). Compact table format with scroll if many rows.

**Required fields**:
```json
{
  "type": "audit_table",
  "data": {
    "headers": ["Issue", "Heuristic", "Severity", "Recommendation"],
    "rows": [
      ["No error recovery path", "Error Prevention", "SEV-1", "Add inline validation before submit"],
      ["Icon-only CTA", "Recognition not Recall", "SEV-2", "Add label to primary action button"]
    ]
  }
}
```

**Optional fields**: `data.caption` (string), `data.source` (string — "Nielsen 10 Heuristics", "WCAG 2.1")

**When to use**: Heuristic evaluation projects. UX audit deliverables. When a problem inventory needs to be scannable by severity. Great for demonstrating analytical rigor.

**When NOT to use**: Don't use for design decisions — use `decisions` type. Don't use for more than 15 rows without grouping.

**Visual signature**: Severity column has colored dot + label. SEV-1 = red, SEV-2 = amber, SEV-3 = yellow. Row hover highlight. Fixed header row on scroll.

**Real usage**: Roomvu (heuristic evaluation table).

---

### `user_flow`

**Visual description**: A step-by-step visual flow — horizontal strip at desktop, vertical at mobile. Each step has: step number or icon, step label, and optional micro-description. Arrows or connector lines between steps. Used to show a user journey, onboarding flow, or process walkthrough.

**Required fields**:
```json
{
  "type": "user_flow",
  "data": {
    "steps": [
      { "label": "Upload document", "description": "Drag-drop or browse" },
      { "label": "AI classifies", "description": "Model assigns category + confidence" },
      { "label": "Analyst reviews", "description": "Sees explanation + source highlight" },
      { "label": "Override or approve", "description": "Decision logged to audit trail" }
    ]
  }
}
```

**Optional fields**: `steps[].icon` (string), `steps[].time` (string — "~30 sec"), `steps[].pain` (bool — marks step as a pain point in current state)

**When to use**: Showing redesigned flows. Onboarding journeys. Task flows that were simplified. When process clarity is a key outcome.

**When NOT to use**: Don't use for organizational flows or stakeholder maps — too complex for this component. Don't use for non-linear flows.

**Visual signature**: Numbered steps in circles. Connector arrows between. Pain-point steps get amber/red tint if `pain: true`. Step labels in bold, descriptions in muted text.

**Real usage**: Allianz (document review flow), Profita (fund purchase flow).

---

### `design_brief`

**Visual description**: A structured brief card presenting the project's design challenge as four fields: Goal (what we're trying to achieve), Constraints (technical, time, org), Stakeholders (who it serves), and Success Criteria. Compact, scannable. Establishes scope before diving in.

**Required fields**:
```json
{
  "type": "design_brief",
  "data": {
    "goal": "Make AI-assisted document classification transparent enough for analysts to trust and act on.",
    "constraints": ["No retraining the model", "Must integrate with existing SAP workflow", "6-week sprint"],
    "stakeholders": ["Claims analysts (primary)", "Compliance team", "IT infrastructure"],
    "success": "Analysts can explain their override decision in under 60 seconds."
  }
}
```

**Optional fields**: `data.non_goals` (string array), `data.prior_art` (string)

**When to use**: Early in a case study to frame scope clearly. Especially useful for complex enterprise projects where the constraints matter as much as the design.

**When NOT to use**: Don't use for simple side projects. Don't use if the case study hero already covers all this.

**Visual signature**: 4-field grid card. Each field has a small label in small-caps and body text. Light background, soft border.

**Real usage**: Allianz (classification sprint brief), Invitrace (design system brief).

---

### `project_overview`

**Visual description**: Meta information block — role, timeline, team size, tools used, company/client. Usually placed near the hero as a quick-reference sidebar or row. Compact, dense-but-scannable. Sometimes combined with the hero data row.

**Required fields**:
```json
{
  "type": "project_overview",
  "data": {
    "role": "Lead Product Designer",
    "timeline": "Q3–Q4 2023 (16 weeks)",
    "team": "2 designers, 4 engineers, 1 PM",
    "tools": ["Figma", "Miro", "Zeplin"]
  }
}
```

**Optional fields**: `data.company`, `data.platform` (string — "Web app", "iOS + Android"), `data.type` (string — "Shipped product" | "Design sprint" | "Concept")

**When to use**: When the meta information isn't already covered in the `hero` section. For complex projects where team size and tools are relevant to the story.

**When NOT to use**: Don't duplicate what the hero already shows. Don't use if the project overview is minimal.

**Visual signature**: Horizontal pill-row or compact grid. Labels in small-caps. Values in body weight. Tools rendered as pill badges.

**Real usage**: All case studies include this data in hero or as a standalone orient section.

---

### `word_reveal`

**Visual description**: An animated headline where words or letter groups are revealed sequentially via a mask animation. Text appears to be "wiped" or "unveiled" from left to right. Uses CSS `@property --reveal` and `animation-timeline: view()` for scroll-triggered entrance. Single headline only — not for body copy.

**Required fields**:
```json
{
  "type": "word_reveal",
  "data": {
    "text": "From noise to clarity in 3 seconds."
  }
}
```

**Optional fields**: `data.size` ("display" | "headline"), `data.align` ("left" | "center"), `data.stagger_ms` (number — ms between words)

**When to use**: Section transitions that need momentum. Before a key outcome or demo section. Maximum one per case study. The text must be worth the drama — a real insight, not a section title.

**When NOT to use**: Don't use as a section heading. Don't use more than once. Don't use for text that needs to be read carefully (animation distracts from comprehension of complex sentences). Must respect `prefers-reduced-motion`.

**Visual signature**: Words appear left-to-right via clip-path or opacity mask. Spacing between words maintained. Effect tied to scroll position or viewport entry.

**Real usage**: Allianz (outcome reveal before metrics), Drift (nomad framing).

---

### `timeline`

**Visual description**: A phase strip — horizontal at desktop (with connecting line), vertical at mobile. Each phase has: label, optional date/duration, optional brief description. Used to show project phases, research process, or delivery roadmap.

**Required fields**:
```json
{
  "type": "timeline",
  "data": {
    "phases": [
      { "label": "Discovery", "duration": "Weeks 1–2", "description": "Stakeholder interviews + process mapping" },
      { "label": "Definition", "duration": "Week 3", "description": "Problem framing + success criteria" },
      { "label": "Design", "duration": "Weeks 4–8", "description": "Iterative prototyping + usability testing" },
      { "label": "Delivery", "duration": "Weeks 9–12", "description": "Handoff + launch support" }
    ]
  }
}
```

**Optional fields**: `phases[].active` (bool — highlights current phase), `phases[].milestone` (string)

**When to use**: Orient section showing project structure. Process-heavy case studies. When the timeline itself is part of the story (very short sprint, phased rollout).

**When NOT to use**: Don't use if the timeline is generic. Don't use for user journeys — use `user_flow`.

**Visual signature**: Circle nodes connected by horizontal line. Phase labels below nodes. Descriptions in small muted text. Active phase (if any) gets accent color fill.

**Real usage**: Invitrace (phased rollout), Roomvu (research sprint timeline).

---

### `demo`

**Visual description**: A full interactive component embedded in the modal. The largest, most complex section type. Uses a seed of the `archetype_id` to render one of the registered interactive demos. The demo fills the section, often with a phone frame, control panel, or step navigation.

**Required fields**:
```json
{
  "type": "demo",
  "meta": { "intent": "prove", "density": "high", "max_words": 60, "max_blocks": 1, "proof_required": "strong", "disclosure": "inline" },
  "data": {
    "demo": "drift_app",
    "headline": "Experience the guided onboarding flow",
    "sub": "Walk through the 4-step nomad setup that reduces drop-off."
  }
}
```

**Optional fields**: `data.cta` (string — button label before demo starts), `data.note` (string — usage instruction)

**When to use**: Every case study should have at most ONE demo section. Place it after the "solution" narrative beat — after the problem is understood, before outcomes. The demo is evidence, not decoration.

**When NOT to use**: Don't use more than one per case study. Don't use without a headline and framing sub-copy. Don't use without first running the archetype through the L3 → L4 pipeline.

**Visual signature**: Section-width container. Demo component renders with full interactivity. Below demo: outcome stat or CTA to continue scrolling.

**Real demo values** (see Demo Variants section below for full spec):
- `confidence_scanner` — Allianz
- `persona_lens` — Profita
- `recipe_collapse` — Stellar
- `roomvu_homepage` — Roomvu
- `drift_app` — Drift
- (Invitrace uses `ds_atomic` as interactive section, not `demo` type)

---

## Motion Spec Reference

Every section can optionally include a `motion` field to override default entrance animation:

```json
"motion": {
  "enter": "fade_up",
  "duration": 0.7,
  "delay": 0.1,
  "y_enter": 32,
  "stagger": 0.08,
  "easing": "fast_out"
}
```

### `enter` values

| Value | Effect | Best for |
|-------|--------|----------|
| `fade_up` | Opacity 0→1 + Y-translate up (default) | Most sections |
| `fade_in` | Opacity 0→1 only, no Y movement | Cover images, hero |
| `blur_in` | Opacity + blur filter dissolve | Statement, pull_quote |
| `slide_left` | Enters from right, slides to position | Text_media (media col) |
| `slide_right` | Enters from left, slides to position | Text_media (prose col) |
| `none` | No entrance animation | Decorative elements, accents |

### Duration ranges (seconds)

| Intent | Range | Default |
|--------|-------|---------|
| hook | 0.4–0.6 | 0.5 |
| orient | 0.5–0.7 | 0.6 |
| explain | 0.6–0.8 | 0.7 |
| prove | 0.7–0.9 | 0.8 |
| reflect | 0.8–1.0 | 0.9 |

### `easing` aliases → cubic-bezier

| Alias | Curve | Use for |
|-------|-------|---------|
| `fast_out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard UI transitions |
| `symmetric` | `cubic-bezier(0.4, 0, 0.6, 1)` | Balanced enter/exit |
| `spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful, overshoots slightly |

### Stagger (seconds)

Used for sections with multiple children (cards, stats, personas). Each child delays by `stagger` × index.
- Default: `0.08`
- Dense grids: `0.05`
- Deliberate reveals: `0.12–0.15`

### Delay (seconds)

Use to sequence sections that are visible simultaneously in viewport:
- First section: `0`
- Hero sub-copy: `0.15`
- Hero meta row: `0.25`
- Sequential cards: driven by `stagger`, not `delay`

---

## SectionMeta Field Reference

Every section **must** include a `meta` block. Layer 3 must set all 6 fields explicitly.

```json
"meta": {
  "intent": "hook | orient | explain | prove | reflect",
  "density": "low | medium | high",
  "max_words": 120,
  "max_blocks": 3,
  "proof_required": "none | light | strong",
  "disclosure": "inline | collapsed"
}
```

### `intent` — what is this section doing?

| Value | Purpose | Typical position |
|-------|---------|-----------------|
| `hook` | Grab attention, create curiosity | Sections 1–2 |
| `orient` | Set context, scope, roles | Sections 2–4 |
| `explain` | Show process, rationale | Sections 4–8 |
| `prove` | Evidence, outcomes, validation | Sections 7–10 |
| `reflect` | Lessons, retrospective, next | Last 1–2 sections |

### `density` — how much content is appropriate?

| Value | Meaning | max_words | max_blocks |
|-------|---------|-----------|------------|
| `low` | Minimal — headline + 1–2 items | 60–120 | 2–3 |
| `medium` | Standard — headline + prose + 3–5 items | 150–300 | 3–5 |
| `high` | Dense — full data table, card grid, or demo | 300–500 | 5–8 |

### `proof_required` — what evidence level is needed?

| Value | Meaning |
|-------|---------|
| `none` | No data needed — framing, narrative, reflection |
| `light` | At least one supporting fact, observation, or quote |
| `strong` | Must include: metric OR user quote OR test result OR shipped screenshot |

### `disclosure` — how is additional depth surfaced?

| Value | Behavior |
|-------|---------|
| `inline` | All content visible by default |
| `collapsed` | Supporting detail hidden behind accordion or "Read more" toggle |

### Default budgets by intent

| Intent | density | max_words | max_blocks | proof_required |
|--------|---------|-----------|------------|----------------|
| `hook` | low | 60–120 | 2 | none |
| `orient` | low | 80–120 | 3 | none |
| `explain` | medium | 180–300 | 4 | light |
| `prove` | medium–high | 240–420 | 5 | strong |
| `reflect` | low | 120–220 | 3 | none |

**L3 Verifier rule**: if a section's word count exceeds `max_words`, move overflow to `disclosure: collapsed`.

---

## Demo Variants

These are the 5 live interactive demo components embedded in ProjectModal.tsx. Each maps to a `demo` value in the section JSON.

---

### `confidence_scanner`

**Project**: Allianz — Document Classification
**Archetype**: `ia_evidence_ladder`
**What it does**: Simulates the document review interface. User clicks through sample documents. For each document, the scanner reveals AI confidence score, category assignment, highlighted evidence passages, and reviewer override controls. Demonstrates the progressive disclosure of AI reasoning.

**Key interactions**:
- Click document tile → see classification + confidence
- "Show evidence" → highlights source passage in mock document
- Override toggle → logs decision to audit trail
- Confidence bar animates from 0 to score on reveal

**Seed data**: 4 sample documents (insurance claim, medical report, ID document, bank statement) with pre-set confidence scores and category labels.

**When to replicate pattern**: Any AI-assisted review tool where showing model reasoning builds trust.

---

### `persona_lens`

**Project**: Profita — Mutual Fund Platform (LH Bank)
**Archetype**: `ia_tradeoff_toggle`
**What it does**: Three investor persona cards (Conservative, Balanced, Aggressive). Clicking a persona lens "filters" the fund recommendation display — same fund list reorders and highlights differently per persona's risk profile. Demonstrates personalization logic.

**Key interactions**:
- Select persona card → fund list re-sorts with animated reorder
- Hover fund tile → shows match score for selected persona
- Toggle between personas → compares how recommendations shift

**Seed data**: 3 personas, 6 fund entries with risk scores per persona.

**When to replicate pattern**: Any personalization or recommendation system where showing the logic makes the product more trustworthy.

---

### `recipe_collapse`

**Project**: Stellar — Recipe App (Side Project)
**Archetype**: `ia_filter_domino` + `ia_guided_tour` elements
**What it does**: A mobile recipe interface demo. User drags ingredients from a pantry list to a basket. When 3+ matching ingredients are added, the AI "collapses" the recipe list to show only makeable recipes. A typewriter animation shows AI "thinking" then reveals suggestions.

**Key interactions**:
- Drag ingredient → basket updates
- 3+ ingredients → recipe list collapses to matches with animation
- Typewriter AI response appears ("Based on your pantry…")
- Tap recipe card → expands with steps
- Horizontal scroll row for ingredient chips (mobile-optimized)

**Seed data**: `RECIPE_DB` (12 recipes with ingredient arrays), `INGREDIENTS_LIST` (20 ingredients).

**When to replicate pattern**: Any "smart filter" or ingredient-matching system. Good for showing constraint-satisfaction logic visually.

---

### `roomvu_homepage`

**Project**: Roomvu — Real Estate Video Platform Redesign
**Archetype**: `ia_heatmap_overlay` + `ia_comparator_slider`
**What it does**: A before/after homepage redesign with an interactive slider. Left side = original design, right side = redesigned. Dragging the divider reveals more of one side. Optional heatmap overlay toggle shows where users clicked in 5-second test.

**Key interactions**:
- Drag slider → reveals before vs after
- "Show heatmap" toggle → overlays click density (warm/cool colors)
- Hover hotspot → tooltip with observation note

**Seed data**: Before/after screenshot (or placeholder), mock heatmap data as SVG overlay.

**When to replicate pattern**: Any homepage redesign or A/B comparison. Heatmap overlay is unique to this demo.

---

### `drift_app`

**Project**: Drift — Nomad App (Concept)
**Archetype**: `ia_guided_tour`
**What it does**: A mobile phone frame rendering the Drift onboarding flow. Step-by-step journey strip at the bottom tracks progress. User clicks "Next" to advance through 4 onboarding screens: Profile → Wallet → Locale → Dashboard unlock. Each screen has a brief narrative annotation.

**Key interactions**:
- Phone frame displays current onboarding screen
- Journey strip shows 4 steps, current highlighted
- "Next" advances with smooth slide transition
- Final step unlocks dashboard with a micro-celebration animation
- Tab navigation between: Onboarding / Dashboard / Explore

**Seed data**: 4 onboarding screens (SVG/placeholder layouts), journey step labels, tab content stubs.

**When to replicate pattern**: Any onboarding flow or guided setup wizard. Phone frame signals mobile-first design intent.

---

---

### `atmospheric_opener`

**Visual description**: Three horizontal pill-bars, staggered widths (78% / 63% / 71%), rendered in `var(--muted)` flat gray on load. When scrolled into view, each bar transitions to its confidence-tier color — green (`var(--color-success)`), amber (`var(--color-warning)`), red (`var(--color-error)`) — over ~800ms with ease-out timing and 180ms stagger between bars. No text. Generous vertical padding. Expresses the project fingerprint ("invisible uncertainty becoming visible") as atmospheric mood before any copy explains it.

**Required fields**:
```json
{
  "id": "atmosphere",
  "type": "atmospheric_opener",
  "meta": { "intent": "hook", "density": "low", "max_words": 0, "max_blocks": 1, "proof_required": "none", "disclosure": "visual_only" },
  "data": {
    "concept": "invisibility_becomes_signal",
    "transition_trigger": "scroll_into_view",
    "reveal_behavior": "once_revealed_stays_revealed",
    "alt": "Three identical gray shapes on load. They fade into green, amber, and red bands as you scroll..."
  }
}
```

**Token usage**: `--muted` (before state) · `--color-success` · `--color-warning` · `--color-error` · `--radius-sm` · `--space-3` (bar height) · `--space-6` (gap) · `--space-16` (vertical padding) · `--motion-ease-decelerate` (ease-out feel)

**Accessibility**: `role="img"` + `aria-label` on outer div. `prefers-reduced-motion` → instant reveal, no fade, no keyframe animation.

**When to use**: Allianz case study only, between `hero` and `problem`. This type encodes a specific project fingerprint — do not reuse for other projects without a new section type that carries different semantic meaning.

**When NOT to use**: Do not use in projects without a confidence/signal fingerprint. Do not use more than once per case study.

**Real usage**: Allianz (`allianz-doc-classification.json`, section id: `atmosphere`). Implements Audit 15 Mode B — Atmospheric Signature.

---

## Layer 3 Usage Instructions

When selecting section types for a new case study:

1. **Read the project brief (L0 output)** — project type (A/B/C/D/E) constrains which section types are appropriate.
2. **Check evidence availability (L1 output)** — `proof_required: strong` sections need [REAL] or [UI-SIGNAL] evidence. Never fill with [FABRICATED].
3. **Map narrative arc (L2 output)** — assign intent (hook/orient/explain/prove/reflect) to each section beat, then select section type that matches that intent.
4. **Vary section types** — a case study using only `text_media` + `insight_cards` + `stat_grid` is predictable. Use at least 6 different types across a 10-section case study.
5. **One demo per case study** — select the archetype that fits the project's core interaction problem. Always choose from `interaction-archetype-library.md`.
6. **Budget enforcement** — set `meta.max_words` honestly. If content overflows, use `disclosure: collapsed` not `density: high`.
7. **Motion spec is optional** — only override when the default `fade_up` is wrong for the section's role. Don't add `motion` blocks to every section.
