import type { Metadata } from 'next'
// Inter is the single typeface across the site (display + body + meta).
import '@fontsource-variable/inter'
import '../styles/globals.css'
import { LenisProvider } from '@/components/providers/LenisProvider'
import { CustomCursor } from '@/components/ui/CustomCursor'

const SITE_TITLE = 'Tanawitch Saentree — Senior Product Designer'
const SITE_DESC =
  'Designing AI document tools, internal platforms, and operator-facing systems. 7 years across Allianz Technology, Invitrace Health, Stellareat, and Robowealth.'

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESC,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESC,
    url: 'https://tanawitchsaentree.github.io',
    siteName: 'Tanawitch Saentree',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESC,
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[var(--bg)] text-[var(--fg)]">
        <LenisProvider>
          {children}
        </LenisProvider>
        <CustomCursor />
      </body>
    </html>
  )
}
