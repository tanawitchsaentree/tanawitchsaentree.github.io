import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}', './content/**/*.mdx'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"JetBrains Mono Variable"', 'monospace'],
        sans:    ['"JetBrains Mono Variable"', 'monospace'],
        mono:    ['"JetBrains Mono Variable"', 'monospace'],
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
