'use client'

import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { DAYS, ECHO, HERO, NOTES, SPREAD, TEXT, type DayKey, type Entry } from './data'
import { LabelStrip, PaperStack } from './Letter'
import { MondayDemo } from './Monday'
import { CostCards, ThreeTrees } from './Notes'
import { TuesdayDemo } from './Tuesday'
import { WednesdayAside, WednesdayDemo } from './Wednesday'
import { ThursdayDemo } from './Thursday'
import { FridayDemo } from './Friday'
import { initialShared, type Shared } from './state'
import { ActionsCtx, DoneCtx, Drawer, Glyph, LiveRegion, MountOnce, SharedCtx, useActions, useDone, type Actions } from './Ui'
import s from './docsort.module.css'

// Allianz case study, Concept C: one invented week as a paper week-to-view diary. Each day
// page carries its own inline demo, mounted once by a single IntersectionObserver. Finishing
// a demo fills that day's box in the opening spread. Motion is transform and clip-path only;
// there are no scroll listeners and no per-frame state.

const ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri']
const NAME: Record<DayKey, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday' }
const SHORT: Record<DayKey, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri' }
const HOURS = ['08', '09', '10', '11', '12', '13', '14', '15']

/** Which spread box each demo fills. Boxes with no demo are ink from the start. */
const ANA_DEMO: (DayKey | null)[] = [null, 'tue', 'wed', 'thu', null]
const THEO_DEMO: (DayKey | null)[] = ['mon', null, null, null, 'fri']

// ── Opening spread ──
function Box({ day, who, line, demo, i, theo }: { day: DayKey; who: string; line: string; demo: DayKey | null; i: number; theo?: boolean }) {
  const done = useDone()
  const { jump } = useActions()
  const finished = demo ? done[demo] : false
  const state = demo ? (finished ? 'done' : 'todo') : 'ink'
  if (!line) return <span className={s.box} data-state="empty" aria-hidden="true" />
  return (
    <a href={`#day-${day}`} className={s.box} data-state={state} onClick={(e: MouseEvent) => { e.preventDefault(); jump(day) }}>
      <span className={s.srOnly}>{NAME[day]}, {who}. </span>
      <span className={s.boxLine}>{line}</span>
      {finished && <span className={s.check} aria-hidden="true"><Glyph k="check" /></span>}
      {finished && <span className={s.srOnly}> Done.</span>}
      {theo && <PaperStack n={i < 4 ? i + 1 : 1} tray={i < 4 ? SPREAD.trayFrom : SPREAD.trayTo} />}
    </a>
  )
}

function Spread() {
  const done = useDone()
  const { jump } = useActions()
  const people = [
    { key: 'ana', ...SPREAD.ana, demos: ANA_DEMO },
    { key: 'theo', ...SPREAD.theo, demos: THEO_DEMO },
  ]
  const who = (label: string) => label.split(' · ')[0]
  return (
    <div className={s.spread} role="region" aria-label={HERO.spreadLabel}>
      <div className={s.spreadGrid}>
        <span aria-hidden="true" />
        {ORDER.map(d => <span key={d} className={s.spreadDay} aria-hidden="true">{SHORT[d]}</span>)}
        {people.map(p => (
          <Fragment key={p.key}>
            <span className={s.spreadWho} aria-hidden="true">{p.label}</span>
            {ORDER.map((d, i) => <Box key={d} day={d} who={who(p.label)} line={p.lines[i]} demo={p.demos[i]} i={i} theo={p.key === 'theo'} />)}
          </Fragment>
        ))}
      </div>
      <ol className={s.spreadList}>
        {ORDER.map((d, i) => {
          const rows = people.map(p => ({ p, line: p.lines[i], demo: p.demos[i] })).filter(r => r.line)
          return (
            <li key={d}>
              <a href={`#day-${d}`} className={s.dayRow} onClick={e => { e.preventDefault(); jump(d) }}>
                <span className={s.spreadDay}>{NAME[d]}</span>
                {rows.map(({ p, line, demo }) => {
                  const state = demo ? (done[demo] ? 'done' : 'todo') : 'ink'
                  return (
                    <span key={p.key} className={s.dayRowLine} data-state={state}>
                      <span className={s.dayRowWho}>{who(p.label)}</span>
                      <span>{line}{state === 'done' && <span className={s.srOnly}> Done.</span>}</span>
                      {state === 'done' && <span className={s.check} aria-hidden="true"><Glyph k="check" /></span>}
                      {p.key === 'theo' && <PaperStack n={i < 4 ? i + 1 : 1} tray={i < 4 ? SPREAD.trayFrom : SPREAD.trayTo} />}
                    </span>
                  )
                })}
              </a>
            </li>
          )
        })}
      </ol>
      <p className={s.caption}>{HERO.caption}</p>
    </div>
  )
}

// ── Day pages: ruled hour margin, prose up to 56ch, the demo beside it ──
function EntryBlock({ e }: { e: Entry }) {
  return (
    <div className={s.entry}>
      <p className={s.who}><span className={s.mono}>{e.time}</span> {e.who}</p>
      {e.paras.map(p => <p key={p} className={s.para}>{p}</p>)}
      {e.aside && (
        <aside className={s.aside} aria-label={e.aside.label}>
          <p className={s.asideLabel}>{e.aside.label}</p>
          <p className={s.para}>{e.aside.text}</p>
        </aside>
      )}
    </div>
  )
}

function DayPage({ day, flip, demo, minH, drawerExtra }: { day: DayKey; flip?: boolean; demo: ReactNode; minH: number; drawerExtra?: ReactNode }) {
  const d = DAYS[day]
  const byHour = (h: string) => d.entries.filter(e => e.time.slice(0, 2) === h)
  return (
    <section id={`day-${day}`} className={s.day} data-flip={flip || undefined} aria-labelledby={`h-${day}`}>
      <div className={s.dayGrid}>
        <div className={s.hours}>
          <p className={s.dayName}>{NAME[day]}</p>
          <h2 id={`h-${day}`} className={s.h2} tabIndex={-1}>{d.heading}</h2>
          {HOURS.map(h => {
            const es = byHour(h)
            return (
              <Fragment key={h}>
                <span className={s.hourLabel} data-empty={!es.length || undefined} aria-hidden="true">{h}</span>
                <div className={s.hourCell} data-empty={!es.length || undefined}>{es.map(e => <EntryBlock key={e.time} e={e} />)}</div>
              </Fragment>
            )
          })}
        </div>
        <div className={s.demoCol}>
          <MountOnce minH={minH}>{demo}</MountOnce>
        </div>
      </div>
      <Drawer items={d.how}>{drawerExtra}</Drawer>
    </section>
  )
}

function NotesPage({ id, heading, paras, children, after }: { id: string; heading: string; paras: string[]; children?: ReactNode; after?: ReactNode }) {
  return (
    <section className={s.notes} aria-labelledby={`h-${id}`}>
      <div className={s.notesInner}>
        <p className={s.eyebrow}>Notes</p>
        <h2 id={`h-${id}`} className={s.h2}>{heading}</h2>
        {paras.map(p => <p key={p} className={s.notesPara}>{p}</p>)}
        {children}
      </div>
      {after}
    </section>
  )
}

function Echo() {
  return (
    <div className={s.echo} aria-hidden="true">
      {ECHO.map(e => (
        <figure key={e.caption} className={s.echoItem}>
          <span className={s.echoStrips}>{e.labels.map(l => <LabelStrip key={l} label={l} accent={e.accent} className={s.echoStrip} />)}</span>
          <figcaption className={s.echoCap}>{e.caption}</figcaption>
        </figure>
      ))}
    </div>
  )
}

// Demos take no props: memo keeps a page-level change (the spread filling in) from
// re-rendering them. They re-render only for their own state or the contexts they read.
const Mon = memo(MondayDemo), Tue = memo(TuesdayDemo), Wed = memo(WednesdayDemo), Thu = memo(ThursdayDemo), Fri = memo(FridayDemo)
const Costs = memo(CostCards), Trees = memo(ThreeTrees)

export function DocsortCase() {
  const [shared, setSharedState] = useState<Shared>(initialShared)
  const [done, setDone] = useState<Record<DayKey, boolean>>({ mon: false, tue: false, wed: false, thu: false, fri: false })
  const reducedRef = useRef(false)
  const sayRef = useRef<(t: string) => void>(() => {})
  useEffect(() => { reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches }, [])

  const bind = useCallback((set: (t: string) => void) => { sayRef.current = set }, [])
  const actions: Actions = useMemo(() => ({
    say: (t: string) => sayRef.current(t),
    complete: (d: DayKey) => setDone(p => (p[d] ? p : { ...p, [d]: true })),
    setShared: (f: (p: Shared) => Shared) => setSharedState(f),
    reduced: () => reducedRef.current,
    jump: (d: DayKey) => {
      const el = document.getElementById(`day-${d}`)
      if (!el) return
      el.scrollIntoView({ behavior: reducedRef.current ? 'auto' : 'smooth', block: 'start' })
      document.getElementById(`h-${d}`)?.focus({ preventScroll: true })
    },
  }), [])
  const wed = DAYS.wed

  return (
    <ActionsCtx.Provider value={actions}>
    <SharedCtx.Provider value={shared}>
    <DoneCtx.Provider value={done}>
      <main data-demo="docsort" className={s.page}>
        <LiveRegion bind={bind} />
        <div className={s.shell}>
          <div className={s.top}><Link href="/" className={s.back}><Glyph k="back" /> Portfolio</Link></div>
          <section className={s.hero} aria-labelledby="h-hero">
            <p className={s.eyebrow}>{HERO.eyebrow}</p>
            <h1 id="h-hero" className={s.h1}>{HERO.title}</h1>
            <p className={s.lead}>{HERO.intro}</p>
            <Spread />
          </section>
        </div>

        <DayPage day="mon" demo={<Mon />} minH={620} />
        <NotesPage id="n02" heading={NOTES.n02.heading} paras={NOTES.n02.paras}>
          <Trees />
          <Drawer items={NOTES.n02.how ?? []} />
        </NotesPage>
        <DayPage day="tue" flip demo={<Tue />} minH={600} />
        <NotesPage id="n04" heading={NOTES.n04.heading} paras={NOTES.n04.paras} after={<div className={s.notesWide}><Costs /></div>} />
        <DayPage day="wed" demo={<Wed />} minH={1100} drawerExtra={wed.howAside && <WednesdayAside label={wed.howAside.label} text={wed.howAside.text} />} />
        <DayPage day="thu" flip demo={<Thu />} minH={520} />
        <DayPage day="fri" demo={<Fri />} minH={420} />
        <NotesPage id="n08" heading={NOTES.n08.heading} paras={NOTES.n08.paras} />

        <div className={s.shell}>
          <Echo />
          <div className={s.tail}>
            <p className={s.credit}>{TEXT.credit}</p>
            <Link href="/#work" className={s.back}><Glyph k="back" /> Back to selected work</Link>
          </div>
        </div>
      </main>
    </DoneCtx.Provider>
    </SharedCtx.Provider>
    </ActionsCtx.Provider>
  )
}
