'use client'

// Atkinson Hyperlegible, the Braille Institute's typeface for low-vision readers: one family for
// every level of the page, hierarchy by weight, size and spacing.
import '@fontsource/atkinson-hyperlegible-next/400.css'
import '@fontsource/atkinson-hyperlegible-next/600.css'
import '@fontsource/atkinson-hyperlegible-next/700.css'
import '@fontsource/atkinson-hyperlegible-mono/400.css'
import Link from 'next/link'
import { Story } from './Story'
import { useInvitrace } from './useInvitrace'
import s from './invitrace.module.css'

// Invitrace case study, told from the clinic's side: "A clinic asks for its own look". Every
// control writes a log entry and answers land in one `tried` map, read by the hero and the
// theme file at the end. Nothing changes on scroll; motion is transform and clip-path only.
export function InvitraceCase() {
  const st = useInvitrace()
  const latest = st.log[0]
  return (
    <main data-demo="invitrace" className={s.page}>
      <div className={s.shell}>
        <div className={s.top}><Link href="/" className={s.back}>← Portfolio</Link></div>
        {/* The one polite live region: the newest log entry, in plain words. */}
        <div className={s.srOnly} aria-live="polite">{latest ? `Entry ${latest.n}. ${latest.did} ${latest.blocked ? 'Blocked.' : ''} ${latest.why}` : ''}</div>
        <Story st={st} />
        <div className={s.tail}><Link href="/" className={s.back}>← Back to selected work</Link></div>
      </div>
    </main>
  )
}
