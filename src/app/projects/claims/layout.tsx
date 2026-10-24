import { AllianzGate } from '@/components/universe/AllianzGate'

export default function ClaimsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-[var(--bg)] text-[var(--fg)]">
      <AllianzGate
        content="claims"
        heading="Claims handling prototype"
        intro="Follow one damaged shipment through a claims system, on sample data. Enter the shared password to view it."
        mailSubject="Claims case study access"
      >
        {children}
      </AllianzGate>
    </div>
  )
}
