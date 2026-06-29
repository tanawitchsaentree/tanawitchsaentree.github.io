'use client'

import { useEffect, useRef, useCallback } from 'react'
import { T } from './tokens'

// ── KDS Rail ─────────────────────────────────────────────────────────────────
const TARGET = 40

const POOL = [
  { type: 'hot',  name: 'XL triple-triple', mod: 'extra hot', flag: true },
  { type: 'cold', name: 'L Iced Capp',       mod: 'espresso shot' },
  { type: 'hot',  name: '½ coffee · ½ FV' },
  { type: 'box',  name: 'Box of Joe',         mod: '+ dozen Timbits' },
  { type: 'bag',  name: 'Bagel BELT',         mod: 'toasted' },
  { type: 'hot',  name: 'L Steeped Tea',      mod: '2 milk' },
  { type: 'hot',  name: 'M Double-Double' },
  { type: 'bag',  name: "Farmer's Wrap",      mod: 'no tomato', flag: true },
  { type: 'box',  name: 'Timbits ×20' },
  { type: 'cold', name: 'L Iced Coffee',      mod: 'oat, no sugar' },
  { type: 'hot',  name: 'XL Dark Roast',      mod: '4 cream 4 sugar' },
  { type: 'cold', name: 'M Quencher',         mod: 'half sweet' },
] as const

const ICONS: Record<string, string> = {
  hot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M17 10h2a2 2 0 0 1 0 4h-2"/><path d="M8 3c-.5 1 .5 2 0 3M12 3c-.5 1 .5 2 0 3"/></svg>`,
  cold:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1.2 11a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8z"/><path d="M5 8h14M10 4v3M14 4v3"/></svg>`,
  box: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l2-4h14l2 4M3 8v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8M3 8h18M12 4v16"/></svg>`,
  bag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>`,
}

function fmt(s: number) {
  const m = (s / 60) | 0
  const r = s % 60
  return m > 0 ? `${m}:${String(r).padStart(2, '0')}` : `${s}s`
}
function rampColor(e: number) {
  const stops: [number, [number, number, number]][] = [
    [0,    [122, 168, 78]],
    [0.45, [178, 176, 72]],
    [0.72, [230, 163, 60]],
    [1.0,  [216,  71, 58]],
  ]
  const t = Math.min(e / TARGET, 1)
  for (let i = 0; i < stops.length - 1; i++) {
    if (t <= stops[i + 1][0]) {
      const [pa, ca] = stops[i]; const [pb, cb] = stops[i + 1]
      const k = (t - pa) / ((pb - pa) || 1)
      const c = ca.map((v, j) => Math.round(v + (cb[j] - v) * k))
      return `rgb(${c[0]},${c[1]},${c[2]})`
    }
  }
  return 'rgb(216,71,58)'
}
function zoneLabel(e: number) {
  if (e >= TARGET) return 'OVER'
  if (e >= TARGET * 0.7) return 'GETTING LATE'
  if (e >= TARGET * 0.4) return 'WAITING'
  return 'FRESH'
}
function pickItems(n: number) {
  const a = [...POOL]; const out = []
  for (let i = 0; i < n && a.length; i++) out.push(a.splice((Math.random() * a.length) | 0, 1)[0])
  return out
}

interface Order { id: string; car: number; items: ReturnType<typeof pickItems>; elapsed: number; el: HTMLDivElement | null }

function buildTicket(o: Order): HTMLDivElement {
  const el = document.createElement('div')
  el.className = 'tims-tk'; el.dataset.id = o.id
  el.innerHTML = `
    <div class="tims-tk-hd"><span class="tims-tk-st"></span><span class="tims-tk-tm"></span></div>
    <div class="tims-tk-car">Car ${o.car}</div>
    <div class="tims-tk-items">
      ${o.items.map(it => `
        <div class="tims-tk-it">
          <span class="tims-tk-ic">${ICONS[it.type]}</span>
          <span>
            <span class="tims-tk-nm">${it.name}</span>
            ${'mod' in it && it.mod ? `<span class="tims-tk-mod${(it as { flag?: boolean }).flag ? ' tims-tk-flag' : ''}">${it.mod}</span>` : ''}
          </span>
        </div>`).join('')}
    </div>`
  o.el = el
  return el
}

function KdsRail() {
  const railRef  = useRef<HTMLDivElement>(null)
  const queueEl  = useRef<HTMLSpanElement>(null)
  const overEl   = useRef<HTMLSpanElement>(null)
  const servedEl = useRef<HTMLSpanElement>(null)
  const ordersRef = useRef<Order[]>([])
  let   carRef    = useRef(37)
  let   servedRef = useRef(0)
  const MAX = 6

  const refresh = useCallback(() => {
    ordersRef.current.forEach((o, i) => {
      if (!o.el) return
      const front = i === 0
      const zone  = front ? 'window' : (o.elapsed >= TARGET ? 'over' : o.elapsed >= TARGET * 0.7 ? 'late' : o.elapsed >= TARGET * 0.4 ? 'wait' : 'fresh')
      if (o.el.dataset.zone !== zone) o.el.dataset.zone = zone
      if (front) o.el.style.removeProperty('--tkc')
      else       o.el.style.setProperty('--tkc', rampColor(o.elapsed))
      const stEl = o.el.querySelector('.tims-tk-st')!
      const stHtml = front ? '■ AT WINDOW' : `<span class="tims-tk-dot"></span>${zoneLabel(o.elapsed)}`
      if (stEl.innerHTML !== stHtml) stEl.innerHTML = stHtml
      o.el.querySelector('.tims-tk-tm')!.textContent = fmt(o.elapsed)
    })
    if (queueEl.current)  queueEl.current.textContent  = String(ordersRef.current.length)
    if (overEl.current)   overEl.current.textContent   = String(ordersRef.current.filter(o => o.elapsed >= TARGET).length)
  }, [])

  const flip = useCallback((mutate: () => void) => {
    const rail = railRef.current; if (!rail) return
    const nodes = [...rail.querySelectorAll<HTMLElement>('.tims-tk')]
    const first = new Map(nodes.map(n => [n, n.getBoundingClientRect()]))
    mutate()
    rail.querySelectorAll<HTMLElement>('.tims-tk').forEach(n => {
      const f = first.get(n); if (!f) return
      const l = n.getBoundingClientRect()
      const dx = f.left - l.left, dy = f.top - l.top
      if (!dx && !dy) return
      n.style.transition = 'none'
      n.style.transform  = `translate(${dx}px,${dy}px)`
      n.getBoundingClientRect()
      requestAnimationFrame(() => { n.style.transition = ''; n.style.transform = '' })
    })
  }, [])

  const arrive = useCallback(() => {
    const rail = railRef.current; if (!rail || ordersRef.current.length >= MAX) return
    const o: Order = { id: Math.random().toString(36).slice(2, 7), car: ++carRef.current, items: pickItems(1 + ((Math.random() * 2) | 0)), elapsed: 0, el: null }
    buildTicket(o)
    o.el!.classList.add('tims-tk-arriving')
    flip(() => { rail.appendChild(o.el!); ordersRef.current.push(o) })
    requestAnimationFrame(() => { o.el!.getBoundingClientRect(); o.el!.classList.remove('tims-tk-arriving') })
    refresh()
  }, [flip, refresh])

  const bump = useCallback(() => {
    const orders = ordersRef.current; if (!orders.length) return
    const o = orders[0]
    servedRef.current++
    if (servedEl.current) servedEl.current.textContent = `${servedRef.current} cleared`
    o.el!.classList.add('tims-tk-leaving')
    setTimeout(() => {
      flip(() => { o.el!.remove(); ordersRef.current.shift() })
      refresh()
    }, 340)
  }, [flip, refresh])

  useEffect(() => {
    const rail = railRef.current; if (!rail) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

    // seed initial orders
    ;[44, 39, 30, 21, 12, 5].forEach(e => {
      const o: Order = { id: Math.random().toString(36).slice(2, 7), car: ++carRef.current, items: pickItems(1 + ((Math.random() * 2) | 0)), elapsed: e, el: null }
      buildTicket(o)
      rail.appendChild(o.el!)
      ordersRef.current.push(o)
    })
    refresh()

    if (!reduce) {
      const tick = setInterval(() => {
        ordersRef.current.forEach(o => o.elapsed++)
        refresh()
      }, 1000)
      const loop = setInterval(() => {
        if (ordersRef.current.length >= MAX) { bump(); setTimeout(arrive, 520) }
        else arrive()
      }, 6500)
      return () => { clearInterval(tick); clearInterval(loop) }
    }
  }, [arrive, bump, refresh])

  return (
    <div style={{ background: '#181410', borderRadius: 26, padding: 'clamp(1.1rem,2vw,1.5rem)', display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', flexWrap: 'wrap', padding: '.2rem .4rem .9rem', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
        <span style={{ fontFamily: T.font.mono, fontSize: '.7rem', letterSpacing: '.18em', textTransform: 'uppercase', color: '#e9ddc9', display: 'flex', alignItems: 'center', gap: '.55em' }}>
          <span className="tims-kds-live" />
          Drive-thru KDS · morning rush
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1.1rem' }}>
          <div style={{ fontFamily: T.font.mono, fontSize: '.66rem', letterSpacing: '.06em', color: '#9b907e', textAlign: 'right' }}>
            In queue<b style={{ display: 'block', fontSize: '1.15rem', color: '#f3ede2', letterSpacing: 0, lineHeight: 1.1 }} ref={queueEl}>0</b>
          </div>
          <div style={{ fontFamily: T.font.mono, fontSize: '.66rem', letterSpacing: '.06em', color: '#9b907e', textAlign: 'right' }}>
            Over target<b style={{ display: 'block', fontSize: '1.15rem', color: T.color.red, letterSpacing: 0, lineHeight: 1.1 }} ref={overEl}>0</b>
          </div>
        </div>
      </div>

      {/* rail */}
      <div
        ref={railRef}
        className="tims-rail"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridTemplateRows: 'repeat(2,1fr)', gap: '.7rem', padding: '1rem .4rem', height: 396 }}
      />

      {/* bump bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', padding: '.9rem .4rem 0', borderTop: '1px solid rgba(255,255,255,.07)', marginTop: '.2rem' }}>
        <button
          onClick={bump}
          className="tims-bump-btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '.5em', background: T.color.green, color: '#16210a', border: 0, fontFamily: T.font.mono, fontWeight: 700, fontSize: '.74rem', letterSpacing: '.06em', textTransform: 'uppercase', padding: '.7rem 1.2rem', borderRadius: 11, cursor: 'pointer' }}
        >
          ✓ Bump served
        </button>
        <span style={{ fontFamily: T.font.mono, fontSize: '.66rem', letterSpacing: '.05em', color: '#857b6b' }}>
          Clear the car at the window. <b style={{ color: '#cabfad' }} ref={servedEl}>0 cleared</b>
        </span>
      </div>
    </div>
  )
}

// ── Decode panel ──────────────────────────────────────────────────────────────
const DECODE_ORDERS = [
  { say: '"Large double-double, extra hot — and a 10-pack of Timbits."', taps: ['Large', 'Coffee', 'Cream ×2', 'Sugar ×2', 'Extra hot', 'Timbits 10'] },
  { say: '"Medium French Vanilla, and a BELT on a bagel, toasted."',     taps: ['Medium', 'Fr. Vanilla', 'BELT', 'Bagel', 'Toasted'] },
  { say: '"Two XL coffees — one black, one triple-triple."',             taps: ['XL Coffee', 'Black', 'XL Coffee', 'Cream ×3', 'Sugar ×3'] },
] as const

function DecodePanel() {
  const spokenRef = useRef<HTMLParagraphElement>(null)
  const tapsRef   = useRef<HTMLDivElement>(null)
  const idxRef    = useRef(0)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

    function show(o: typeof DECODE_ORDERS[number]) {
      timersRef.current.forEach(clearTimeout); timersRef.current = []
      if (spokenRef.current) {
        spokenRef.current.textContent = o.say
        spokenRef.current.style.animation = 'none'
        void spokenRef.current.offsetWidth
        spokenRef.current.style.animation = ''
      }
      if (tapsRef.current) {
        tapsRef.current.innerHTML = o.taps.map(t => `<span class="tims-tap">${t}</span>`).join('')
        const chips = [...tapsRef.current.querySelectorAll<HTMLElement>('.tims-tap')]
        if (reduce) chips.forEach(c => c.classList.add('tims-tap-lit'))
        else chips.forEach((c, k) => {
          timersRef.current.push(setTimeout(() => c.classList.add('tims-tap-lit'), 420 + k * 340))
        })
      }
    }

    function cycle() { show(DECODE_ORDERS[idxRef.current]); idxRef.current = (idxRef.current + 1) % DECODE_ORDERS.length }
    cycle()
    const iv = reduce ? 0 : setInterval(cycle, 8200)
    return () => { clearInterval(iv); timersRef.current.forEach(clearTimeout) }
  }, [])

  return (
    <div style={{ position: 'relative', background: 'radial-gradient(120% 100% at 80% 0%,#2a221b,#15110d 60%)', borderRadius: 26, padding: 'clamp(1.5rem,3vw,2.2rem)', color: '#f3ede2', overflow: 'hidden', isolation: 'isolate' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 50% at 85% 8%,rgba(230,163,60,.2),transparent 70%)', zIndex: -1, pointerEvents: 'none' }} />

      {/* live pip */}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.55em', fontFamily: T.font.mono, fontSize: '.66rem', letterSpacing: '.2em', textTransform: 'uppercase', color: '#d6cdbd' }}>
        <span className="tims-decode-pip" />
        The order, decoded
      </span>

      <h3 style={{ fontFamily: T.font.display, fontWeight: 800, fontSize: 'clamp(1.5rem,3.6vw,2.05rem)', lineHeight: 1.12, letterSpacing: '-.02em', margin: '1.1rem 0 2rem', color: '#f3ede2' }}>
        You don't type the order. <span style={{ color: T.color.gold }}>You translate it — fast.</span>
      </h3>

      <div style={{ fontFamily: T.font.mono, fontSize: '.6rem', letterSpacing: '.18em', textTransform: 'uppercase', color: '#988d7c', marginBottom: '.7rem' }}>
        What the customer says
      </div>
      <p ref={spokenRef} className="tims-spoken" style={{ fontFamily: T.font.display, fontWeight: 700, fontSize: 'clamp(1.15rem,2.8vw,1.55rem)', lineHeight: 1.34, color: '#f3ede2', margin: '0 0 1.7rem', minHeight: '3.5em' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '.7em', fontFamily: T.font.mono, fontSize: '.63rem', letterSpacing: '.08em', textTransform: 'uppercase', color: '#8c8170', marginBottom: '1.1rem' }}>
        <span style={{ flex: 'none', width: 20, height: 1, background: '#5a5145', display: 'inline-block' }} />
        becomes the buttons I have to find
      </div>
      <div style={{ fontFamily: T.font.mono, fontSize: '.6rem', letterSpacing: '.18em', textTransform: 'uppercase', color: '#988d7c', marginBottom: '.7rem' }}>
        What I press
      </div>

      <div ref={tapsRef} style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', minHeight: '6rem', alignContent: 'flex-start' }} />

      <p style={{ marginTop: '1.5rem', fontSize: '.92rem', lineHeight: 1.5, color: '#b3a896', maxWidth: '44ch' }}>
        One breath from the customer turns into a handful of taps for me — found and hit before the next car. The screen's only job is to make that translation{' '}
        <b style={{ color: '#f3ede2' }}>disappear</b>.
      </p>
    </div>
  )
}

// ── Takeaway cards ────────────────────────────────────────────────────────────
const TAKES = [
  {
    icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M7 8h10M7 8a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4M7 8l1 11a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-11"/></svg>,
    title: 'The language is the product.',
    body:  '"Large triple-triple, extra hot, half steeped tea" — my job was to turn that into the right taps before the next car rolled up.',
  },
  {
    icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx={12} cy={13} r={8}/><path d="M12 9v4l2.5 2.5M12 1h0M9 1h6"/></svg>,
    title: "Speed isn't an opinion.",
    body:  'It was a glowing number on the wall, judging me on every single car. The screen had to keep up with my hands, not the other way around.',
  },
  {
    icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
    title: 'One waffler taxes everyone.',
    body:  '"Make it medium… no, iced." On a slow screen, that one change makes the whole line wait. Every interaction had a queue behind it.',
  },
] as const

export function TimsProblem() {
  return (
    <section id="problem" style={{ padding: 'clamp(5rem,13vw,11rem) 0', background: T.color.cream2, fontFamily: T.font.sans }}>
      <style>{`
        .tims-kds-live{width:7px;height:7px;border-radius:50%;background:#86a24e;box-shadow:0 0 8px #86a24e;animation:timsKdsBlink 1.6s steps(2) infinite;display:inline-block}
        @keyframes timsKdsBlink{50%{opacity:.35}}
        .tims-decode-pip{width:8px;height:8px;border-radius:50%;background:#e6a33c;display:inline-block;animation:timsDecPip 2s cubic-bezier(.4,0,.2,1) infinite}
        @keyframes timsDecPip{0%{box-shadow:0 0 0 0 rgba(230,163,60,.55)}70%{box-shadow:0 0 0 9px rgba(230,163,60,0)}100%{box-shadow:0 0 0 0 rgba(230,163,60,0)}}
        .tims-spoken{animation:timsSpokenIn .5s cubic-bezier(.4,0,.2,1)}
        @keyframes timsSpokenIn{from{opacity:0;transform:translateY(8px)}}
        .tims-tap{display:inline-flex;align-items:center;background:#2a231b;border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:.55rem .85rem;font-family:'DM Sans',sans-serif;font-size:.85rem;font-weight:600;color:#b3a896;opacity:.32;transform:translateY(5px);transition:opacity .35s cubic-bezier(.4,0,.2,1),transform .42s cubic-bezier(.16,1,.3,1),background .35s,color .35s,box-shadow .35s,border-color .35s}
        .tims-tap.tims-tap-lit{opacity:1;transform:none;background:linear-gradient(135deg,#e6a33c,#c9832a);color:#241803;border-color:transparent;box-shadow:0 6px 16px -6px rgba(230,163,60,.55)}
        .tims-tk{background:#221c16;border:1px solid rgba(255,255,255,.07);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;min-height:0;transition:transform .52s cubic-bezier(.16,1,.3,1),opacity .42s cubic-bezier(.4,0,.2,1),border-color .3s;will-change:transform;--tkc:#7aa84e;border-color:color-mix(in srgb,var(--tkc) 38%,rgba(255,255,255,.07))}
        .tims-tk-arriving{opacity:0;transform:translateX(54px) scale(.92)}
        .tims-tk-leaving{opacity:0;transform:scale(.9) translateY(-10px);transition:opacity .34s cubic-bezier(.4,0,.2,1),transform .34s cubic-bezier(.4,0,.2,1)}
        .tims-tk-hd{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.5rem .7rem;font-family:'Space Mono',monospace;font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;background:linear-gradient(90deg,color-mix(in srgb,var(--tkc) 20%,transparent),transparent);color:var(--tkc)}
        .tims-tk-st{font-weight:700;display:flex;align-items:center;gap:.45em;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .tims-tk-dot{flex:none;width:7px;height:7px;border-radius:50%;background:currentColor;box-shadow:0 0 7px currentColor;display:inline-block}
        .tims-tk-tm{font-variant-numeric:tabular-nums;font-weight:700;flex:none}
        .tims-tk[data-zone="window"]{--tkc:#e6a33c;border-color:color-mix(in srgb,var(--tkc) 55%,rgba(255,255,255,.07))}
        .tims-tk[data-zone="over"]{animation:timsKdsPulse 1.5s cubic-bezier(.4,0,.2,1) infinite}
        @keyframes timsKdsPulse{0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 0 2px color-mix(in srgb,var(--tkc) 45%,transparent)}}
        .tims-tk-car{font-family:'Space Mono',monospace;font-size:.64rem;letter-spacing:.1em;color:#8c8170;padding:0 .7rem .1rem}
        .tims-tk-items{padding:.5rem .7rem .8rem;display:flex;flex-direction:column;gap:.55rem}
        .tims-tk-it{display:flex;gap:.5rem;align-items:flex-start}
        .tims-tk-ic{flex:none;width:18px;height:18px;color:#cabfad;opacity:.85;margin-top:1px}
        .tims-tk-nm{font-size:.84rem;color:#ece4d6;line-height:1.25;font-weight:500}
        .tims-tk-mod{display:block;font-size:.72rem;color:#9a8f7d;margin-top:.12rem}
        .tims-tk-flag{color:#e6a33c}
        .tims-bump-btn:hover{transform:translateY(-2px);filter:brightness(1.08)}
        .tims-bump-btn:active{transform:translateY(0)}
        .tims-bump-btn{transition:transform .18s cubic-bezier(.16,1,.3,1),filter .2s}
        @media(max-width:900px){.tims-prob-stage{grid-template-columns:1fr!important}}
        @media(max-width:760px){.tims-takes-row{grid-template-columns:1fr!important}}
      `}</style>

      <div className="tims-wrap tims-animate">
        <div style={{ marginBottom: 'clamp(2.4rem,6vw,4rem)' }}>
          <span className="tims-label-section">What the job taught me</span>
          <h2 style={{ fontFamily: T.font.display, fontWeight: 800, fontSize: T.size.display, letterSpacing: '-.03em', lineHeight: 1.02, margin: '1.1rem 0 .9rem', maxWidth: '18ch', color: T.color.ink }}>
            8 a.m. The line is eight cars deep.
          </h2>
          <p style={{ fontSize: 'clamp(1.05rem,2.2vw,1.28rem)', color: T.color.inkSoft, maxWidth: '46ch' }}>
            This is the moment a POS earns its keep — or quietly loses you the timer. The screen below is the one I actually read, order after order.
          </p>
        </div>

        {/* stage */}
        <div className="tims-prob-stage" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,5fr) minmax(0,7fr)', gap: 'clamp(1rem,2.2vw,1.6rem)', marginTop: 'clamp(2.4rem,5vw,3.6rem)' }}>
          <DecodePanel />
          <KdsRail />
        </div>

        {/* takeaway cards */}
        <div className="tims-takes-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'clamp(.9rem,2vw,1.4rem)', marginTop: 'clamp(1rem,2.2vw,1.6rem)' }}>
          {TAKES.map(tk => (
            <div key={tk.title} style={{ background: '#fffdf9', border: `1px solid ${T.alpha.line}`, borderRadius: 18, padding: 'clamp(1.2rem,2.4vw,1.6rem)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: T.color.cream2, display: 'grid', placeContent: 'center', color: T.color.ink, marginBottom: '1rem' }}>
                {tk.icon}
              </div>
              <p style={{ fontSize: '.97rem', lineHeight: 1.5, color: T.color.inkSoft }}>
                <b style={{ color: T.color.ink }}>{tk.title}</b>{' '}{tk.body}
              </p>
            </div>
          ))}
        </div>

        <p className="tims-animate" style={{ fontFamily: T.font.display, fontWeight: 500, fontSize: 'clamp(1.15rem,2.4vw,1.6rem)', lineHeight: 1.35, color: T.color.ink, maxWidth: '30ch', marginTop: '.4rem' }}>
          The thing that makes Tims <em style={{ fontStyle: 'normal', color: T.color.red }}>Tims</em> — order it your exact weird way — is the same thing that fought me on the clock.{' '}
          <strong style={{ color: T.color.red }}>That&apos;s the whole problem.</strong>
        </p>
      </div>
    </section>
  )
}
