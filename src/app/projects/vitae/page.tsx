import type { Metadata } from 'next'
import { VitaeClient } from './VitaeClient'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'VITAE · Fitness Dashboard · Tanawitch Saentree',
  description: 'Designing a daily view of health signals so product, clinical and engineering colleagues can review how a personal baseline and uncertainty are explained.',
}

export default function VitaePage() {
  return <VitaeClient />
}
