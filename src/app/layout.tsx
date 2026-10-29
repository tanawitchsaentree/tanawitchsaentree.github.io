import type { Metadata } from 'next'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/400-italic.css'
import '../styles/globals.css'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { Analytics } from '@/components/analytics/Analytics'

const SITE_TITLE = 'Tanawitch Saentree — Senior Product Designer'
const SITE_DESC =
  'Senior Product Designer working across insurance, banking and healthcare. Selected work in AI document workflows, hospital design systems and investment products.'

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
        {children}
        <CustomCursor />
        <Analytics />
        {/* GoatCounter: no cookies, so no consent banner. It reads ?ref=<company> on application links as the source. */}
        <script data-goatcounter="https://tanawitchsaentree.goatcounter.com/count" async src="https://gc.zgo.at/count.js" />
      </body>
    </html>
  )
}
