'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { Desk, expectedFor, predictedFor, type DeskActions } from './Desk'
import { PhoneDesk } from './PhoneDesk'
import { COPY, HERO, MOMENTS, SAMPLES, SHAPES, TOGGLE_CARD, QUEUE_DOCS, type Shape } from './data'
import { initialState, pendingVersion, type DeskState } from './state'
import s from './docsort.module.css'

// Allianz case study. Same architecture as the claims case file: one sticky object, one
// IntersectionObserver choosing the active moment (a discrete state change), CSS motion
// on transform/clip-path only, no scroll listeners, no per-frame state, no measuring.

/** Flight time of the test pile; read at call time, after unlock. */
const flightMs = () => 700 + SAMPLES.length * 120

function Drawer({ items }: { items: string[] }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className={s.drawer}>
      <button type="button" className={s.drawerBtn} data-edge aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>
        <span aria-hidden="true" className={s.drawerGlyph}>{open ? '−' : '+'}</span> How it works
      </button>
      {open && <ul id={id} className={s.drawerPanel} data-edge data-drawer>{items.map(t => <li key={t}>{t}</li>)}</ul>}
    </div>
  )
}

export function DocsortCase() {
  const [state, setState] = useState<DeskState>(initialState)
  const [said, setSaidRaw] = useState('')
  // A trailing no-break space makes a repeated message count as a change (as in StoryShell).
  const setSaid = (next: string) => setSaidRaw(prev => (prev === next ? `${next}\u00a0` : next))
  const [connectorKey, setConnectorKey] = useState(0)
  const momentRefs = useRef<(HTMLElement | null)[]>([])
  const endRef = useRef<HTMLAnchorElement>(null)
  const testRef = useRef<HTMLButtonElement>(null)
  const phoneTestRef = useRef<HTMLButtonElement>(null)
  const played = useRef(new Set<number>([0]))
  const touched = useRef({ card: false, l2: false, run: false, doc: false })
  const timers = useRef<number[]>([])
  const reduced = useRef(false)
  const toastN = useRef(0)
  const stateRef = useRef(state)
  stateRef.current = state

  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, reduced.current ? 0 : ms)) }
  const toast = (text: string) => {
    const n = ++toastN.current
    setState(p => ({ ...p, toast: { n, text } }))
    setSaid(text)
    later(() => setState(p => (p.toast?.n === n ? { ...p, toast: null } : p)), 2600)
  }

  // Active moment: the section crossing the band (50% of the screen; 70% in one column,
  // where the object covers the top). The back link activates the last moment on tall screens.
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

  const addCard = (on: boolean) => setState(p => ({
    ...p,
    tree: p.tree.map(c => c.name !== TOGGLE_CARD.l1 ? c : { ...c, l2: on ? (c.l2.includes(TOGGLE_CARD.l2) ? c.l2 : [...c.l2, TOGGLE_CARD.l2]) : c.l2.filter(t => t !== TOGGLE_CARD.l2) }),
  }))
  const startRun = () => {
    setState(p => ({ ...p, run: 'running' }))
    setSaid('Running the test. Every sample is pending.')
    later(() => {
      setState(p => ({ ...p, run: 'done' }))
      const st = stateRef.current
      const misfiled = SAMPLES.filter(x => { const p = predictedFor(st, x); return p && p !== expectedFor(st, x.id) })
        .map(x => `${x.file} was filed as ${predictedFor(st, x)}, expected ${expectedFor(st, x.id)}.`)
      const failed = SAMPLES.filter(x => 'failed' in x.result).length
      setSaid(`Test done. ${SAMPLES.length - failed} classified, ${failed} failed. ${misfiled.join(' ') || 'Every classified sample matches its expected class.'}`)
    }, flightMs())
  }

  // Each moment auto-plays once. Moments skipped by a jump get their result at once.
  useEffect(() => {
    const m = state.active
    if (played.current.has(m)) return
    const skipped: number[] = []
    for (let k = 1; k < m; k++) if (!played.current.has(k)) { skipped.push(k); played.current.add(k) }
    if (skipped.length) setState(p => ({
      ...p,
      ...(skipped.includes(2) && !touched.current.card ? { tree: p.tree.map(c => c.name === TOGGLE_CARD.l1 && !c.l2.includes(TOGGLE_CARD.l2) ? { ...c, l2: [...c.l2, TOGGLE_CARD.l2] } : c) } : {}),
      ...(skipped.includes(3) && !touched.current.l2 ? { l2On: false } : {}),
      ...(skipped.includes(4) && !touched.current.run && p.placeholder ? { run: 'done' as const } : {}),
    }))
    played.current.add(m)
    if (m === 1) setSaid('The claims tree has three categories, each with document types under it.')
    if (m === 2) later(() => {
      if (touched.current.card) return
      addCard(true); setConnectorKey(k => k + 1)
      setSaid(`Added the card ${TOGGLE_CARD.l1} > ${TOGGLE_CARD.l2}. Its line is typed into the prompt.`)
    }, 700)
    if (m === 3) later(() => {
      if (touched.current.l2) return
      setState(p => ({ ...p, l2On: false }))
      setSaid('Document types off. The prompt splits into a stage-1 prompt and one prompt per category.')
    }, 800)
    if (m === 4) later(() => { const p = stateRef.current; if (!touched.current.run && p.placeholder && p.run === 'idle') startRun() }, 700)
    if (m === 5) setSaid('Version 2 is a draft. Deploy stays off until it is approved.')
    if (m === 6) later(() => { if (!touched.current.doc) openDoc('q1', true) }, 700)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.active])

  const openDoc = (id: string, auto = false) => {
    if (!auto) touched.current.doc = true
    setState(p => ({ ...p, openDoc: id, rows: p.rows.map(r => r.id === id ? { ...r, status: 'Locked' } : r.status === 'Locked' ? { ...r, status: 'Available' } : r) }))
    const d = QUEUE_DOCS.find(x => x.id === id)!
    setSaid(`Opened the ${d.category.toLowerCase()} from ${d.sender}. It is locked to you. One extracted field is flagged.`)
  }

  const actions: DeskActions = {
    setShape: (sh: Shape) => { setState(p => ({ ...p, shape: sh })); setSaid(`Showing the ${SHAPES[sh].label} filing tree. ${SHAPES[sh].note ? `${SHAPES[sh].note}.` : `${SHAPES[sh].l1.length} categor${SHAPES[sh].l1.length > 1 ? 'ies' : 'y'}.`}`) },
    toggleCard: () => {
      touched.current.card = true
      const on = !state.tree.some(c => c.name === TOGGLE_CARD.l1 && c.l2.includes(TOGGLE_CARD.l2))
      addCard(on)
      if (on) setConnectorKey(k => k + 1)
      setSaid(on ? `Added ${TOGGLE_CARD.l1} > ${TOGGLE_CARD.l2}. Its line is typed into the prompt.` : `Removed ${TOGGLE_CARD.l1} > ${TOGGLE_CARD.l2} and its line.`)
    },
    togglePlaceholder: () => {
      const next = !state.placeholder
      setState(p => ({ ...p, placeholder: next }))
      setSaid(next ? 'Placeholder restored. Placeholder detected; testing is possible.' : 'Placeholder deleted. Placeholder missing; testing is blocked.')
      // Focus the Test button of whichever layout is showing (the other is display: none).
      if (!next) requestAnimationFrame(() => [testRef.current, phoneTestRef.current].find(el => el && el.offsetParent !== null)?.focus())
    },
    toggleL2: () => {
      touched.current.l2 = true
      const next = !state.l2On
      setState(p => ({ ...p, l2On: next }))
      setSaid(next ? 'Document types on. One global prompt sorts everything.' : 'Document types off. A stage-1 prompt picks the category, then each category has its own prompt.')
    },
    setExpected: (id, leaf) => { touched.current.run = true; setState(p => ({ ...p, expected: { ...p.expected, [id]: leaf }, run: p.run === 'running' ? p.run : 'idle' })) },
    testFromPrompt: () => {
      if (!stateRef.current.placeholder) return
      touched.current.run = true
      // Jump so moment 4 sits on the active band (50% of the screen; 70% in one column).
      const el = momentRefs.current[4]
      if (el) {
        const r = el.getBoundingClientRect()
        const band = window.matchMedia('(max-width: 959px)').matches ? 0.7 : 0.5
        window.scrollTo({ top: window.scrollY + r.top + r.height / 2 - innerHeight * band, behavior: reduced.current ? 'auto' : 'smooth' })
      }
      later(() => { if (stateRef.current.run !== 'running') { setState(p => ({ ...p, run: 'idle' })); requestAnimationFrame(startRun) } }, 900)
    },
    runTest: () => { touched.current.run = true; if (state.placeholder && state.run !== 'running') { setState(p => ({ ...p, run: 'idle' })); requestAnimationFrame(startRun) } },
    approve: () => { const v = pendingVersion(state); if (!v) return; setState(p => ({ ...p, versions: p.versions.map(x => x.n === v.n ? { ...x, status: 'Approved' } : x) })); toast(`${v.label} approved. Deploy is now available.`) },
    deploy: () => {
      const v = pendingVersion(state); if (!v || v.status !== 'Approved') return
      setState(p => ({ ...p, versions: p.versions.map(x => x.n === v.n ? { ...x, status: 'Deployed', active: true } : x.active ? { ...x, status: 'Approved', active: false } : x) }))
      toast(`${v.label} deployed.`)
    },
    copyVersion: () => {
      const a = state.versions.find(v => v.active)!
      const n = Math.max(...state.versions.map(v => v.n)) + 1
      setState(p => ({ ...p, versions: [...p.versions, { n, label: `Version ${a.n} (Copy)`, status: 'Draft', active: false }] }))
      toast(`Copied as “Version ${a.n} (Copy)”, a draft.`)
    },
    deleteVersion: n => {
      const v = state.versions.find(x => x.n === n)
      if (!v || v.active || state.versions.length === 1) return
      setState(p => ({ ...p, versions: p.versions.filter(x => x.n !== n) }))
      toast(`${v.label} deleted.`)
    },
    renameL1: (from, to) => { setState(p => ({ ...p, tree: p.tree.map(c => c.name === from ? { ...c, name: to } : c) })); toast(`Renamed “${from}” to “${to}”.`) },
    deleteL1: name => {
      const c = state.tree.find(x => x.name === name)
      if (!c || state.tree.length === 1) return
      setState(p => ({ ...p, tree: p.tree.filter(x => x.name !== name) }))
      toast(`Deleted “${name}”${c.l2.length ? ` and its ${c.l2.length} document type${c.l2.length > 1 ? 's' : ''}` : ''}.`)
    },
    createL1: name => { setState(p => ({ ...p, tree: [...p.tree, { name, l2: [] }] })); toast(`Created “${name}” with a v1 Draft prompt.`) },
    openDoc: id => openDoc(id),
    sendDoc: (id, queue) => { setState(p => ({ ...p, openDoc: null, rows: p.rows.map(r => r.id === id ? { ...r, status: 'Available', queue } : r) })); toast(`Sent to ${queue}.`) },
    completeDoc: id => { setState(p => ({ ...p, openDoc: null, rows: p.rows.map(r => r.id === id ? { ...r, status: 'Done' } : r) })); toast('Completed.') },
  }

  return (
    <main data-demo="docsort" className={s.page}>
      <div className={s.shell}>
        <div className={s.top}><Link href="/" className={s.backLink} data-edge>← Portfolio</Link></div>
        <div className={s.srOnly} aria-live="polite">{said}</div>
        <div className={s.grid}>
          <div className={s.prose}>
            <section ref={el => { momentRefs.current[0] = el }} data-m={0} className={`${s.moment} ${s.hero}`}>
              <p className={s.eyebrow} data-edge>{HERO.eyebrow}</p>
              <h1 className={s.h1} data-edge>{HERO.title}</h1>
              <p className={s.body} data-edge>{HERO.intro}</p>
            </section>
            {MOMENTS.map((mo, i) => {
              const m = i + 1
              return (
                <section key={mo.title} ref={el => { momentRefs.current[m] = el }} data-m={m} className={s.moment} aria-labelledby={`docsort-m${m}`}>
                  <p className={s.eyebrow} aria-hidden="true" data-edge>{String(m).padStart(2, '0')}</p>
                  <h2 id={`docsort-m${m}`} className={s.h2} data-edge>{mo.title}</h2>
                  <p className={s.body} data-edge>{mo.body}</p>
                  <Drawer items={mo.how} />
                </section>
              )
            })}
          </div>
          <div className={s.aside} role="region" aria-label="Filing tree and prompt">
            <div className={`${s.scaleBox} ${s.wideOnly}`} data-file>
              <Desk state={state} actions={actions} connectorKey={connectorKey} testRef={testRef} />
            </div>
            <div className={`${s.phoneBox} ${s.phoneOnly}`} data-file-phone>
              <PhoneDesk state={state} actions={actions} connectorKey={connectorKey} testRef={phoneTestRef} />
            </div>
          </div>
        </div>
        <div className={s.tail}>
          <p className={s.credit} data-edge>{COPY.credit}</p>
          <Link ref={endRef} href="/" className={s.backLink} data-edge>← Back to selected work</Link>
        </div>
      </div>
    </main>
  )
}
