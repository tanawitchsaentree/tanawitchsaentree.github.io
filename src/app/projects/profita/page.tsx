import type { Metadata } from 'next'
import { ProfitaClient } from './ProfitaClient'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Profita · Mutual Fund App · LH Bank × Robowealth',
  description:
    'Fund browsing, trading information and purchase screens from my 2020 work on Profita at Robowealth for LH Bank.',
}

export default function ProfitaPage() {
  return <ProfitaClient />
}
