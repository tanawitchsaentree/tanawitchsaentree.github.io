import type { Metadata } from 'next'
import { ProfitaClient } from './ProfitaClient'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Profita — Mutual Fund App · LH Bank × Robowealth',
  description:
    'Designing financial confidence for users who had never invested. Best App for Customer Experience — Retail Banker International Asia Trailblazer Awards 2023.',
}

export default function ProfitaPage() {
  return <ProfitaClient />
}
