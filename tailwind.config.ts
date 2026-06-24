import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,mdx}', './content/**/*.mdx'],
  theme: {
    extend: {
      fontFamily: {
        // Inter across the entire site (display/body/meta all one face).
        display: ['Inter Variable', 'Inter', '-apple-system', 'system-ui', 'sans-serif'],
        sans:    ['Inter Variable', 'Inter', '-apple-system', 'system-ui', 'sans-serif'],
        mono:    ['Inter Variable', 'Inter', '-apple-system', 'system-ui', 'sans-serif'],
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
