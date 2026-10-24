import '@fontsource/atkinson-hyperlegible-next/400.css'
import '@fontsource/atkinson-hyperlegible-next/500.css'
import '@fontsource/atkinson-hyperlegible-next/600.css'
import '@fontsource/atkinson-hyperlegible-mono/400.css'
import '@fontsource/atkinson-hyperlegible-mono/600.css'
import { DocsortCase } from '@/demos/docsort/DocsortCase'

export const dynamic = 'force-static'

// Fonts are self-hosted from @fontsource. Only the faces in use are fetched: 400 for body
// and mono, 500/600 when a heading or label first needs them.
export default function AllianzPage() {
  return <DocsortCase />
}
