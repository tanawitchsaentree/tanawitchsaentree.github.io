export default function ClaimsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-[var(--bg)] text-[var(--fg)]">
      {children}
    </div>
  )
}
