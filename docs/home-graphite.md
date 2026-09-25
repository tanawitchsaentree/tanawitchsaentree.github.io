# Homepage: graphite relief

## Design plan

Palette uses the existing warm-ink tokens: ink `--bg` (#111417), muted surface
`--bg-muted` (#24272B), primary `--fg` (#E4E1D9), secondary `--fg-muted` (#9B978E),
and signal `--accent-text` (#E0A458). Amber remains confined to active marks.
IBM Plex Mono: 17px desktop / 16px mobile body, medium-weight name,
12–14px metadata. One reading column with a fixed intro anchor, spaced sections,
and a Manabi feature in document flow.

Signature: a fixed, shallow graphite relief at the screen edges. A grazing light
moves slowly; there are no particles, animated geometry, bloom, or cursor ripples.

## Components and tokens

`GraphiteBackground` dynamically imports Three.js and draws one full-screen plane
with a procedural surface-normal shader. Shader colors resolve CSS tokens. The
reading region is masked quiet. Rendering is capped at 30fps and DPR 1.5; hidden
tabs suspend. Coarse pointers and reduced motion render a still frame. A pause
control stops the light. WebGL failure/context loss retains a CSS fallback.
Geometry, material, renderer, observers, and listeners are disposed on unmount.

`HomeDocument.module.css` scopes `--home-width` (76ch), `--home-prose` (48ch),
`--home-year` (8ch, 7ch on small screens), `--home-thumb` (6rem / 4rem),
`--home-top`, `--home-inset`, `--home-section`, and `--home-leading` to the page.
These compose the existing spacing, type, color, and motion tokens.

Work rows keep outcomes visible, wrap rather than truncate, and use two columns
on narrow screens. Collapsed content is inert and hidden. Contact links wrap.
The Manabi card is inline rather than viewport-fixed, so it cannot obscure content.

The current single warm-ink theme is authoritative per
`design-system/design-system.md`; the older README's three-theme rules are stale.

## Audit — 2026-09-24

Source review completed (self-review, not a separate design-auditor agent):
- Palette: existing warm-ink tokens; no new accent hue or large amber fill.
- Type: 17px desktop / 16px mobile body; smaller text restricted to metadata.
- Rhythm: 24px intro gap, 40px section gap, 64px separation before Manabi.
- Responsive rules: work changes to two columns at 760px; kit and Manabi stack
  at 480px. No ellipsis or nowrap on work outcomes. Email can wrap at narrow widths.
- Overlay: Manabi is in flow and remains mounted while its dialog opens, preserving
  layout and the trigger element for focus restoration.
- Accessibility: collapsed work is inert; motion can be paused; native cursor is
  retained for reduced-motion users. Background is decorative and ignores pointers.
- Resource lifecycle: dynamic import cancellation and GPU/listener cleanup reviewed.

Validation:
- `npm run type-check`: passed.
- `npm run lint`: passed with existing warnings in untouched PortalNav, Profita,
  and Stellar files; no warnings in the changed components.
- `npm run build`: passed; all 11 static pages generated.
- `git diff --check`: passed.

Visual audit: PENDING. The browser's security check could not verify the
admin-enforced policy and denied local preview access. No screenshots or actual
viewport/interaction tests were obtained. Desktop/mobile spacing, shader rendering,
light intensity, keyboard interaction, and reduced-motion behavior still need
browser verification. Source review and a successful build do not establish those
visual/runtime results.


## Typography revision — user review, 2026-09-24

The user found mono unattractive and the text too large on Mac. Homepage and
Manabi dialog now use native system sans (San Francisco on macOS). Main text is
15px instead of 17px desktop / 16px mobile; feature and modal copy use 14px.
The visible name and modal headings inherit this sans family rather than the
global mono heading rule. Buttons inherit their surface's family. Body weight is
400, name 500, and line-height 1.7. Desktop column is 42rem with 29rem prose;
date/kit columns use rem rather than mono-dependent ch measures. Date numerals
remain tabular. This revision supersedes the initial typography plan above.
Visual verification remains pending due to the previously reported browser block.
