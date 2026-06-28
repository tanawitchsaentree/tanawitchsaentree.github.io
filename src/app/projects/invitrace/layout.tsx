import type { Metadata } from 'next'
import { InvitraceGate } from '@/components/invitrace/InvitraceGate'

export const metadata: Metadata = {
  title: 'Variant Tree — Federated Design System · Invitrace Health',
  description:
    'One component engine. Three hospital archetypes. How I built a design system that adapts to every hospital without rebuilding for each one.',
}

export default function InvitraceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-universe="invitrace"
      className="h-dvh overflow-hidden bg-[var(--bg)] text-[var(--fg)]"
    >
      <InvitraceGate>
        {children}
      </InvitraceGate>
    </div>
  )
}
