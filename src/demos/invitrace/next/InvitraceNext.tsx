'use client'

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import { cubicBezier, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { Button, Card } from 'dial-react'
import { track } from '@/components/analytics/track'
import { DOCTOR, HERO, HOSPITALS, PATIENTS, SAMPLE_COLOURS, SECTIONS, type RequestId } from '../data'
import { RAW, checkBrand } from '../model'
import n from './next.module.css'

// Invitrace, told as five requests from one clinic. Every section is the same shape:
// the request in the clinic's words, one button that sends it, the clinic's screen showing what
// happens, and the answer with one plain reason. Dial is the material (the device and
// the one orange key); nothing here needs the reader to learn a control.

type Id = Extract<RequestId, 'colour' | 'doctor' | 'copy' | 'small' | 'alert'>
const ORDER: Id[] = ['colour', 'doctor', 'copy', 'small', 'alert']
const PAGE = 'invitrace-next'
const SENT = SECTIONS.s4.sent
const CHECK = checkBrand(SENT)
const CLINIC = HOSPITALS.find(h => h.id === 'specialty') ?? HOSPITALS[HOSPITALS.length - 1]
const RED = RAW.critical
/** How far each copy's fill drifted from the clinic's own colour: the same button, five ways. */
const DRIFT_MIX = [100, 72, 64, 80, 58]
const DECISIVE = cubicBezier(0.16, 1, 0.3, 1)
const GENTLE = cubicBezier(0.22, 1, 0.36, 1)
/** The refusal wipe: its length and curve must match .req::before in next.module.css. */
const WIPE_MS = 900
const WIPE = cubicBezier(0.65, 0, 0.35, 1)
/** When the wipe's edge reaches a height (0 = bottom, 1 = top), as a fraction of WIPE_MS. */
const wipeTime = (h: number) => { let lo = 0, hi = 1; for (let k = 0; k < 20; k++) { const m = (lo + hi) / 2; if (WIPE(m) < h) lo = m; else hi = m } return (lo + hi) / 2 }
const still = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
// Two requests are reworded on this page: one is a "what" question that cannot take a yes or no,
// and one carries a banned connector word. The rest are the clinic's words from the case content.
const ASK: Partial<Record<Id, string>> = {
  doctor: 'Can our doctor card be larger?',
  copy: "We'd like our own copy of the screens, to adjust ourselves.",
}
const ask = (id: Id) => ASK[id] ?? HERO.requests.find(r => r.id === id)!.text

const COPY: Record<Id, { key: string; yes: boolean; word: string; heading: string; reason: string; short: string }> = {
  colour: {
    key: 'Use our brand colour', yes: true, word: 'Mostly', short: 'brand colour',
    heading: 'A few shades darker.',
    reason: `White text on ${SENT} reaches only ${CHECK.ratio.toFixed(1)}:1, and readable text needs 4.5:1. The system offers the closest shade of the same hue that passes, ${CHECK.nearest.toUpperCase()}.`,
  },
  doctor: {
    key: 'Show our doctor card', yes: true, word: 'Yes', short: 'doctor card',
    heading: 'One doctor, shown large.',
    reason: 'A specialty screen shows one doctor, not a list. The clinic gets a larger card with the name, who is on call, and the Page button. How the card is laid out is a choice each hospital makes.',
  },
  copy: {
    key: 'Give us our own copy', yes: false, word: 'No', short: 'own copy',
    heading: 'Every hospital shares one button.',
    reason: 'We used to say yes. Each copy then drifted in padding and contrast, every fix had to be made again in every copy, and any one of them could slip back without anyone seeing it. Now there is one shared button, and each hospital sets its own look in one theme file.',
  },
  small: {
    key: 'Make the buttons smaller', yes: false, word: 'No', short: 'smaller buttons',
    heading: 'Buttons stay 44px tall.',
    reason: 'Specialty screens keep every button at least 44px tall, desktops included. Teaching hospitals can go to 36px, and only on screens marked desktop-only. If a screen is marked desktop-only by mistake and used on a tablet, the buttons are too small to tap and nothing warns anyone.',
  },
  alert: {
    key: 'Make the alert our colour', yes: false, word: 'No', short: 'alert colour',
    heading: 'The alert is red in every hospital.',
    reason: `The critical alert uses one red, ${RED}, in every hospital, and nothing a hospital sets can change it. It may clash with the clinic's brand, and the clinic lives with that.`,
  },
}

/** The clinic's ward screen, printed flat. Only the parts a section needs are drawn. */
function Screen({ brand, h = 44, doctor = 'row', parts, children }: { brand: string; h?: number; doctor?: 'row' | 'hero'; parts: ('admit' | 'doctor' | 'table')[]; children?: ReactNode }) {
  return (
    <div className={n.screen} style={{ '--brand': brand, '--h': `${h}px` } as CSSProperties}>
      <p className={n.scrHead}><span>{CLINIC.name}</span><span>Ward 3B</span></p>
      {parts.includes('doctor') && (
        <div className={n.doc} data-layout={doctor}>
          <span className={n.avatar} aria-hidden="true">SW</span>
          <span className={n.docText}><b>{DOCTOR.name}</b><span>{doctor === 'hero' ? DOCTOR.where : DOCTOR.role}</span></span>
          <span className={n.page}>{DOCTOR.action}</span>
        </div>
      )}
      {parts.includes('admit') && <div className={n.admitRow}><span className={n.admit}>Admit patient</span>{children}</div>}
      {parts.includes('table') && (
        <table className={n.table}><tbody>
          {PATIENTS.map(p => <tr key={p.bed}><td>{p.bed}</td><td>{p.name}</td><td data-risk={p.risk}>{p.risk}</td></tr>)}
        </tbody></table>
      )}
    </div>
  )
}

/** One request on the grid: the clinic's words, the device, then the answer set large.
    A refused request turns its section dark; the system said no. */
function Request({ id, i, done, onSend, screen, busy }: { id: Id; i: number; done: boolean; onSend: () => void; screen: ReactNode; busy?: boolean }) {
  const c = COPY[id]
  const headRef = useRef<HTMLHeadingElement>(null)
  const was = useRef(done)
  // Focus moves to the answer once it is on screen, after React has committed it.
  useEffect(() => { if (done && !was.current) headRef.current?.focus({ preventScroll: true }); was.current = done }, [done])
  // The section assembles as it scrolls in: the quote rises, the device slides in from the left edge
  // (the last request's device rises from below instead), and the answer column rises a beat behind.
  // The answer column settles before the section reaches mid-screen, so the Send key is still when the
  // reader reaches for it. The press-triggered answers below run on timers; this entrance does not.
  const box = useRef<HTMLElement>(null)
  const still = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: box, offset: ['start end', 'start 0.2'] })
  const qy = useTransform(scrollYProgress, [0, 1], [still ? 0 : 120, 0], { ease: DECISIVE })
  const lift = id === 'alert'
  const dx = useTransform(scrollYProgress, [0.15, 1], still || lift ? ['0vw', '0vw'] : ['-12vw', '0vw'], { ease: DECISIVE })
  const dy = useTransform(scrollYProgress, [0.1, 0.8], [still || !lift ? 0 : 200, 0], { ease: DECISIVE })
  const ay = useTransform(scrollYProgress, [0.2, 0.6], [still ? 0 : 140, 0], { ease: DECISIVE })
  // A refusal: the dark rises from the bottom. Each part swaps to light ink when the dark's edge
  // passes its middle, measured from the part's real position, so no text sits light-on-paper or
  // dark-on-dark while the wipe runs. data-no is set here, after the delays, never in JSX: measuring
  // flushes styles, and a theme swap flushed before --swap exists would start every transition at once.
  const no = done && !c.yes
  useLayoutEffect(() => {
    const sec = box.current
    if (!no || !sec) return
    const H = sec.getBoundingClientRect()
    sec.querySelectorAll<HTMLElement>('[data-swap]').forEach(el => {
      const r = el.getBoundingClientRect()
      const fromBottom = (H.bottom - (r.top + r.height / 2)) / H.height
      el.style.setProperty('--swap', `${Math.round(wipeTime(Math.min(1, Math.max(0, fromBottom))) * WIPE_MS)}ms`)
    })
    sec.setAttribute('data-no', '')
  }, [no])
  return (
    <section ref={box} id={`ix-${id}`} data-moment={id} className={n.req} aria-labelledby={`ix-${id}-q`}>
      <p className={n.reqMeta} data-swap><span>Request</span><span>{String(i + 1).padStart(2, '0')} / {String(ORDER.length).padStart(2, '0')}</span></p>
      <Legend5 now={id} />
      <motion.h2 id={`ix-${id}-q`} className={n.quote} data-swap style={{ y: qy }}>&ldquo;{ask(id)}&rdquo;</motion.h2>
      <div className={n.stage}>
        <motion.div className={n.deviceCol} style={{ x: dx, y: dy }}>
          <Card padding="unit" wordmark="invitrace" model="ward screen" className={n.device}>{screen}</Card>
        </motion.div>
        <motion.div className={n.answer} style={{ y: ay }}>
          {done
            ? <div className={n.reason}>
                <p className={n.verdict} aria-hidden="true" data-swap>{c.word}.</p>
                <h3 ref={headRef} tabIndex={-1} className={n.heading} data-swap><span className={n.sr}>{c.word}. </span>{c.heading}</h3>
                <p className={n.why} data-swap>{c.reason}</p>
              </div>
            : <div className={n.send}>
                <Button kind="primary" size="lg" className={n.sendKey} aria-disabled={busy || undefined} onClick={() => { if (!busy) { track(`send/${PAGE}/${id}`, `Sent ${id}`); onSend() } }}>{busy ? 'Sending…' : c.key}</Button>
                {i === 0 && <p className={n.hint}>Send it, and watch the clinic&rsquo;s screen.</p>}
              </div>}
        </motion.div>
      </div>
    </section>
  )
}

/** The rule, pinned while the reader scrolls through it: each word steps from dim to full ink in reading order. */
const RULE = ['Looks belong to the clinic.', 'Anything that keeps a patient safe is decided by the system, not the clinic.']
function Statement() {
  const ref = useRef<HTMLElement>(null)
  const still = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const words = RULE.flatMap((s, line) => s.split(' ').map(w => ({ w, line })))
  return (
    <section ref={ref} className={n.statement} data-moment="rule" aria-label="The rule">
      <div className={n.pin}>
        <p className={n.sr}>{RULE.join(' ')}</p>
        {RULE.map((_, line) => (
          <p key={line} className={n.ruleLine} aria-hidden="true">
            {words.map((x, k) => x.line === line && <Word key={k} p={scrollYProgress} from={k / words.length * 0.85} to={(k + 1) / words.length * 0.85} still={!!still}>{x.w}</Word>)}
          </p>
        ))}
      </div>
    </section>
  )
}
// Note: --k feeds color-mix, so each scroll frame restyles and repaints about 18 small spans. It is
// cheap at this size; the y offset is the only composited part.
function Word({ p, from, to, still, children }: { p: MotionValue<number>; from: number; to: number; still: boolean; children: string }) {
  const k = useTransform(p, [from, to], still ? [100, 100] : [14, 100], { ease: GENTLE })
  const y = useTransform(p, [from, to], still ? [0, 0] : [2, 0], { ease: GENTLE })
  const pct = useTransform(k, v => `${v}%`)
  return <motion.span className={n.word} style={{ '--k': pct, y } as unknown as CSSProperties}>{children} </motion.span>
}

/** The fixed track at the foot of the page: the five request words slide along it to keep the one in view on the mark. */
function Track({ now, sent }: { now: Id | null; sent: number }) {
  const list = useRef<HTMLOListElement>(null)
  const [x, setX] = useState(0)
  useEffect(() => {
    const measure = () => {
      const el = list.current?.querySelector<HTMLElement>(`[data-id="${now ?? ORDER[0]}"]`)
      setX(el ? -el.offsetLeft : 0)
    }
    measure()
    let live = true
    document.fonts?.ready.then(() => { if (live) measure() })
    window.addEventListener('resize', measure)
    return () => { live = false; window.removeEventListener('resize', measure) }
  }, [now])
  return (
    <div className={n.track} aria-hidden="true">
      <span className={n.trackN}>{now ? `${String(ORDER.indexOf(now) + 1).padStart(2, '0')} / ${String(ORDER.length).padStart(2, '0')}` : `${String(sent).padStart(2, '0')} / ${String(ORDER.length).padStart(2, '0')} sent`}</span>
      <div className={n.trackWin}><ol ref={list} style={{ transform: `translateX(${x}px)` }}>{ORDER.map(id => <li key={id} data-id={id} data-now={now === id || undefined}>{COPY[id].short}</li>)}</ol></div>
    </div>
  )
}

/** The five requests printed in a row; the one in view is in full ink (dial P7). */
function Legend5({ now }: { now?: Id }) {
  return (
    <ol className={n.legend} aria-hidden="true" data-swap>
      {ORDER.map(id => <li key={id} data-now={now === id || undefined}>{COPY[id].short}</li>)}
    </ol>
  )
}

export function InvitraceNext() {
  const [done, setDone] = useState<Partial<Record<Id, boolean>>>({})
  const [phase, setPhase] = useState<Partial<Record<Id, string>>>({})
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const later = (ms: number, f: () => void) => { timers.current.push(window.setTimeout(f, still() ? 0 : ms)) }
  const finish = (id: Id) => {
    setDone(d => ({ ...d, [id]: true }))
  }
  const run = (id: Id, steps: [number, string][], end: number) => {
    steps.forEach(([ms, p]) => later(ms, () => setPhase(s => ({ ...s, [id]: p }))))
    later(end, () => finish(id))
  }
  const ph = (id: Id) => phase[id]

  // colour: the sent colour goes on, fails, and the passing shade replaces it.
  const colourBrand = ph('colour') === 'sent' ? SENT : ph('colour') === 'nearest' ? CHECK.nearest : CLINIC.primary
  const smallH = ph('small') === 'shrink' ? 36 : 44
  const alertSweep = ph('alert') === 'sweep'
  const answered = ORDER.filter(id => done[id])
  const brandNow = done.colour ? CHECK.nearest : CLINIC.primary
  const [inView, setInView] = useState<Id | null>(null)
  useEffect(() => {
    const io = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) { const m = (e.target as HTMLElement).dataset.moment; setInView(ORDER.includes(m as Id) ? m as Id : null) } }, { rootMargin: '-50% 0px -50% 0px' })
    document.querySelectorAll<HTMLElement>('[data-moment]').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <main data-demo="invitrace" data-theme="light" className={n.root}>
      <Track now={inView} sent={answered.length} />
      <div className={n.wrap}>
        <nav className={n.top}>
          <Link href="/">← Portfolio</Link><span>Invitrace Health</span><span>Lead Product Designer</span><span>2024–2025</span>
        </nav>

        <header className={n.hero} data-moment="hero">
          <h1 className={n.title}><span className={n.sr}>A clinic asks for its own look</span>{'A clinic asks for its own look'.split(' ').map((w, k) => <span key={k} className={n.mask} aria-hidden="true"><span style={{ '--i': k } as CSSProperties}>{w}</span></span>)}</h1>
          <p className={n.heroSide}>Five requests<br />from one clinic</p>
          <p className={n.lead}>A small specialty clinic joined the Invitrace platform and sent us a list of requests. I was the lead designer on the design system, where we decided what a hospital is allowed to change. Send each request and see what the clinic gets.</p>
          <ol className={n.index}>
            {ORDER.map((id, i) => (
              <li key={id}><a href={`#ix-${id}`}><span className={n.idxN}>{String(i + 1).padStart(2, '0')}</span><span className={n.idxQ}>{ask(id)}</span><span className={n.idxA}>{done[id] ? COPY[id].word : ''}</span></a></li>
            ))}
          </ol>
        </header>

        <Statement />

        <Request id="colour" i={0} done={!!done.colour} busy={!!ph('colour')}
          onSend={() => run('colour', [[0, 'sent'], [1600, 'nearest']], 2600)}
          screen={<Screen brand={colourBrand} parts={['admit', 'table']}>
            {ph('colour') && <span className={n.note} data-bad={ph('colour') === 'sent' || undefined}>{ph('colour') === 'sent' ? `${SENT} · ${CHECK.ratio.toFixed(1)}:1 · too light` : `${CHECK.nearest.toUpperCase()} · passes`}</span>}
          </Screen>} />

        <Request id="doctor" i={1} done={!!done.doctor} busy={!!ph('doctor')}
          onSend={() => run('doctor', [[0, 'hero']], 900)}
          screen={<Screen brand={done.colour ? CHECK.nearest : CLINIC.primary} doctor={ph('doctor') ? 'hero' : 'row'} parts={['doctor', 'table']} />} />

        <Request id="copy" i={2} done={!!done.copy} busy={!!ph('copy')}
          onSend={() => run('copy', [[0, 'split'], [1500, 'one']], 2300)}
          screen={<div className={n.screen}>
            <p className={n.scrHead}><span>{ph('copy') === 'split' ? 'Five copies, after a while' : ph('copy') === 'one' ? 'One shared button again' : 'The Admit button'}</span><span /></p>
            <div className={n.forks} data-state={ph('copy') ?? 'one'}>
              {SAMPLE_COLOURS.drift.map((f, k) => {
                const split = ph('copy') === 'split'
                return <span key={k} className={n.fork} style={split
                  ? { padding: f.pad, borderRadius: f.r, background: `color-mix(in srgb, ${brandNow} ${DRIFT_MIX[k]}%, ${k % 2 ? 'var(--ds-color-white)' : 'var(--ds-display-oled-bg)'})`, fontWeight: f.weight, height: f.h, transform: `translate(${f.x}px, ${f.y}px) rotate(${f.rot}deg)` }
                  : { background: brandNow }}>{split ? f.label : 'Admit patient'}</span>
              })}
            </div>
          </div>} />

        <Request id="small" i={3} done={!!done.small} busy={!!ph('small')}
          onSend={() => run('small', [[0, 'shrink'], [1300, 'back']], 1900)}
          screen={<Screen brand={done.colour ? CHECK.nearest : CLINIC.primary} h={smallH} parts={['admit', 'table']}>
            <span className={n.ruler} data-small={smallH === 36 || undefined}>{smallH}px</span>
          </Screen>} />

        <Request id="alert" i={4} done={!!done.alert} busy={!!ph('alert')}
          onSend={() => run('alert', [[0, 'sweep'], [1100, 'back']], 1700)}
          screen={<div className={n.screen}>
            <p className={n.scrHead}><span>The same alert in three hospitals</span><span /></p>
            <div className={n.alerts}>
              {HOSPITALS.map(h => {
                const mine = h.id === CLINIC.id
                const brand = mine && done.colour ? CHECK.nearest : h.primary
                return (
                  <div key={h.id} className={n.alertCol} style={{ '--brand': brand } as CSSProperties}>
                    <span className={n.alertBrand}>{h.name}</span>
                    <span className={n.alertBar} data-sweep={(mine && alertSweep) || undefined}>Critical result · bed 4A</span>
                  </div>
                )
              })}
            </div>
          </div>} />

        <section className={n.summary} data-moment="summary" aria-labelledby="ix-sum">
          <p className={n.reqMeta}><span>What the clinic got</span><span>{String(answered.length).padStart(2, '0')} / {String(ORDER.length).padStart(2, '0')}</span></p>
          <h2 id="ix-sum" className={n.quote}>{answered.length === 0 ? 'Nothing sent yet.' : [[answered.filter(id => COPY[id].yes && id !== 'colour').length, 'yes'], [answered.includes('colour') ? 1 : 0, 'mostly'], [answered.filter(id => !COPY[id].yes).length, 'no']].filter(([k]) => k).map(([k, w]) => `${k} ${w}`).join(', ') + '.'}</h2>
          <ul className={n.file}>
            {ORDER.map(id => (
              <li key={id} data-state={done[id] ? (id === 'colour' ? 'mostly' : COPY[id].yes ? 'yes' : 'no') : 'wait'}>
                <span className={n.mark} aria-hidden="true">{done[id] ? (id === 'colour' ? '~' : COPY[id].yes ? '✓' : '✕') : '·'}</span>
                <span>{ask(id)}</span>
                <span className={n.fileA}>{done[id] ? `${COPY[id].word}. ${COPY[id].heading}` : 'not sent'}</span>
              </li>
            ))}
          </ul>
          <p className={n.fine}>Sample hospitals, patients and staff. The requests are composites of real ones. I designed the system; this interactive rebuild was made with an AI coding assistant. There are no outcome numbers here, because I don&rsquo;t have any I trust.</p>
          <p className={n.fine}><Link href="/projects/invitrace/">The full case study, with every demo →</Link></p>
        </section>
      </div>
    </main>
  )
}
