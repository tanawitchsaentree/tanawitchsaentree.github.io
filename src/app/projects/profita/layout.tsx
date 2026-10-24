import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profita · Fund Purchase Flow · Robowealth × LH Bank',
  description:
    'How the Profita fund purchase flow shows when an order really happens, before and after the cutoff.',
}

export default function ProfitaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Paint the html background before hydration so the view transition doesn't flash. */}
      <style>{`html { background-color: #f5f5f3 }`}</style>
      <div data-universe="profita" style={{ minHeight: '100svh' }}>
        {children}
      </div>
    </>
  )
}
