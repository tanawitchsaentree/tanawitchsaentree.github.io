# Project Modal — UI Schema Reference

Each section is `{ id, label?, type, data }`.
`label` appears in the left sidebar nav. Omit for sections without nav entry.

---

## Currently Implemented

### `hero`
Stats sidebar + headline + body. Use as first section for Allianz-style projects.
```json
{ "headline": "", "body": "", "image": null,
  "stats": [{ "label": "", "value": "" }] }
```

### `statement`
Eyebrow + headline + long body. Good for problem framing or impact summary.
⚠️ Do NOT include `image: null` — it renders a placeholder unconditionally.
```json
{ "eyebrow": "", "headline": "", "body": "" }
```

### `text_media`
Split layout: text left or right, placeholder right or left.
```json
{ "layout": "text_left|text_right", "eyebrow": "", "headline": "", "body": "",
  "highlights": [] }
```

### `decisions`
Numbered list of design decisions. Best for 2–4 items with explanation.
```json
{ "eyebrow": "", "headline": "",
  "items": [{ "number": "01", "title": "", "description": "" }] }
```

### `quote`
Large centered quote with blur-clear animation. Use for HMW or user insight.
```json
{ "text": "", "attribution": "" }
```

### `affinity_map`
Accordion clusters. Best for research synthesis (3–6 clusters).
```json
{ "title": "", "clusters": [{ "category": "", "items": [] }] }
```

### `personas`
Tab-switched persona cards. Each persona needs consistent fields.
```json
{ "title": "", "items": [{
  "name": "", "type": "", "biography": "", "goal": "",
  "needs": "", "frustrations": "", "why_use": ""
}]}
```

### `user_flow`
Node graph with animated arrows. Best for linear flows (8–14 steps).
```json
{ "title": "", "description": "", "steps": [] }
```

### `word_reveal`
Scroll-driven word-by-word text fill. **Always use as final section.**
```json
{ "eyebrow": "Takeaway", "text": "" }
```

### `cover` *(Profita-specific)*
Parallax hero 82vh with gold accent. Only use for Profita.

### `project_overview` *(Profita-specific)*
Two-pane card with My Role / Client / Year / Award. Only use for Profita.

### `intro_statement` *(Profita-specific)*
Dark full-bleed with gold title. Only use for Profita.

### `design_brief` *(Profita-specific)*
Q-card grid. Only use for Profita.

### `research_method` *(Profita-specific)*
Method cards with icon. Only use for Profita.

### `challenges` *(Profita-specific)*
Dark background alternating columns with gold dots. Only use for Profita.

### `feature_matrix` *(Profita-specific)*
Tab-based feature comparison by persona. Only use for Profita.

### `wireframes` *(placeholder only)*
### `mockup_showcase` *(placeholder only)*
### `visual_design` *(Profita-specific)*

### `stat_grid`
2–4 large metrics in a row. Values rendered in `cover_color` accent. Use after research sections.
```json
{ "eyebrow": "", "stats": [{ "value": "85%", "label": "", "context": "" }] }
```

### `big_number`
Single dramatic metric, full-bleed muted background, value in `cover_color`. Use when one number tells the story.
```json
{ "eyebrow": "", "value": "", "unit": "", "label": "", "body": "" }
```

### `before_after`
Two-column contrast. Before: muted/gray. After: white cards with `cover_color` left border + → arrow.
```json
{ "eyebrow": "", "before": { "label": "", "items": [] }, "after": { "label": "", "items": [] } }
```

### `insight_cards`
2–3 cards with emoji icon (in accent-tinted bg), headline, body. Use for research findings or key observations.
```json
{ "eyebrow": "", "items": [{ "icon": "👁", "headline": "", "body": "" }] }
```

---

### `pull_quote`
Single user quote, very large, dramatic. More impactful than `quote`.
```json
{ "text": "", "attribution": "", "context": "" }
```

### `process_steps`
Vertical numbered steps with connector line. Use for process/workflow.
```json
{ "eyebrow": "", "title": "", "steps": [{ "number": "", "title": "", "body": "" }] }
```

### `timeline`
Chronological milestones. Use for project history or iteration log.
```json
{ "eyebrow": "", "items": [{ "date": "", "event": "", "detail": "" }] }
```

### `comparison_table`
A vs B table. Use for option evaluation or before/after metrics.
```json
{ "eyebrow": "", "cols": ["", ""], "rows": [{ "label": "", "values": ["", ""] }] }
```

### `image_grid`
2–3 images with captions. Replaces wireframes/mockup_showcase when real assets exist.
```json
{ "title": "", "images": [{ "src": "", "caption": "", "aspect": "16/9" }] }
```

### `scrolling_cards`
Horizontal scroll of feature cards (Apple-style).
```json
{ "eyebrow": "", "title": "", "items": [{ "title": "", "body": "", "tag": "" }] }
```

### `fullbleed_image`
Full-width image with optional text overlay.
```json
{ "src": "", "caption": "", "overlay_text": "" }
```

### `highlight_text`
Paragraph with scroll-driven word highlights (specific words, not all).
```json
{ "eyebrow": "", "body": "", "highlights": ["word1", "word2"] }
```

---

## Pipeline Gates

### Layer 0 — Project Brief (before writing anything)
- What was the constraint?
- Who is the case study audience?
- What does success look like?

### Layer 2.5 — Resolution Check (must pass before Layer 3)
- [ ] Has Impact or Outcome section
- [ ] No consecutive sections with same `type`
- [ ] No sections with empty `images: []` unless real assets incoming
- [ ] Reader can answer: "Did this project work?"

---

## Rules for Interaction Designer

1. No two consecutive sections should use the same `type`
2. Dark full-bleed sections (`challenges`, `intro_statement`) need a light section before and after
3. Every project ends with `word_reveal`
4. `quote` / `pull_quote` should appear at most once per project
5. Showcase sections (`image_grid`, `mockup_showcase`) need real assets before publishing
6. `decisions` is the strongest type for design rationale — don't dilute with `text_media` if decisions exist
7. `stat_grid` or `big_number` should appear if project has quantitative outcomes
