import 'dial-react/all.css'
import type { Metadata } from 'next'
import { InvitraceNext } from '@/demos/invitrace/next/InvitraceNext'

export const dynamic = 'force-static'

// Preview of the Invitrace case study rebuilt on dial. Kept out of search until it replaces /projects/invitrace/.
export const metadata: Metadata = { title: 'A clinic asks for its own look · Invitrace · Tanawitch Saentree', robots: { index: false, follow: false } }

export default function InvitraceNextPage() {
  return <InvitraceNext />
}
