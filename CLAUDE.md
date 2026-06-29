# Tanawitch Portfolio — Claude Code Instructions

## Workflow for any UI, component, page, or section

1. Read `design-system/design-system.md` BEFORE writing any code
2. Build the work
3. Run the `design-auditor` subagent on the output
4. If audit FAILS → fix issues → re-audit
5. If audit PASSES → submit to Tanawitch with audit report attached

Never submit UI work without an audit report.

## Always-loaded references

@design-system/design-system.md

## Slash commands available

- `/aesthetic-rubric` — run self-check against hard design rules
- `/voice-guide` — check copy against voice rules

## Subagents available

- `design-auditor` — adversarial design review before delivery

## Stack

- Next.js 14 App Router, static export (`output: 'export'`)
- Tailwind CSS + CSS custom properties (tokens in `src/styles/tokens.css`)
- Framer Motion for animation
- Demo components live in `src/demos/{project}/` — never inline in page files
- `src/components/allianz/SubCaseInteractive.tsx` is a thin router only

## Hard constraints

- Portfolio shell font: **League Spartan** only — never Inter, Geist, JetBrains Mono, system-ui
- Project demos keep their own fonts (Bricolage Grotesque, Space Mono, etc.) scoped to their surface
- Never hardcode #000 or #FFF — use token variables
- Never use `ease` or `linear` as animation easing
- Demo logic goes in `src/demos/` — page files stay thin

## Design system

Interactive style guide: `design-system/index.html`
Full spec: `design-system/design-system.md`
