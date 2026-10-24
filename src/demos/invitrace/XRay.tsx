'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { PATIENTS, XRAY } from './data'
import { TIER_LABEL, TIER_ORDER, lineage, type Tier, type TokenNode } from './lineage'
import type { Store } from './useInvitrace'
import s from './invitrace.module.css'

// Token lineage X-ray. The console splits into its four tiers as stacked planes (CSS 3D,
// transform only). Picking a part runs a beam through the exact token on each tier; a theme
// change sends a pulse along the computed dependency edges. Positions are measured only when
// the layout settles (open, resize, graph change), never per frame.

/** Which part of the console face carries each component token. */
const PART: Record<string, string> = {
  'console.surface': 'surface', 'header.stripe': 'stripe', 'alert.background': 'alert',
  'button.background': 'button', 'button.text': 'button', 'button.radius': 'button', 'button.minHeight': 'button',
  'field.label': 'label', 'field.border': 'input', 'field.error': 'input', 'table.text': 'name', 'table.rowPad': 'row', 'table.line': 'row',
  'focus.ring': 'ringRow', 'focus.ringOffset': 'ringRow', 'risk.high': 'riskH', 'risk.medium': 'riskM', 'risk.low': 'riskL',
  'card.background': 'card', 'card.radius': 'card', 'doctorCard.action': 'action', 'doctorCard.ring': 'card', 'fork.admitButtons': 'forks',
}
/** Clicking a part of the face picks its main token. */
const PART_PICK: Record<string, string> = {
  surface: 'console.surface', stripe: 'header.stripe', alert: 'alert.background', button: 'button.background', label: 'field.label',
  input: 'field.border', name: 'table.text', row: 'table.rowPad', ringRow: 'focus.ring', riskH: 'risk.high', riskM: 'risk.medium', riskL: 'risk.low',
  card: 'card.background', action: 'doctorCard.action',
}
const partOf = (id: string) => PART[id] ?? (id.startsWith('instance.') ? 'detached' : null)
const Z: Record<Tier, number> = { component: 250, semantic: 110, theme: -40, raw: -230 }
const Y: Record<Tier, number> = { component: -110, semantic: -30, theme: 50, raw: 235 }
/** The stack's geometry. There is no preserve-3d: each film gets its own transform built from
    these numbers (filmTransform), and the overlay projects with the same numbers (project), so
    what the browser paints and where the beam lands can't disagree in any engine. */
const SCENE = { w: 340, h: 310, tx: -64, ty: -36, s: 0.86, rx: 42, rz: -20, persp: 1600, oy: 0.3 }
const STAGE_H = { closed: 380, open: 830 }
const LIFT = 0
/** One film's transform: perspective about the stage's vanishing point, then the scene tilt, then
    the film's own offset. transform-origin is set to the vanishing point in film-local px. */
function filmTransform(t: Tier, open: boolean, planeTop: number, W: number, H: number) {
  const sceneLeft = (W - SCENE.w) / 2, sceneTop = (H - SCENE.h) / 2
  const ox = W / 2 - sceneLeft, oy = H * SCENE.oy - sceneTop - planeTop   // vanishing point, film-local
  const cx = SCENE.w / 2, cy = SCENE.h / 2 - planeTop                     // scene centre, film-local
  const [tx, ty, sc, rx, rz, y, z] = open ? [SCENE.tx, SCENE.ty, SCENE.s, SCENE.rx, SCENE.rz, Y[t], Z[t]] : [0, 0, 1, 0, 0, 0, 0]
  return {
    transformOrigin: `${ox}px ${oy}px`,
    transform: `perspective(${SCENE.persp}px) translate3d(${cx - ox}px, ${cy - oy}px, 0) translate(${tx}px, ${ty}px) scale(${sc}) rotateX(${rx}deg) rotateZ(${rz}deg) translate3d(0, ${y}px, ${z}px) translate3d(${ox - cx}px, ${oy - cy}px, 0)`,
  }
}
/** A point on a plane (plane-local px) → stage px, through the plane offset, the scene transform and the perspective. */
function project(px: number, py: number, planeTop: number, t: Tier, lift: number, W: number, H: number): Pt {
  let x = px - SCENE.w / 2, y = py + planeTop + Y[t] - SCENE.h / 2, z = Z[t] + lift
  const rz = (SCENE.rz * Math.PI) / 180, rx = (SCENE.rx * Math.PI) / 180
  ;[x, y] = [x * Math.cos(rz) - y * Math.sin(rz), x * Math.sin(rz) + y * Math.cos(rz)]
  ;[y, z] = [y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)]
  // scale() is 2D in CSS: it leaves z alone.
  x = x * SCENE.s + SCENE.tx; y = y * SCENE.s + SCENE.ty
  const ox = W / 2, oy = H * SCENE.oy, k = SCENE.persp / (SCENE.persp - z)
  return { x: ox + (W / 2 + x - ox) * k, y: oy + (H / 2 + y - oy) * k }
}
/** Offset of an element's centre inside its plane, from layout boxes (unaffected by 3D). */
function inPlane(el: HTMLElement, plane: HTMLElement) {
  let x = el.offsetWidth / 2, y = el.offsetHeight / 2
  for (let n: HTMLElement | null = el; n && n !== plane; n = n.offsetParent as HTMLElement | null) { x += n.offsetLeft; y += n.offsetTop }
  return { x, y }
}
type Pt = { x: number; y: number }
/** Keep beam labels from overlapping: each sits at least one label height below the last. */
function tagRows<T extends { p: Pt }>(list: T[]) {
  let last = -Infinity
  return list.map(c => { const y = Math.max(c.p.y, last + 58); last = y; return { ...c, y } })
}
type Mode = 'stack' | 'flat' | 'step'

export function XRay({ st }: { st: Store }) {
  const g = st.graph
  const [open, setOpen] = useState(false)
  const [settled, setSettled] = useState(false)
  const [mode, setMode] = useState<Mode>('stack')
  const [stepAt, setStepAt] = useState(0)
  const [stageW, setStageW] = useState(0)
  const [tops, setTops] = useState<Partial<Record<Tier, number>>>({})
  const [pts, setPts] = useState<{ w: number; h: number; at: Record<string, Pt & { hw: number }>; local: Record<string, { x: number; y: number; hw: number; top: number; tier: Tier }> } | null>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const face = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const capId = useId()

  const lin = useMemo(() => lineage(g, st.pick), [g, st.pick])
  const lit = useMemo(() => new Set(lin.chain.map(n => n.id)), [lin])
  const info = st.actions.lineageLines(st.pick)
  const pulse = st.pulse
  const reached = useMemo(() => new Set([...(pulse?.reached ?? []), ...(pulse?.roots.map(r => r.id) ?? [])]), [pulse])
  const depthOf = useMemo(() => { const m: Record<string, number> = {}; for (const e of pulse?.edges ?? []) m[e.to] = e.depth + 1; return m }, [pulse])
  const stopped = useMemo(() => new Map((pulse?.stopped ?? []).map(x => [x.id, x.why])), [pulse])
  // Rebuild the overlay only when the set of tokens or what they read changes.
  const shape = Object.values(g.nodes).map(n => `${n.id}>${n.ref}`).join('|')

  // Mode: 3D stack when there is room and motion is allowed; flat side by side under reduced
  // motion; one tier at a time on narrow screens.
  useEffect(() => {
    const el = wrap.current; if (!el) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pickMode = () => setMode(el.clientWidth < 560 ? 'step' : mq.matches ? 'flat' : 'stack')
    const ro = new ResizeObserver(pickMode); ro.observe(el)
    mq.addEventListener('change', pickMode)
    return () => { ro.disconnect(); mq.removeEventListener('change', pickMode) }
  }, [])

  // Stage width and each film's top (films are content-height, anchored to the scene bottom).
  // Layout reads only, on mount, resize and content change; never per frame.
  useEffect(() => {
    const st0 = stage.current; if (!st0 || mode !== 'stack') return
    const read = () => {
      setStageW(st0.clientWidth)
      const next: Partial<Record<Tier, number>> = {}
      st0.querySelectorAll<HTMLElement>('[data-tier]').forEach(el => { next[el.dataset.tier as Tier] = SCENE.h - el.offsetHeight })
      setTops(prev => (TIER_ORDER.every(t => prev[t] === next[t]) ? prev : next))
    }
    // Next frame: the browser lays out first, so a theme switch never forces a sync layout.
    const id = requestAnimationFrame(read)
    const ro = new ResizeObserver(read); ro.observe(st0)
    return () => { cancelAnimationFrame(id); ro.disconnect() }
  }, [mode, shape, st.resolved, lin.skipsTheme, lin.status])

  const measure = useCallback(() => {
    const st0 = stage.current; if (!st0) return
    const stack = st0.dataset.mode === 'stack'
    const W = st0.clientWidth, H = st0.clientHeight
    const r0 = st0.getBoundingClientRect()
    const at: Record<string, Pt & { hw: number }> = {}
    const local: Record<string, { x: number; y: number; hw: number; top: number; tier: Tier }> = {}
    st0.querySelectorAll<HTMLElement>('[data-node],[data-part]').forEach(el => {
      const key = el.dataset.node ?? `part:${el.dataset.part}`
      if (stack) {
        // Plane-local layout boxes only; the projection happens at render, so a pick reads no layout.
        const plane = el.closest<HTMLElement>('[data-tier]'); if (!plane) return
        const c = inPlane(el, plane)
        local[key] = { ...c, hw: el.offsetWidth / 2, top: SCENE.h - plane.offsetHeight, tier: plane.dataset.tier as Tier }
      } else {
        const r = el.getBoundingClientRect()
        at[key] = { x: r.left - r0.left + r.width / 2, y: r.top - r0.top + r.height / 2, hw: r.width / 2 }
      }
    })
    setPts({ w: W, h: H, at, local })
  }, [])

  const showOverlay = mode === 'flat' || (mode === 'stack' && open && settled)
  useEffect(() => {
    if (!showOverlay) return
    const id = requestAnimationFrame(measure)
    const st0 = stage.current
    const ro = new ResizeObserver(() => measure()); if (st0) ro.observe(st0)
    return () => { cancelAnimationFrame(id); ro.disconnect() }
  }, [showOverlay, shape, measure, st.resolved])
  // Safety net if a transitionend never arrives (tab in the background, for example).
  useEffect(() => {
    if (mode !== 'stack' || !open || settled) return
    const t = setTimeout(() => setSettled(true), 1300)
    return () => clearTimeout(t)
  }, [mode, open, settled])

  // The console face: pointer picks go through one native listener; the keyboard path is the
  // list of parts below, so the face itself stays out of the accessibility tree.
  const pickRef = useRef(st.actions.pickLineage); pickRef.current = st.actions.pickLineage
  useEffect(() => {
    const el = face.current; if (!el) return
    const on = (e: MouseEvent) => { const p = (e.target as HTMLElement).closest<HTMLElement>('[data-part]')?.dataset.part; const id = p && PART_PICK[p]; if (id) pickRef.current(id) }
    el.addEventListener('click', on)
    return () => el.removeEventListener('click', on)
  }, [mode, stepAt])

  const toggle = () => { const on = !open; setOpen(on); setSettled(false); st.actions.explode(on) }
  const elements = XRAY.elements
  const idx = Math.max(0, elements.findIndex(e => e.id === st.pick))
  const onListKey = (e: KeyboardEvent) => {
    const k = e.key
    const next = k === 'ArrowDown' || k === 'ArrowRight' ? idx + 1 : k === 'ArrowUp' || k === 'ArrowLeft' ? idx - 1 : k === 'Home' ? 0 : k === 'End' ? elements.length - 1 : null
    if (next === null) return
    e.preventDefault()
    const i = (next + elements.length) % elements.length
    st.actions.pickLineage(elements[i].id)
    list.current?.querySelectorAll<HTMLButtonElement>('button')[i]?.focus()
  }

  const tiers: Tier[] = mode === 'step' ? [TIER_ORDER[stepAt]] : TIER_ORDER
  const nodesOf = (t: Tier) => Object.values(g.nodes).filter(n => n.tier === t)
  /** A token's point on the overlay: its centre, or its right edge for leaders and stop marks. */
  const pointOf = (id: string, edge = false): Pt | undefined => {
    if (!pts) return undefined
    const n = g.nodes[id]
    const key = n?.tier === 'component' ? (partOf(id) ? `part:${partOf(id)}` : null) : id
    if (!key) return undefined
    const l = pts.local[key]
    if (l) return project(l.x + (edge ? l.hw : 0), l.y, l.top, l.tier, n?.tier !== 'component' && lit.has(id) ? LIFT : 0, pts.w, pts.h)
    const a = pts.at[key]
    return a && { x: a.x + (edge ? a.hw : 0), y: a.y }
  }
  const chainPts = lin.chain.map(n => ({ n, p: pointOf(n.id) })).filter((x): x is { n: TokenNode; p: Pt } => !!x.p)
  // When status skips the theme tier, the semantic → raw hop is drawn dashed so the skip shows in the beam.
  const skipAt = lin.skipsTheme ? chainPts.findIndex(c => c.n.tier === 'raw') : -1
  const solid = skipAt > 0 ? chainPts.slice(0, skipAt) : chainPts
  const beam = solid.map((c, i) => `${i ? 'L' : 'M'}${c.p.x.toFixed(1)} ${c.p.y.toFixed(1)}`).join(' ')
  const skipBeam = skipAt > 0 ? `M${chainPts[skipAt - 1].p.x} ${chainPts[skipAt - 1].p.y} L${chainPts[skipAt].p.x} ${chainPts[skipAt].p.y}` : null
  // Quiet graph: only the picked chain's fan-out shows (every token that reads a lit token);
  // the rest of the graph appears only as a pulse travels it.
  const edges = Object.values(g.nodes).filter(n => n.ref && lit.has(n.ref) && !lit.has(n.id)).map(n => ({ n, a: pointOf(n.ref!), b: pointOf(n.id) })).filter(e => e.a && e.b)
  const stack = mode === 'stack'
  const tags = pts && stack ? tagRows(chainPts) : []
  const gutter = pts ? pts.w - 178 : 0
  const lastPick = st.log.find(e => e.tier === 'Lineage')?.n ?? 0

  const chip = (n: TokenNode) => (
    <span key={`${n.id}-${reached.has(n.id) ? pulse?.n : 0}`} className={s.xChip} data-node={n.id} data-lit={lit.has(n.id) || undefined}
      data-pulse={reached.has(n.id) || undefined} style={{ '--d': `${(depthOf[n.id] ?? 0) * 320}ms` } as CSSProperties}>
      {n.colour && <i className={s.xSw} style={{ background: n.value }} />}
      {n.id}
    </span>
  )

  const Face = (
    <div ref={face} className={s.xFace} style={st.resolved.css as CSSProperties} data-part="surface" data-lit={lit.has('console.surface') || undefined}>
      <div className={s.xHead}>
        <i className={s.xStripe} data-part="stripe" data-lit={lit.has('header.stripe') || undefined} />
        <b>{st.hospital.name}</b>
        <span className={s.xCopies}>
          {g.nodes['fork.admitButtons'] && <span className={s.xCopy} data-part="forks">Forked copy</span>}
          {Object.keys(g.nodes).some(k => k.startsWith('instance.')) && <span className={s.xCopy} data-part="detached">Detached copy</span>}
        </span>
      </div>
      <div className={s.xAlert} data-part="alert" data-lit={lit.has('alert.background') || undefined}>! Critical alert</div>
      <div className={s.xRowFlex}>
        <span className={s.xBtn} data-part="button" data-lit={['button.background', 'button.text', 'button.radius', 'button.minHeight'].some(i => lit.has(i)) || undefined}>Admit patient</span>
        <span className={s.xHint}>{st.resolved.component['button.minHeight']}</span>
      </div>
      <span className={s.xLabel} data-part="label" data-lit={lit.has('field.label') || undefined}>Patient ID</span>
      <span className={s.xInput} data-error={st.fieldError || undefined} data-part="input" data-lit={lit.has('field.border') || undefined} />
      <div className={s.xTable}>
        {(['riskH', 'riskM', 'riskL'] as const).map((r, i) => (
          <div key={r} className={s.xTr} data-part={i === 0 ? 'ringRow' : i === 1 ? 'row' : undefined} data-ring={i === 0 || undefined}
            data-lit={(i === 0 ? lit.has('focus.ring') || lit.has('focus.ringOffset') : i === 1 && (lit.has('table.rowPad') || lit.has('table.line'))) || undefined}>
            <span className={s.xName} data-part={i === 2 ? 'name' : undefined} data-lit={(i === 2 && lit.has('table.text')) || undefined}>{PATIENTS[i]?.name}</span>
            <span className={s.xRisk} data-part={r} data-risk={r} data-lit={lit.has(PART_PICK[r]) || undefined}><i />{['High', 'Medium', 'Low'][i]}</span>
          </div>
        ))}
      </div>
      <div className={s.xCard} data-part="card" data-lit={(lit.has('card.background') || lit.has('card.radius')) || undefined}>
        <span>On call</span>
        <span className={s.xAction} data-part="action" data-lit={lit.has('doctorCard.action') || undefined}>Page</span>
      </div>
    </div>
  )

  const plane = (t: Tier, i: number) => (
    <div key={mode === 'step' ? `${t}-${stepAt}` : t} className={s.xPlane} data-tier={t}
      style={(mode === 'stack' && stageW ? { ...filmTransform(t, open, tops[t] ?? 0, stageW, open ? STAGE_H.open : STAGE_H.closed), zIndex: 4 - i, '--i': i } : { '--i': i }) as unknown as CSSProperties}
      aria-hidden="true">
      {/* Printed on the film: tier label, registration marks and the edge notch code. */}
      <p className={s.xPlaneHead}><span>T{4 - TIER_ORDER.indexOf(t)} {TIER_LABEL[t]}</span><span>{st.hospital.id}</span></p>
      <i className={s.xReg} data-c="tl" /><i className={s.xReg} data-c="tr" /><i className={s.xReg} data-c="bl" /><i className={s.xReg} data-c="br" />
      <span className={s.xNotch} data-n={4 - TIER_ORDER.indexOf(t)} />
      {t === 'component' ? Face : <div className={s.xChips}>{nodesOf(t).map(chip)}</div>}
      {t === 'theme' && lin.skipsTheme && <p className={s.xSkip}>{lin.status ? XRAY.notes.skipped : XRAY.notes.skippedShared}</p>}
    </div>
  )

  return (
    <div ref={wrap} className={s.xray}>
      <div className={s.row}>
        {mode === 'stack' && <button type="button" className={s.btn} aria-pressed={open} onClick={toggle}>{open ? 'Stack tiers' : 'Separate tiers'}</button>}
        {mode === 'step' && (
          <>
            <button type="button" className={s.btnQuiet} disabled={stepAt === 0} onClick={() => { const i = stepAt - 1; setStepAt(i); st.actions.stepTier(TIER_ORDER[i]) }}>Up a tier</button>
            <button type="button" className={s.btnQuiet} disabled={stepAt === 3} onClick={() => { const i = stepAt + 1; setStepAt(i); st.actions.stepTier(TIER_ORDER[i]) }}>Down a tier</button>
            <span className={s.mono} aria-live="off">{TIER_LABEL[TIER_ORDER[stepAt]]}, tier {4 - stepAt} of 4</span>
          </>
        )}
      </div>
      <div ref={stage} className={s.xStage} data-mode={mode} data-open={open || undefined}
        style={mode === 'stack' ? { height: open ? STAGE_H.open : STAGE_H.closed } : undefined}>
        <div className={s.xScene} data-open={open || undefined} style={mode === 'stack' ? { width: SCENE.w, height: SCENE.h } : undefined}
          onTransitionEnd={e => { if (e.propertyName === 'transform' && (e.target as HTMLElement).dataset.tier === 'raw') setSettled(open) }}>
          {tiers.map((t, i) => plane(t, i))}
        </div>
        {showOverlay && pts && (
          <svg className={s.xOverlay} width={pts.w} height={pts.h} viewBox={`0 0 ${pts.w} ${pts.h}`} aria-hidden="true">
            {edges.map(({ n, a, b }) => <path key={n.id} className={s.xEdge} data-stop={n.stop ? '' : undefined} d={`M${a!.x} ${a!.y} L${b!.x} ${b!.y}`} />)}
            {beam && <path key={`beam-${lastPick}-${st.pick}`} className={s.xBeam} d={beam} pathLength={1} />}
            {skipBeam && <path key={`skip-${lastPick}-${st.pick}`} className={s.xBeamSkip} d={skipBeam} />}
            {pulse && (
              <g key={`pulse-${pulse.n}`}>
                {pulse.edges.map(e => { const a = pointOf(e.from), b = pointOf(e.to); return a && b ? <path key={`${e.from}>${e.to}`} className={s.xPulse} pathLength={1} d={`M${a.x} ${a.y} L${b.x} ${b.y}`} style={{ animationDelay: `${e.depth * 320}ms` }} /> : null })}
                {pulse.edges.map(e => { const a = pointOf(e.from), b = pointOf(e.to); return a && b ? <path key={`base-${e.from}>${e.to}`} className={s.xPulseBase} d={`M${a.x} ${a.y} L${b.x} ${b.y}`} /> : null })}
                {pulse.stopped.map(x => { const e = pointOf(x.id, true); const p = e && { x: e.x + 10, y: e.y }; return p ? <g key={x.id} className={s.xStop} style={{ animationDelay: `${(depthOf[x.id] ?? 1) * 320}ms` }}><circle cx={p.x} cy={p.y} r="9" /><path d={`M${p.x - 4} ${p.y - 4} L${p.x + 4} ${p.y + 4} M${p.x + 4} ${p.y - 4} L${p.x - 4} ${p.y + 4}`} /></g> : null })}
              </g>
            )}
            {/* Leader lines from each lit token to its label in the right-hand gutter. */}
            {tags.map(({ n, y }) => { const e = pointOf(n.id, true); return e ? <path key={`lead-${n.id}`} className={s.xLead} d={`M${e.x + 2} ${e.y} L${gutter - 14} ${y} L${gutter - 4} ${y}`} /> : null })}
          </svg>
        )}
        {showOverlay && tags.map(({ n, y }, i) => (
          <span key={`${n.id}-${lastPick}`} className={s.xTag} aria-hidden="true"
            style={{ transform: `translate(${gutter}px, ${y}px) translateY(-50%)`, animationDelay: `${i * 90}ms` }}>
            <b>{TIER_LABEL[n.tier]}</b><span>{n.id}</span><span>{n.value}</span>
          </span>
        ))}
      </div>

      <div ref={list} className={s.xList} role="toolbar" aria-label="Console parts. Arrow keys move between parts." onKeyDown={onListKey}>
        {elements.map((el, i) => (
          <button key={el.id} type="button" className={s.xPart} aria-pressed={st.pick === el.id} aria-describedby={st.pick === el.id ? capId : undefined} tabIndex={i === idx ? 0 : -1} onClick={() => st.actions.pickLineage(el.id)}>{el.label}</button>
        ))}
      </div>

      <div className={s.xCaption} id={capId}>
        <p className={s.recHead}>{elements[idx]?.label}</p>
        <ol>{info.lines.map(l => <li key={l}>{l}</li>)}</ol>
        <p>{info.why}</p>
        {pulse && pulse.stopped.length > 0 && <ul className={s.xStops}>{pulse.stopped.map(x => <li key={x.id}>Stopped at {x.id}. {stopped.get(x.id)}</li>)}</ul>}
      </div>
    </div>
  )
}

/** The accessible equivalent: every part, tier by tier, in sync with the pick and the theme. */
export function LineageTable({ st }: { st: Store }) {
  return (
    // A sideways-scrolling region must be reachable by keyboard (WCAG 2.1.1).
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div className={s.tableWrap} tabIndex={0} role="region" aria-label="Lineage table, scrolls sideways">
      <table className={s.table}>
        <caption className={s.srOnly}>Each console part and the token it reads on every tier</caption>
        <thead><tr><th scope="col">Part</th>{TIER_ORDER.map(t => <th key={t} scope="col">{TIER_LABEL[t]}</th>)}</tr></thead>
        <tbody>
          {XRAY.elements.map(el => {
            const l = lineage(st.graph, el.id)
            return (
              <tr key={el.id} aria-current={st.pick === el.id || undefined} data-current={st.pick === el.id || undefined}>
                <th scope="row">{el.label}</th>
                {TIER_ORDER.map(t => { const n = l.at(t); return <td key={t}>{n ? <><span className={s.mono}>{n.id}</span> {n.value}</> : t === 'theme' && l.skipsTheme ? 'Skipped' : 'None'}</td> })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
