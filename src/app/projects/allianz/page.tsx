import '@fontsource/onest/400.css'
import '@fontsource/onest/500.css'
import '@fontsource/onest/600.css'
import { DocsortCase } from '@/demos/docsort/DocsortCase'

export const dynamic = 'force-static'

// Fonts are self-hosted: Onest from @fontsource here, IBM Plex Mono from @fontsource in
// the root layout. The old sub-case demos (ConfidenceGate, PromptEditor, BatchDispatch,
// Handoff) are no longer rendered.
export default function AllianzPage() {
  return <DocsortCase />
}
