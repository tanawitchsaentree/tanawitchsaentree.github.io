# Tanawitch Portfolio — Claude Code Instructions

## Workflow for any UI, component, page, or section

1. Read `design-system/design-system.md` BEFORE writing any code
2. Plan before building: write a short token plan (4-6 named hex values, 2+ type
   roles, a one-sentence layout concept, and the single "signature element" this
   piece should be remembered by). Check the plan against generic AI defaults —
   cream+terracotta serif, near-black+acid-green, broadsheet hairline layouts —
   and against the site's own paper+highlighter direction. Revise anything that
   reads as templated before writing code.
3. Build the work. Spend boldness on the signature element only; keep everything
   else quiet and disciplined.
4. Run the `design-auditor` subagent on the output
5. If audit FAILS → fix issues → re-audit
6. If audit PASSES → submit to Tanawitch with audit report attached

Never submit UI work without an audit report.

Reference: `.agents/skills/frontend-design/SKILL.md` for the full plan/critique
process and copy-writing principles (active voice, name things by what the user
controls, no double-duty elements).

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
