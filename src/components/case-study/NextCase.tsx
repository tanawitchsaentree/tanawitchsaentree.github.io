import Link from 'next/link'
import { SELECTED_WORK } from '@/data/home'
import s from './NextCase.module.css'

/** Reading order of the case studies: the order of SELECTED_WORK in src/data/home.ts. */
export type CaseId = 'allianz' | 'claims' | 'invitrace' | 'vitae' | 'profita' | 'stellareat' | 'tims'
const ORDER = SELECTED_WORK.map(w => w.href.split('/')[2])

/** Sits under a case study so a reader can go straight to the next one instead of back through the home page. */
export function NextCase({ current }: { current: CaseId }) {
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]
  const entry = SELECTED_WORK.find(w => w.href === `/projects/${next}/`)
  if (!entry) return null
  return (
    <nav className={s.next} aria-label="Next case study">
      <Link href={entry.href} className={s.link}>
        <span className={s.label}>Next case study</span>
        <span className={s.title}>{entry.title}</span>
        <span className={s.meta}>{entry.company} · {entry.period}</span>
        <span className={s.arrow} aria-hidden="true">→</span>
      </Link>
    </nav>
  )
}
