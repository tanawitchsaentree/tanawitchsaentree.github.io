import type { Metadata } from 'next'
import '@fontsource-variable/bricolage-grotesque'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Tanawitch Saentree — Product Designer, Enterprise AI & Systems',
  description:
    'Designing AI document tools, internal platforms, and operator-facing systems. 8 years across Allianz Technology, Invitrace, and DoctorAnywhere.',
  openGraph: {
    title: 'Tanawitch Saentree — Senior Product Designer',
    description:
      'I design for the person who didn\'t choose the software but has to use it every day. That\'s where the world gets better.',
    url: 'https://tanawitchsaentree.github.io',
    siteName: 'Tanawitch Saentree',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tanawitch Saentree — Senior Product Designer',
    description:
      'I design for the person who didn\'t choose the software but has to use it every day. That\'s where the world gets better.',
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
      <body className="bg-[var(--bg)] text-[var(--fg)]">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
