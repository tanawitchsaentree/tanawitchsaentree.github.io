import type { Metadata } from 'next'
import { TimsClient } from './TimsClient'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Forty Seconds — Tims POS Concept · Tanawitch Saentree',
  description: 'A weekend concept built from two years behind the Tim Hortons counter — redesigning the POS terminal to survive a real 5 a.m. rush.',
}

export default function TimsPage() {
  return <TimsClient />
}
