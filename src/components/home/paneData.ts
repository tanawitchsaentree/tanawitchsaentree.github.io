// Pane row data. Kept out of src/data/home.ts so nothing here reaches the production bundle.
// To publish, follow the note above PaneRow in HomeClient.tsx.

// Counted from the Pane repo on 2026-10-28 (component folders, token source files). Refresh them
// before publishing. Contrast run totals are left out of the copy on purpose: readers don't use them.
export const PANE_STATS = {
  components: 26,
  tokens: 489,
  version: '0.3.0',
} as const

export const PANE_PROJECT = {
  title: 'Pane',
  tag: 'Design system',
  description: "A glass-style design system for React that keeps text readable on top of real photos. It's the first system I built with Kiln, my design-system plugin for Claude Code.",
  details: 'Inside the project',
  docsUrl: 'https://pane-design-system.pages.dev',
  repoUrl: 'https://github.com/tanawitchsaentree/pane-design-system',
  kilnUrl: 'https://github.com/tanawitchsaentree/Kiln',
} as const
