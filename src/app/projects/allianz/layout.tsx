import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sorting the post at an insurer · Allianz Technology · Tanawitch Saentree',
  description:
    "Each office files insurance documents its own way. I designed the tool where a team builds its filing system, turns it into the AI's prompt and tests it before it goes live.",
}

export default function AllianzLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-universe="allianz"
      className="min-h-svh bg-[var(--bg)] text-[var(--fg)]"
    >
      {children}
    </div>
  )
}
