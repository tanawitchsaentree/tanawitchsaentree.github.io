import type { Metadata } from 'next'
import { AllianzGate } from '@/components/universe/AllianzGate'

export const metadata: Metadata = {
  title: 'One ward console, many hospitals · Invitrace Health · Tanawitch Saentree',
  description:
    'I led the shared design system behind a hospital ward console, so each hospital could change its theme while the shared components kept receiving fixes.',
}

export default function InvitraceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-universe="invitrace" className="min-h-svh bg-[var(--bg)] text-[var(--fg)]">
      <AllianzGate
        content="invitrace"
        heading="One ward console, many hospitals"
        intro="How each hospital changed its look while the shared components kept receiving fixes. Clickable, on sample data. Enter the shared password to view it."
        mailSubject="Invitrace case study access"
      >
        {children}
      </AllianzGate>
    </div>
  )
}
