import type { Metadata } from 'next'
import { InvitraceGate } from '@/components/invitrace/InvitraceGate'

export const metadata: Metadata = {
  title: 'Variant Tree · Federated Design System · Invitrace Health',
  description:
    'I led a shared design system so designers and engineers could adapt a clinical interface using hospital themes and reusable components.',
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
