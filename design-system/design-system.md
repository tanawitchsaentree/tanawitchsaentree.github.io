# Portfolio Design System

This is the source of truth for all aesthetic decisions in Tanawitch's portfolio. Reference this before generating any UI, component, layout, or animation.

## Color tokens

> **Direction: paper + highlighter.** The typewriter concept reads as a clean
> typewritten page (paper white / near-black ink) marked up with a single
> highlighter (electric yellow). The yellow is reserved for marks that "ink" the
> page: text selection, the typing caret, and deliberately highlighted words —
> never for large fills. Source of truth is `src/styles/tokens.css`.

### Light mode (paper)
- Background: #FFFFFF (paper white)
- Surface (cards/panels): #F5F5F5 — `--bg-elevated`
- Surface muted: #EBEBEB — `--bg-muted`
- Text primary (ink): #0A0A0A
- Text muted: #444444
- Text subtle: #888888
- Accent (highlighter): #FFE500
- Accent on-fill text: #0A0A0A — `--accent-fg`
- Accent text (AA on white): #7A5F00 — `--accent-text`, use when yellow text needs contrast
- Hairline border: #E0E0E0

### Dark mode
- Background: #0A0A0A
- Surface: #161616 — `--bg-elevated`
- Surface muted: #1F1F1F — `--bg-muted`
- Text primary: #FFFFFF
- Text muted: #AAAAAA
- Text subtle: #666666
- Accent (highlighter): #FFE500
- Accent text (readable on dark): #FFD000 — `--accent-text`
- Hairline border: #2A2A2A

### Hard rules
- ❌ More than one accent color per page — yellow is the only mark
- ❌ Yellow as a large background fill — it's a highlighter, used on marks only
  (selection, caret, highlighted words, single inline tags)
- ❌ Cool grays (#808080-ish) — the neutral ramp is the warm-neutral ladder above
- ❌ Yellow text on white without using `--accent-text` (#7A5F00) — fails contrast
- ❌ Hardcoding hex in components — always reference the token variable
- ❌ Tailwind palette utilities (`text-red-500`, `from-black/60`, `bg-emerald-600`)
  count as hardcoded hex — they produce CSS color declarations. Status green/red is
  the most common way the one-mark rule gets broken in generated demos.

### Demo surfaces — the deliberate exception

> The site's one mark is yellow. Interactive **demos** are the one place a second
> palette may "jump out" of the mono+yellow theme — but only through tokens, never
> raw hex, and only on surfaces marked `data-demo`.

- **`--signal-ok` / `--signal-warn` / `--signal-danger`** (+ `-bg` tints) — the ONLY
  non-yellow functional signal colors. Use for pass/fail/warn state that yellow can't
  carry legibly. Pair color with a non-color cue (icon/shape) for color-blind users.
- **`--arch-medium/large/specialty/root`** — archetype palette. This is demo *data*
  (which hospital a token belongs to), not decoration. Invitrace-scoped.
- **`--preset-*`** — named config bundles in the Invitrace Atomic demo.
- Canvas 2D / WebGL paint calls (`fillStyle`, `strokeStyle`, gradient stops) are
  exempt — they are pixel ops, not CSS. Keep their hex values aligned to the tokens
  above for visual consistency.
- Alpha tints: use `color-mix(in srgb, var(--token) N%, transparent)`, never `${hex}NN`
  string concatenation (breaks the moment the color is a CSS var).

## Typography

> **Direction: Bold geometric sans.** The portfolio shell is set in one face — League
> Spartan. Hierarchy comes from **size, weight, and case**. Each project keeps its own
> typeface identity (Bricolage Grotesque for Tims, Space Mono for Tims KDS, etc.) —
> the shell is the neutral canvas, the projects are individual.

### Portfolio shell typeface
- Font: **League Spartan** (weights 400 / 500 / 600 / 700 / 800)
- Fallback: `sans-serif`
- Used for: nav, home grid, eyebrows, body copy, meta — everything in the shell

### Project typefaces (individual, scoped to their demo surface)
- **Tims**: Bricolage Grotesque (display) + DM Sans (body) + Space Mono (mono/KDS)
- **Invitrace**: Bricolage Grotesque + DM Sans + Space Mono (in standalone HTML)
- **Vitae / others**: their own scoped tokens — never bleed into the shell

### Display (headings, hero, thesis) — shell
- Weight: 700–800 for hero, 600 for sub-headings
- Letter-spacing: -0.03em hero, -0.02em sub-headings
- Line-height: 1.0 hero, 1.1 sub-headings
- Sizes (token-driven — see `tokens.css`):
  - Hero display: clamp(2rem, 5.5vw, 4.5rem)
  - Sub-case thesis: clamp(1.5rem, 4vw, 3rem)
  - Principle name: clamp(1.375rem, 3vw, 2.5rem)

### Body (paragraphs, button labels, eyebrows) — shell
- Weight: 400 body, 500 for emphasis
- Letter-spacing: 0 body, 0.08em eyebrow/meta (uppercase)
- Line-height: 1.6 body, 1.2 eyebrow
- Sizes:
  - Body: 17px desktop / 16px mobile
  - Button label: 14px uppercase, letter-spacing 0.1em
  - Eyebrow: 12px uppercase, letter-spacing 0.1–0.15em
  - Footer/meta: 11–12px

### Hard rules
- ❌ Inter, Geist, Geist Mono, system-ui in the shell — default AI feel
- ❌ JetBrains Mono in the shell — was the old direction, now project-only
- ❌ A second typeface in the shell — League Spartan only; hierarchy = size/weight/case
- ❌ Text smaller than 16px outside of meta/eyebrow
- ❌ More than 3 typographic hierarchies in a single column
- ❌ Tracking tighter than -0.03em (cramps Spartan's geometric forms)

## Spacing

Scale: 4, 8, 16, 24, 40, 64, 96, 128, 192, 256 (px)

Section vertical rhythm:
- Sub-section gap: 64px mobile / 96px desktop
- Major section gap: 128px mobile / 192px desktop
- Hero padding-top: 96px mobile / 128px desktop

Reading column max-width: 56ch (never wider for prose)

## Animation curves

### Easing
- Smooth-in-out: `cubic-bezier(0.65, 0, 0.35, 1)` — default
- Decisive: `cubic-bezier(0.16, 1, 0.3, 1)` — entrance reveals
- Gentle: `cubic-bezier(0.22, 1, 0.36, 1)` — text reveals
- Snap: `cubic-bezier(0.34, 1.56, 0.64, 1)` — overshoot moments

### Hard rules
- ❌ `ease`, `linear`, `ease-in`, `ease-out` — never (default AI feel)
- ❌ `transition-property: all` — always specify exact properties
- ❌ Duration > 1.2s on any single transition (feels slow)
- ❌ Duration < 0.15s on UI feedback (feels jarring)

## Layout rules

- Asymmetric per sub-case section — alternate which side the eye lands
- Full-bleed for hero interactive demos (no max-width container)
- 12-column grid only when content actually fits it (not as default)
- One specific moment per section that breaks the grid deliberately

## Reference Gold Standards

- Studio Freight portfolio — Lenis smooth scroll, asymmetric type weight
- Noomo Vibrant — letter spacing extremes, idle hover animations
- Linear.app — precision, restraint, intentional negative space

## What "Awwwards-tier" means in this project

A visitor scrolls through and at least one moment makes them pause and look closer. Not because of an effect, but because the choice was specific — a font weight pairing they haven't seen, a transition curve with personality, a layout asymmetry that feels intentional.

If everything is "well executed" but no moment surprises, it's not Awwwards-tier — it's portfolio template.
