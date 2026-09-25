import type { Metadata } from 'next'
import { AllianzGate } from '@/components/universe/AllianzGate'

export const metadata: Metadata = {
  title: 'AI Document Intelligence Suite · Allianz Technology',
  description:
    'Designing document classification, human review and fallback workflows at Allianz Technology. Senior Designer and sole designer on the project.',
}

export default function AllianzLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-universe="allianz"
      className="min-h-svh bg-[var(--bg)] text-[var(--fg)]"
    >
      <AllianzGate>
        {children}
      </AllianzGate>
    </div>
  )
}
