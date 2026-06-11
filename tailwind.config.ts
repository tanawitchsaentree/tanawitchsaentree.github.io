import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,mdx}', './content/**/*.mdx'],
  theme: {
    extend: {
      fontFamily: {
        // Typewriter direction — one monospace face across the entire site.
        display: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans:    ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-muted': 'var(--bg-muted)',
        fg: 'var(--fg)',
        'fg-muted': 'var(--fg-muted)',
        'fg-subtle': 'var(--fg-subtle)',
        border: 'var(--border)',
      },
      maxWidth: {
        reading: '65ch',
        content: '1280px',
      },
    },
  },
  plugins: [],
}

export default config
