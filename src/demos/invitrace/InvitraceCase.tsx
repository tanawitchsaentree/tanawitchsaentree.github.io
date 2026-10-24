'use client'

import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/dm-sans'
import '@fontsource/space-mono/400.css'
import '@fontsource/space-mono/700.css'
import Link from 'next/link'
import { ChangeLog } from './ChangeLog'
import { Console } from './Console'
import { HERO, SECTIONS } from './data'
import { Decisions, Edges, Failed, Governance, LogSection, Onboarding, Problem, Rot, Slots, Tiers, Views } from './Sections'
import { useInvitrace } from './useInvitrace'
import s from './invitrace.module.css'

// Invitrace case study. One sticky ward console with a persistent change log beside it; every
// control on the page writes a log entry. No scroll listeners, no per-frame state; motion is
// transform and clip-path in CSS, off under reduced motion.
export function InvitraceCase() {
  const st = useInvitrace()
  const latest = st.log[0]
  return (
    <main data-demo="invitrace" className={s.page}>
      <div className={s.shell}>
        <div className={s.top}><Link href="/" className={s.back}>← Portfolio</Link></div>
        {/* The one polite live region: the newest log entry, in plain words. */}
        <div className={s.srOnly} aria-live="polite">{latest ? `Entry ${latest.n}. ${latest.did} ${latest.blocked ? 'Blocked.' : ''} ${latest.why}` : ''}</div>

        <header className={s.hero}>
          <p className={s.eyebrow}>{HERO.eyebrow}</p>
          <h1 className={s.h1}>{HERO.title}</h1>
          <p className={s.lead}>{HERO.intro}</p>
          <p className={s.sample}>{HERO.sample}</p>
        </header>

        <div className={s.grid}>
          <aside className={s.aside} aria-label="Ward console and change log">
            <div className={s.sticky}>
              <Console st={st} />
              <div className={s.logDesk}><ChangeLog log={st.log} onRecord={st.actions.openRecord} /></div>
              <div className={s.logPhone}><ChangeLog log={st.log} latestOnly /><a href="#ix-log" className={s.back}>Full change log</a></div>
            </div>
          </aside>
          <div className={s.prose}>
            <Problem st={st} />
            <Tiers st={st} />
            <Governance st={st} />
            <Rot st={st} />
            <Slots st={st} />
            <Edges st={st} />
            <Failed st={st} />
            <Decisions st={st} />
            <Views st={st} />
            <Onboarding st={st} />
            <LogSection st={st} />
            <p className={s.limits}>{SECTIONS.limits}</p>
          </div>
        </div>
        <div className={s.tail}><Link href="/" className={s.back}>← Back to selected work</Link></div>
      </div>
    </main>
  )
}
