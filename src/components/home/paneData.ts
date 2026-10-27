// Pane row data. Kept out of src/data/home.ts so nothing here reaches the production bundle.
// To publish, follow the note above PaneRow in HomeClient.tsx.

// Pane's figures, copied from its own verify output (apps/docs/dist/gates.json and the docs
// overview, 2026-10-27). Refresh from the next verify run before publishing.
export const PANE_STATS = {
  checks: '144,564',
  passed: '144,433',
  excepted: '131',
  components: 15,
  tokens: 413,
} as const

export const PANE_PROJECT = {
  title: 'Pane',
  tag: 'Design system',
  description: "A glass design system for the web, with clear panes over real photos that still meet WCAG contrast. I'm building it with Kiln, my design-system skill.",
  details: 'Inside the project',
  kilnUrl: 'https://github.com/tanawitchsaentree/Kiln',
} as const
