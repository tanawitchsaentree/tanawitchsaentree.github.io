'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CaseFile, type FileActions } from './CaseFile'
import { CLAIM, COPY, DATE_AUTOPLAY_SHIFT, HERO, MOMENTS, PAYMENT_AUTOPLAY, PAYMENT_STEP, fmtLoss, fmtMoney, type EdgeCase } from './data'
import { INITIAL, closeReason, type Decision, type FileState } from './state'
import { Drawer } from './moments/Drawer'
import s from './casefile.module.css'

// Act 1 of the claims case study. One sticky case file; scroll moments attach things to it.
// Performance: one IntersectionObserver sets the active moment (a discrete state change);
// no scroll listeners, no per-frame state, motion is transform/clip-path in CSS.

/** What the file looks like once every moment up to `active` has auto-played. */
function autoplayed(active: number): FileState {
  return {
    ...INITIAL,
    active,
    linked: active >= 1,
    dateShift: active >= 3 ? DATE_AUTOPLAY_SHIFT : 0,
    amount: active >= 4 ? PAYMENT_AUTOPLAY : 0,
    request: active >= 5,
  }
}

const EDGE_SAY: Record<EdgeCase, string> = {
  expired: 'The policy expired before the loss date. Policy tab: expired, pick another.',
  noCause: 'No cause of loss. Attached: Cause, Other Event, defaulted. Change it any time.',
  location: 'The location roughly matched. Attached: Location, kept as typed. Changing it is opt-in.',
}

export function ClaimsCaseFile() {
  const [state, setState] = useState<FileState>(INITIAL)
  const [said, setSaid] = useState('')
  const momentRefs = useRef<(HTMLElement | null)[]>([])
  const played = useRef(new Set<number>([0]))
  const touched = useRef({ date: false, amount: false })
  const timers = useRef<number[]>([])
  const reduced = useRef(false)
  const dogEarRef = useRef<HTMLButtonElement>(null)
  const backHeadingRef = useRef<HTMLHeadingElement>(null)
  const endRef = useRef<HTMLAnchorElement>(null)

  const patch = (p: Partial<FileState>, say?: string) => {
    setState(prev => ({ ...prev, ...p }))
    if (say) setSaid(say)
  }

  // One observer: the moment crossing the viewport's middle becomes active.
  // In one column the file covers the top half, so the band moves to 70% of the screen.
  // A second, tiny observer on the back link activates the last moment on very tall
  // screens, where moment 7 may never reach the band before the page ends.
  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const narrow = window.matchMedia('(max-width: 959px)')
    const activate = (m: number) => setState(prev => (prev.active === m ? prev : { ...prev, active: m }))
    let io: IntersectionObserver | null = null
    const observe = () => {
      io?.disconnect()
      io = new IntersectionObserver(entries => {
        for (const e of entries) if (e.isIntersecting) activate(Number((e.target as HTMLElement).dataset.m))
      }, { rootMargin: narrow.matches ? '-69% 0px -30% 0px' : '-49% 0px -50% 0px' })
      momentRefs.current.forEach(el => el && io?.observe(el))
    }
    observe()
    narrow.addEventListener('change', observe)
    const end = new IntersectionObserver(([e]) => { if (e.isIntersecting) activate(MOMENTS.length) }, { threshold: 1 })
    if (endRef.current) end.observe(endRef.current)
    const t = timers.current
    return () => { io?.disconnect(); end.disconnect(); narrow.removeEventListener('change', observe); t.forEach(clearTimeout) }
  }, [])

  // Each moment auto-plays once, the first time it becomes active. Moments skipped by a
  // jump (End key, the end-of-page observer) get their result at once, without delays.
  useEffect(() => {
    const m = state.active
    if (played.current.has(m)) return
    const skipped: number[] = []
    for (let k = 1; k < m; k++) if (!played.current.has(k)) { skipped.push(k); played.current.add(k) }
    if (skipped.length) {
      setState(p => {
        const n = { ...p }
        if (skipped.includes(1) || skipped.includes(2)) n.linked = true // the picker lives on moment 1, so no edge case was chosen
        if (skipped.includes(3) && !touched.current.date) n.dateShift = DATE_AUTOPLAY_SHIFT
        if (skipped.includes(4) && !touched.current.amount) n.amount = PAYMENT_AUTOPLAY
        if (skipped.includes(5)) n.request = true
        return n
      })
    }
    played.current.add(m)
    const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, reduced.current ? 0 : ms)) }
    if (m === 1) later(() => { setState(p => (p.linked || p.edge === 'expired' ? p : { ...p, linked: true })); setSaid(`Policy ${CLAIM.policy} linked. The skeleton is now a claim.`) }, 700)
    if (m === 2) { setState(p => ({ ...p, linked: true })); setSaid('Attached: two sections, Cargo and Business interruption.') }
    if (m === 3) later(() => {
      if (touched.current.date) return
      setState(p => ({ ...p, dateShift: DATE_AUTOPLAY_SHIFT }))
      setSaid(`Loss date changed from ${fmtLoss(0)} to ${fmtLoss(DATE_AUTOPLAY_SHIFT)}. ${COPY.dateSection}: review needed.`)
    }, 600)
    if (m === 4) later(() => {
      if (touched.current.amount) return
      setState(p => ({ ...p, amount: PAYMENT_AUTOPLAY }))
      setSaid(`Payment of ${fmtMoney(PAYMENT_AUTOPLAY)} stopped at the reserve of ${fmtMoney(INITIAL.reserve)}.`)
    }, 500)
    if (m === 5) later(() => { setState(p => ({ ...p, request: true })); setSaid('Attached: rejection request, coverage. The stamp still says Open.') }, 500)
    if (m === 6) setSaid('The approver has 1 claim request waiting.')
    if (m === 7) setSaid('Closing: three checks before the stamp can change.')
  }, [state.active])

  // The approver side only exists from moment 6; scrolling back above it turns the file over again.
  useEffect(() => {
    if (state.active < 6) setState(p => (p.flipped ? { ...p, flipped: false } : p))
  }, [state.active])

  const pickEdge = (e: EdgeCase) => patch({ edge: e, linked: e !== 'expired' }, EDGE_SAY[e])
  const stepDate = (d: number) => {
    touched.current.date = true
    const next = state.dateShift + d
    patch({ dateShift: next }, next === 0 ? `Loss date back to ${fmtLoss(0)}. Nothing to review.` : `Loss date ${fmtLoss(next)}, was ${fmtLoss(0)}. ${COPY.dateSection}: review needed.`)
  }
  const setAmount = (v: number) => {
    touched.current.amount = true
    const wasOver = state.amount > state.reserve, isOver = v > state.reserve
    patch({ amount: v }, wasOver === isOver ? undefined : isOver ? `Stopped at the reserve, ${fmtMoney(v - state.reserve)} over. Go to reserves to raise it.` : 'The payment fits the remaining reserve.')
  }
  const raiseReserve = () => {
    const reserve = Math.ceil(state.amount / PAYMENT_STEP) * PAYMENT_STEP
    patch({ reserve }, `Reserve raised to ${fmtMoney(reserve)}. The payment fits.`)
  }
  const flip = (next: boolean) => {
    patch({ flipped: next }, next ? 'Showing the approver side.' : 'Showing the handler side.')
    requestAnimationFrame(() => (next ? backHeadingRef.current : dogEarRef.current)?.focus())
  }
  const decide = (kind: NonNullable<Decision>['kind'], reason: string) =>
    patch({ decision: { kind, reason } }, `Rejection ${kind}. Reason: ${reason}. Turn the corner to see the claim.`)
  const closeStep = (n: number) =>
    patch({ closeStep: n }, n === 1 ? 'Blockers cleared.' : n === 2 ? 'System checklist passed.' : `Claim closed. Reason: ${closeReason(state)}. Every tab is still attached.`)
  const reset = () => {
    touched.current = { date: false, amount: false }
    setState(autoplayed(state.active))
    setSaid('The file is reset.')
  }
  const actions: FileActions = { pickEdge, stepDate, setAmount, raiseReserve, flip, decide, closeStep, reset }

  return (
    <main className={s.page}>
      <div className={s.shell}>
      <nav className={s.top} aria-label="Back"><Link href="/" className={s.backLink} data-edge>← Portfolio</Link></nav>
      <div className={s.srOnly} aria-live="polite">{said}</div>

      <div className={s.grid}>
        <div className={s.prose}>
          <section ref={el => { momentRefs.current[0] = el }} data-m={0} className={`${s.moment} ${s.hero}`}>
            <p className={s.eyebrow} data-edge>{HERO.eyebrow}</p>
            <h1 className={s.h1} data-edge>{HERO.title}</h1>
            <p className={s.body} data-edge>{HERO.intro}</p>
            <ul className={s.stats} aria-label="Project in numbers" data-edge>
              {HERO.stats.map(t => <li key={t}>{t}</li>)}
            </ul>
          </section>

          {MOMENTS.map((mo, i) => {
            const m = i + 1
            return (
              <section key={mo.title} ref={el => { momentRefs.current[m] = el }} data-m={m} className={s.moment} aria-labelledby={`cf-m${m}`}>
                <p className={s.eyebrow} aria-hidden="true" data-edge>{String(m).padStart(2, '0')}</p>
                <h2 id={`cf-m${m}`} className={s.h2} data-edge>{mo.title}</h2>
                <p className={s.body} data-edge>{mo.body}</p>
                <Drawer items={mo.how} />
              </section>
            )
          })}
        </div>

        <aside className={s.aside} aria-label="Case file">
          <div className={s.scaleBox} data-file>
            <CaseFile state={state} actions={actions} dogEarRef={dogEarRef} backHeadingRef={backHeadingRef} />
          </div>
        </aside>
      </div>

      <footer className={s.tail}>
        <p className={s.credit} data-edge>{COPY.credit}</p>
        <Link ref={endRef} href="/" className={s.backLink} data-edge>← Back to selected work</Link>
      </footer>
      </div>
    </main>
  )
}
