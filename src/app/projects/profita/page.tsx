import type { Metadata } from 'next'
import { ProfitaClient } from './ProfitaClient'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Profita · Mutual Fund App · LH Bank × Robowealth',
  description:
    'How the Profita fund purchase flow shows when an order really happens, before and after the cutoff.',
}

export default function ProfitaPage() {
  return <ProfitaClient />
}
