import type { Metadata } from 'next'
import { AllianzGate } from '@/components/universe/AllianzGate'

export const metadata: Metadata = {
  title: 'AI Document Intelligence Suite · Allianz Technology',
  description:
    'Three interconnected systems — configuration, confidence display, and graceful fallback. Solo designer, 6 months.',
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
