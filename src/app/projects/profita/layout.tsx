import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profita — Wealth Management UX · Robowealth × LH Bank',
  description:
    'Designing financial confidence for users who started with anxiety. Three sub-cases: behavioral insight, data viz pivot, stakeholder negotiation.',
}

export default function ProfitaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-universe="profita"
      className="min-h-svh bg-[var(--bg)] text-[var(--fg)]"
    >
      {children}
    </div>
  )
}
