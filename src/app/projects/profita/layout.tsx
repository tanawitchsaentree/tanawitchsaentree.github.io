import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profita — Wealth Management UX · Robowealth × LH Bank',
  description:
    'Designing the fund purchase flow at Robowealth for LH Bank, from trading details and payment choices to order review.',
}

export default function ProfitaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Paint html bg dark immediately — prevents white flash on View Transition enter */}
      <style>{`html { background-color: #f5f5f3 }`}</style>
      <div data-universe="profita" style={{ minHeight: '100svh' }}>
        {children}
      </div>
    </>
  )
}
