import type { Metadata } from 'next'
import { P } from '@/demos/profita/tokens'

export const metadata: Metadata = {
  title: 'Profita — Wealth Management UX · Robowealth × LH Bank',
  description:
    'Designing financial confidence for users who started with anxiety. Three sub-cases: behavioral insight, data viz pivot, stakeholder negotiation.',
}

export default function ProfitaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Paint html bg dark immediately — prevents white flash on View Transition enter */}
      <style>{`html { background-color: ${P.color.navy900} }`}</style>
      <div data-universe="profita" style={{ minHeight: '100svh' }}>
        {children}
      </div>
    </>
  )
}
