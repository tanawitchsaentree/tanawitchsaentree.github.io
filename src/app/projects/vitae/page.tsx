import type { Metadata } from 'next'
import { VitaeClient } from './VitaeClient'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'VITAE — Fitness Dashboard · Tanawitch Saentree',
  description: 'A glanceable health dashboard built through a six-stage design loop, capped at three iterations before ship.',
}

export default function VitaePage() {
  return <VitaeClient />
}
