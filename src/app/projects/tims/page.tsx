import type { Metadata } from 'next'
import { TimsClient } from './TimsClient'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Tims POS Concept · Tanawitch Saentree',
  description: 'A POS concept built around the orders I took most at Tim Hortons and the changes people made at the last second.',
}

export default function TimsPage() {
  return <TimsClient />
}
