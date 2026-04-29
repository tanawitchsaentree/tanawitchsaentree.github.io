import type { Metadata } from 'next'
import { AllianzGate } from '@/components/universe/AllianzGate'

export const metadata: Metadata = {
  title: 'IDAS — AI Document Intelligence Suite · Allianz Technology',
  description:
    'Three interconnected systems inside IDAS — configuration, confidence display, and graceful fallback. Solo designer, 6 months.',
}

export default function AllianzLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-universe="allianz"
      className="min-h-svh"
      style={{
        backgroundColor: 'var(--universe-bg)',
        color: 'var(--universe-fg)',
      }}
    >
      <AllianzGate>
        {children}
      </AllianzGate>
    </div>
  )
}
