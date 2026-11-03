// Row data for this entry. Figures were read from the repo on the date noted below; refresh them when it ships a new version.

// Reported by the Pane session on 2026-11-01: components from `ls packages/react/src/components | wc -l`, tokens from the first line of `node packages/tokens/build.mjs`. Refresh them
// before publishing. Contrast run totals are left out of the copy on purpose: readers don't use them.
export const PANE_STATS = {
  components: 126,
  tokens: 1626,
  version: '0.7.0',
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
