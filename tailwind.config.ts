import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}', './content/**/*.mdx'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"IBM Plex Mono"', 'monospace'],
        sans:    ['"IBM Plex Mono"', 'monospace'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
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
