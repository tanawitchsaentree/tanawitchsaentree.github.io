import type { Metadata } from 'next'
import { VitaeClient } from './VitaeClient'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'VITAE · Fitness Dashboard · Tanawitch Saentree',
  description: 'How I redesigned the Vitae health score to compare each day with the person\'s own last 14 days.',
}

export default function VitaePage() {
  return <VitaeClient />
}
