'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { FIELD } from './data'
import { chromaAxis, computeField, hexRatio, hexToOklch, maxChroma, nearestPassingOklch, oklchToHex, type FieldResult } from './oklch'
import type { Store } from './useInvitrace'
import s from './invitrace.module.css'

// Live contrast field. A lightness × chroma plane at one hue, every pixel shaded by the WCAG
// contrast of white button text on it, with the exact 4.5:1 line traced by marching squares.
// The plane paints in a Web Worker and only when the hue or the size changes. Dragging moves a
// handle (transform only); a drop below 4.5:1 snaps to the nearest passing point in OKLCH.

type HC = { L: number; C: number }
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const segPath = (f: Float32Array, k: number) => { let d = ''; for (let i = 0; i < f.length; i += 4) d += `M${(f[i] * k).toFixed(1)} ${(f[i + 1] * k).toFixed(1)}L${(f[i + 2] * k).toFixed(1)} ${(f[i + 3] * k).toFixed(1)}`; return d }
const grade = (r: number) => (r >= 4.5 ? 'passes' : r >= 3 ? 'large text only' : 'fails')

export function ContrastField({ st }: { st: Store }) {
  const start = hexToOklch(st.hospital.primary)
  const [hue, setHue] = useState(start.h)
  const [pt, setPt] = useState<HC>({ L: start.L, C: start.C })
  const [size, setSize] = useState(0)
  const [visible, setVisible] = useState(false)
  const [lines, setLines] = useState<{ pass: Float32Array; large: Float32Array } | null>(null)
  const [snapping, setSnapping] = useState(false)
  const [moved, setMoved] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const hueInput = useRef<HTMLInputElement>(null)
  const worker = useRef<Worker | null>(null)
  const job = useRef({ id: 0, busy: false, pending: null as null | { hue: number; w: number } })
  const strip = useRef<HTMLCanvasElement>(null)
  const hueTimer = useRef(0)
  const applied = useRef(st.hospital.primary)
  const drag = useRef<{ raf: number; x: number; y: number } | null>(null)

  // The chroma axis follows the hue's real gamut, so most of the plane is usable colour.
  const cMax = useMemo(() => chromaAxis(hue), [hue])
  const paths = useMemo(() => lines && { pass: segPath(lines.pass, size), large: segPath(lines.large, size) }, [lines, size])
  const hex = oklchToHex(pt.L, pt.C, hue)
  const ratio = hexRatio(hex)

  // Size from the box; paint only once the field is near the viewport.
  useEffect(() => {
    const el = box.current; if (!el) return
    const ro = new ResizeObserver(() => setSize(Math.round(el.clientWidth)))
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect() } }, { rootMargin: '300px' })
    io.observe(el)
    return () => { ro.disconnect(); io.disconnect() }
  }, [])

  const draw = useCallback((r: FieldResult) => {
    const c = canvas.current; if (!c) return
    c.width = r.w; c.height = r.h
    c.getContext('2d')?.putImageData(new ImageData(r.pixels as Uint8ClampedArray<ArrayBuffer>, r.w, r.h), 0, 0)
    setLines({ pass: r.pass, large: r.large })
  }, [])

  // One job in flight at a time; while busy, keep only the latest request. Snap replies carry
  // the id of the drop they answer, so a late reply can't be logged against a newer drop.
  const snaps = useRef(new Map<number, (r: { L: number; C: number; hex: string }) => void>())
  const snapId = useRef(0)
  const getWorker = useCallback(() => {
    if (worker.current) return worker.current
    try {
      worker.current = new Worker(new URL('./contrastField.worker.ts', import.meta.url))
      worker.current.onmessage = (e: MessageEvent<({ kind: 'field' } & FieldResult) | { kind: 'snap'; id: number; L: number; C: number; hex: string }>) => {
        const d = e.data
        if (d.kind === 'snap') { const f = snaps.current.get(d.id); snaps.current.delete(d.id); if (f && d.id === snapId.current) f(d); return }
        job.current.busy = false
        draw(d)
        const p = job.current.pending; job.current.pending = null
        if (p) request.current(p.hue, p.w)
      }
    } catch { worker.current = null }
    return worker.current
  }, [draw])
  const request = useRef((h: number, w: number) => {})
  request.current = (h: number, w: number) => {
    const j = job.current
    if (j.busy) { j.pending = { hue: h, w }; return }
    j.busy = true
    const id = ++j.id
    const wk = getWorker()
    const cm = chromaAxis(h)
    if (wk) { wk.postMessage({ kind: 'field', id, hue: h, w, h: w, cMax: cm }); return }
    setTimeout(() => {
      draw(computeField(id, h, w, w, cm)); j.busy = false
      const p = j.pending; j.pending = null
      if (p) request.current(p.hue, p.w)
    }, 0)
  }
  useEffect(() => () => worker.current?.terminate(), [])

  useEffect(() => {
    if (!visible || !size) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    request.current(hue, Math.round(size * dpr))
  }, [visible, size, hue])

  // Follow the theme when the colour changes elsewhere (swatches, hex, hospital switch).
  useEffect(() => {
    if (st.hospital.primary === applied.current) return
    applied.current = st.hospital.primary
    const o = hexToOklch(st.hospital.primary)
    setHue(o.h); setPt({ L: o.L, C: o.C }); setMoved(false)
  }, [st.hospital.primary])

  const commit = useCallback((p: HC, h: number) => {
    const tried = oklchToHex(p.L, p.C, h)
    const r = hexRatio(tried)
    setMoved(false)
    if (r >= 4.5) { applied.current = tried; st.actions.setPrimary(tried); return }
    // The nearest-passing search runs in the worker so the drop never blocks a frame.
    const id = ++snapId.current
    const done = (near: { L: number; C: number; hex: string }) => {
      setSnapping(true); setPt({ L: near.L, C: near.C })
      applied.current = near.hex
      st.actions.snapPrimary(tried, r, near.hex)
    }
    const wk = getWorker()
    if (wk) { snaps.current.set(id, done); wk.postMessage({ kind: 'snap', id, L: p.L, C: p.C, hue: h }) }
    else done(nearestPassingOklch(p.L, p.C, h))
  }, [st.actions, getWorker])
  const latest = useRef({ pt, hue, commit }); latest.current = { pt, hue, commit }

  // The hue slider commits on release (native change), and repaints the plane while it moves.
  useEffect(() => {
    const el = hueInput.current; if (!el) return
    // Arrow keys fire change on every step, so commits wait until the hue stops moving.
    const on = () => { clearTimeout(hueTimer.current); hueTimer.current = window.setTimeout(() => { const l = latest.current; l.commit(l.pt, l.hue) }, 450) }
    el.addEventListener('change', on)
    return () => { el.removeEventListener('change', on); clearTimeout(hueTimer.current) }
  }, [])

  // The hue strip behind the slider: painted once (canvas pixel op), at mid lightness and the
  // largest chroma every hue can hold, so it reads as the hue alone.
  useEffect(() => {
    const c = strip.current; if (!c) return
    c.width = 360; c.height = 1
    const ctx = c.getContext('2d'); if (!ctx) return
    for (let h = 0; h < 360; h++) { ctx.fillStyle = oklchToHex(0.62, Math.min(0.13, maxChroma(0.62, h)), h); ctx.fillRect(h, 0, 1, 1) }
  }, [])

  const fromPointer = (x: number, y: number): HC => {
    const L = clamp(1 - y / size, 0, 1)
    return { L, C: Math.min(clamp((x / size) * cMax, 0, cMax), maxChroma(L, hue)) }
  }
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!size) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const r = e.currentTarget.getBoundingClientRect()
    setSnapping(false)
    drag.current = { raf: 0, x: e.clientX - r.left, y: e.clientY - r.top }
    setPt(fromPointer(drag.current.x, drag.current.y))
    e.currentTarget.querySelector<HTMLElement>('[role="slider"]')?.focus({ preventScroll: true })
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current; if (!d) return
    const r = e.currentTarget.getBoundingClientRect()
    d.x = e.clientX - r.left; d.y = e.clientY - r.top
    if (!d.raf) d.raf = requestAnimationFrame(() => { d.raf = 0; setPt(fromPointer(d.x, d.y)) })
  }
  const onUp = () => {
    const d = drag.current; if (!d) return
    if (d.raf) cancelAnimationFrame(d.raf)
    drag.current = null
    const p = fromPointer(d.x, d.y)
    setPt(p); commit(p, hue)
  }
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const big = e.shiftKey
    const dL = e.key === 'ArrowUp' ? 0.01 : e.key === 'ArrowDown' ? -0.01 : 0
    const dC = e.key === 'ArrowRight' ? 0.004 : e.key === 'ArrowLeft' ? -0.004 : 0
    if (e.key === 'Enter') { e.preventDefault(); commit(pt, hue); return }
    if (!dL && !dC) return
    e.preventDefault(); setSnapping(false); setMoved(true)
    const L = clamp(pt.L + dL * (big ? 5 : 1), 0, 1)
    setPt({ L, C: Math.min(clamp(pt.C + dC * (big ? 5 : 1), 0, cMax), maxChroma(L, hue)) })
  }

  const x = (pt.C / cMax) * size, y = (1 - pt.L) * size
  // Hospitals sit on the hue strip; one is drawn on the plane only when it shares this hue.
  const marks = st.hospitals.map(h => ({ h, o: hexToOklch(h.primary) }))
  const near = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180) <= 10
  const others = marks.filter(m => m.h.id !== st.active && near(m.o.h, hue))
  const legend = oklchToHex(0.5, Math.min(0.12, maxChroma(0.5, hue)), hue)
  // Graph paper: a rule every 0.05 L and 0.01 C, heavier every 0.2 L and 0.05 C; ticks print the values.
  const grid = useMemo(() => {
    if (!size) return null
    const lines: { d: string; major: boolean }[] = []
    for (let i = 0; i <= 20; i++) { const yy = Math.round((i / 20) * size) + 0.5; lines.push({ d: `M0 ${yy}H${size}`, major: i % 4 === 0 }) }
    for (let c = 0; c <= cMax + 1e-9; c += 0.01) { const xx = Math.round((c / cMax) * size) + 0.5; lines.push({ d: `M${xx} 0V${size}`, major: Math.round(c * 100) % 5 === 0 }) }
    const lTicks = [0, 0.2, 0.4, 0.6, 0.8, 1].map(L => ({ v: L.toFixed(1), at: (1 - L) * size }))
    const cTicks: { v: string; at: number }[] = []
    for (let c = 0; c <= cMax + 1e-9; c += 0.05) cTicks.push({ v: c.toFixed(2), at: (c / cMax) * size })
    return { minor: lines.filter(l => !l.major).map(l => l.d).join(''), major: lines.filter(l => l.major).map(l => l.d).join(''), lTicks, cTicks }
  }, [size, cMax])
  // The reticle's readout sits under it (above near the bottom), clamped inside the chart.
  const TAG_W = 236
  const tagX = Math.max(4, Math.min(size - TAG_W - 4, x - TAG_W / 2)), tagY = y > size - 48 ? y - 40 : y + 20
  return (
    <div className={s.field} style={{ '--lg': legend } as CSSProperties}>
      <p className={s.note}>{FIELD.intro}</p>
      <label className={s.fieldHue}>
        <span>Hue <span className={s.mono}>{Math.round(hue)}°</span></span>
        {/* The painted strip is the slider's track; the native input sits on it with a square tick. */}
        <span className={s.fieldTrack}>
          <span className={s.fieldStrip} aria-hidden="true">
            <canvas ref={strip} />
            {marks.map(({ h, o }) => <i key={h.id} data-on={h.id === st.active || undefined} style={{ left: `${(o.h / 360) * 100}%`, '--m': h.primary } as CSSProperties} />)}
          </span>
          <input ref={hueInput} className={s.fieldRange} type="range" min={0} max={359} step={1} value={Math.round(hue)}
            onChange={e => { const h = Number(e.target.value); setHue(h); setSnapping(false); setPt(p => ({ L: p.L, C: Math.min(p.C, maxChroma(p.L, h)) })) }} />
        </span>
      </label>
      <div className={s.fieldWrap}>
        <span className={s.fieldAxisY} aria-hidden="true">Lightness L</span>
        <div className={s.fieldPlot}>
        {grid && (
          <>
            <span className={s.fieldTicksY} aria-hidden="true">{grid.lTicks.map(tk => <span key={tk.v} style={{ top: tk.at }}>{tk.v}</span>)}</span>
            <span className={s.fieldTicksX} aria-hidden="true">{grid.cTicks.map(tk => <span key={tk.v} style={{ left: tk.at }}>{tk.v}</span>)}</span>
          </>
        )}
        <div ref={box} className={s.fieldBox} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <canvas ref={canvas} className={s.fieldCanvas} aria-hidden="true" />
          {grid && (
            <svg className={s.fieldLines} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" shapeRendering="crispEdges">
              <path d={grid.minor} className={s.fieldGridMinor} />
              <path d={grid.major} className={s.fieldGridMajor} />
            </svg>
          )}
          {paths && (
            <svg className={s.fieldLines} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
              <path d={paths.large} className={s.fieldLarge} />
              <path d={paths.pass} className={s.fieldPass} />
            </svg>
          )}
          {others.map(({ h, o }, i) => (
            <span key={h.id} className={s.fieldMarker} aria-hidden="true" data-side={(Math.min(o.C, cMax) / cMax) * size > size - 120 ? 'l' : undefined} style={{ transform: `translate(${(Math.min(o.C, cMax) / cMax) * size}px, ${(1 - o.L) * size}px)`, '--m': h.primary, '--ly': i % 2 ? '6px' : '-22px' } as CSSProperties}>
              <i /><span>{h.name}</span>
            </span>
          ))}
          <div role="slider" tabIndex={0} className={s.fieldHandle} data-snap={snapping || undefined} data-grade={grade(ratio)}
            aria-label="Brand colour, lightness and chroma" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pt.L * 100)}
            aria-valuetext={`${hex}, ${ratio.toFixed(2)} to 1, ${grade(ratio)}`} onKeyDown={onKey}
            style={{ transform: `translate(${x}px, ${y}px)`, '--h': hex } as CSSProperties}
            onTransitionEnd={() => setSnapping(false)} />
          <span className={s.fieldTag} data-snap={snapping || undefined} data-grade={grade(ratio)} aria-hidden="true" style={{ transform: `translate(${tagX}px, ${tagY}px)` }}>
            {ratio.toFixed(2)} : 1 · L {pt.L.toFixed(2)} C {pt.C.toFixed(2)} h {Math.round(hue)}
          </span>
        </div>
        </div>
        <span className={s.fieldAxisX} aria-hidden="true">Chroma C</span>
      </div>
      <p className={s.fieldRead} data-grade={grade(ratio)}>
        <span className={s.dot} style={{ background: hex }} aria-hidden="true" />
        <span className={s.mono}>{hex}</span> {ratio.toFixed(2)}:1, {grade(ratio)}
        {moved && <button type="button" className={s.btnQuiet} onClick={() => commit(pt, hue)}>Apply this colour</button>}
      </p>
      <ul className={s.fieldLegend}>
        <li><i data-k="pass" />{FIELD.legend.pass}</li>
        <li><i data-k="large" />{FIELD.legend.large}</li>
        <li><i data-k="fail" />{FIELD.legend.fail}</li>
        <li><i data-k="gamut" />{FIELD.legend.gamut}</li>
        <li><i data-k="line" />4.5:1 boundary</li>
        <li><i data-k="dash" />3:1 boundary</li>
      </ul>
      <p className={s.sample}>{FIELD.keys} {FIELD.others}</p>
    </div>
  )
}
