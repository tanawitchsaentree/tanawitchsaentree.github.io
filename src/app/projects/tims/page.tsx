import type { Metadata } from 'next'
import { TimsClient } from './TimsClient'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Forty Seconds: Tims POS Concept · Tanawitch Saentree',
  description: 'A personal POS concept based on two years working at Tim Hortons, with presets and custom orders to try against remembered counter situations.',
}

export default function TimsPage() {
  return <TimsClient />
}
