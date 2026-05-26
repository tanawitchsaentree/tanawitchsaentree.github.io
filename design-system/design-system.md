# Portfolio Design System

This is the source of truth for all aesthetic decisions in Tanawitch's portfolio. Reference this before generating any UI, component, layout, or animation.

## Color tokens

### Light mode
- Background: #F4F1EA (warm cream)
- Surface (cards/panels): #EBE6DB
- Text primary: #1A1714
- Text muted: #6B6358
- Accent: #C4421C (deep ochre red)
- Hairline border: #D4CFC2

### Dark mode
- Background: #1A1714
- Surface: #252119
- Text primary: #F4F1EA
- Text muted: #8A8275
- Accent: #E6804A (warm coral)
- Hairline border: #3A3530

### Hard rules
- ❌ Pure white (#FFF) or pure black (#000) — never
- ❌ Cool grays (#808080-ish) — never
- ❌ Bright yellow (#FFE500 or similar) — replaced by ochre accent
- ❌ More than one accent color per page

## Typography

### Display (headings, hero, thesis)
- Font: PP Editorial New Ultralight (200)
- Fallback: Cormorant Garamond 300, Fraunces 200
- Letter-spacing: -0.02em
- Line-height: 1.05 for hero, 1.1 for sub-headings
- Sizes:
  - Hero display: clamp(64px, 10vw, 140px)
  - Sub-case thesis: clamp(48px, 7vw, 96px)
  - Principle name: clamp(32px, 4vw, 56px)

### Body (paragraphs, button labels, eyebrows)
- Font: PP Neue Montreal (regular 400)
- Fallback: JetBrains Mono, Söhne Mono
- Line-height: 1.55 body, 1.2 eyebrow
- Sizes:
  - Body: 19px desktop / 17px mobile
  - Button label: 14px uppercase, letter-spacing 0.05em
  - Eyebrow: 12px uppercase, letter-spacing 0.15em
  - Footer/meta: 11px

### Hard rules
- ❌ Inter, Geist, Geist Mono, system-ui — never (default AI feel)
- ❌ Text smaller than 16px outside of meta/eyebrow
- ❌ More than 3 typographic hierarchies in a single column
- ❌ Sans-serif for display headings (must be serif)

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
