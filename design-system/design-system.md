# Portfolio Design System

This is the source of truth for all aesthetic decisions in Tanawitch's portfolio. Reference this before generating any UI, component, layout, or animation.

## Color tokens

> **Direction: document + signal.** The concept reads as a typewritten page
> that lives after dark — warm ink background, dim/faint neutral prose tones,
> and a single amber signal mark. The amber is reserved for marks that matter:
> the toggle cursor, hover/active state, and deliberately signaled words —
> never for large fills. Source of truth is `src/styles/tokens.css`.

### Theme (warm ink — the only mode)
- Background: #111417 (ink)
- Surface (cards/panels): #1B1E22 — `--bg-elevated`
- Surface muted: #24272B — `--bg-muted`
- Text primary: #E4E1D9
- Text muted: #9B978E
- Text subtle: #847F76
- Accent (signal): #E0A458
- Accent on-fill text: #111417 — `--accent-fg`
- Accent text (AA on ink): #E0A458 — `--accent-text`
- Hairline border: #2A2C30

### Hard rules
- ❌ More than one accent color per page — amber is the only mark
- ❌ Amber as a large background fill — it's a signal, used on marks only
  (toggle cursor, hover state, single inline tags)
- ❌ Cool grays (#808080-ish) — the neutral ramp is the warm-neutral ladder above
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

> **Direction: one monospace document.** The portfolio shell is set in one face —
> JetBrains Mono Variable. Hierarchy comes from **size, weight, and case** — the
> same principle as before, just on a mono grid instead of a geometric sans. Each
> project keeps its own typeface identity (Bricolage Grotesque for Tims, Space Mono
> for Tims KDS, etc.) — the shell is the neutral canvas, the projects are individual.

### Portfolio shell typeface
- Font: **JetBrains Mono Variable** (weights 400 / 500, italic 400)
- Fallback: `monospace`
- Used for: nav, home document, eyebrows, body copy, meta — everything in the shell

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
- ❌ League Spartan in the shell — was the old direction, now retired
- ❌ A second typeface in the shell — JetBrains Mono Variable only; hierarchy = size/weight/case
- ❌ Text smaller than 16px outside of meta/eyebrow
- ❌ More than 3 typographic hierarchies in a single column
- ❌ Tracking tighter than -0.03em

## Spacing

Scale: 4, 8, 16, 24, 40, 64, 96, 128, 192, 256 (px)

Section vertical rhythm:
- Sub-section gap: 64px mobile / 96px desktop
- Major section gap: 128px mobile / 192px desktop
- Hero padding-top: 96px mobile / 128px desktop

Reading column max-width: 56ch (never wider for prose elements —
paragraphs and body copy specifically, not outer page/section containers,
which may run wider to hold non-prose content like tabular work rows)

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
