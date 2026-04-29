import type { Metadata } from 'next'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/inter'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Tanawitch Saentree — Senior Product Designer',
  description:
    '8 years designing systems that survive contact with engineering. Senior Product Designer specialising in AI tooling and enterprise design systems.',
  openGraph: {
    title: 'Tanawitch Saentree — Senior Product Designer',
    description:
      '8 years designing systems that survive contact with engineering.',
    url: 'https://tanawitchsaentree.github.io',
    siteName: 'Tanawitch Saentree',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tanawitch Saentree — Senior Product Designer',
    description:
      '8 years designing systems that survive contact with engineering.',
  },
  robots: { index: true, follow: true },
}

// Inlined theme-init script — runs before first paint to prevent FOUC.
// Reads localStorage 'theme', falls back to prefers-color-scheme.
const themeInitScript = `
(function(){
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch(e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
