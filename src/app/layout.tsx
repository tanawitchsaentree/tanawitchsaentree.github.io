import type { Metadata } from 'next'
// Inter is the single typeface across the site (display + body + meta).
import '@fontsource-variable/inter'
import '../styles/globals.css'
import { LenisProvider } from '@/components/providers/LenisProvider'
import { CustomCursor } from '@/components/ui/CustomCursor'

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
    // Default to LIGHT (paper) — only honour an explicit user choice for dark.
    var stored = localStorage.getItem('theme');
    if (stored === 'dark') document.documentElement.classList.add('dark');
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
        <LenisProvider>
          {children}
        </LenisProvider>
        <CustomCursor />
      </body>
    </html>
  )
}
