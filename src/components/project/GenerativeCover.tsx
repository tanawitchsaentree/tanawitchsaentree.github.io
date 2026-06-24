'use client'

/**
 * GenerativeCover — Canvas2D motion poster, one designed loop per project.
 *
 * voronoi  → Invitrace: federated node graph, edges light up one at a time
 * gaussian → Allianz:   classification confidence bars filling + settling
 * scatter  → Stellareat: taste-cluster manifold, recommendation cursor moves
 * simplex  → Robowealth: donut chart rebalancing in real time
 * hull     → Profita:    regulatory boundary, dots bounce inside SEC walls
 * wave     → DoctorAnywhere: ECG heartbeat, latency decay left→right
 */

import { useEffect, useRef } from 'react'

export type CoverVariant = 'voronoi' | 'gaussian' | 'scatter' | 'simplex' | 'hull' | 'wave'

function mkRng(seed: number) {
  let s = (seed + 1) >>> 0
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 0x100000000 }
}

// ── Per-project draw functions ────────────────────────────────

function drawVoronoi(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const nodes: [number, number][] = [
    [w*0.22, h*0.26], [w*0.74, h*0.22], [w*0.50, h*0.46],
    [w*0.16, h*0.63], [w*0.80, h*0.59], [w*0.44, h*0.78],
  ]
  const edges: [number, number][] = [[0,2],[1,2],[2,3],[2,4],[3,5],[4,5],[0,3],[1,4]]

  // Static dim edges
  ctx.lineWidth = 0.8
  for (const [a, b] of edges) {
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'
    ctx.beginPath(); ctx.moveTo(nodes[a][0], nodes[a][1]); ctx.lineTo(nodes[b][0], nodes[b][1]); ctx.stroke()
  }

  // Animated active edge — yellow current tracing
  const cycle = (t * 0.5) % edges.length
  const ei = Math.floor(cycle)
  const prog = cycle - ei
  const [ea, eb] = edges[ei % edges.length]
  const ex = nodes[ea][0] + (nodes[eb][0] - nodes[ea][0]) * prog
  const ey = nodes[ea][1] + (nodes[eb][1] - nodes[ea][1]) * prog

  ctx.strokeStyle = `rgba(255,229,0,${0.7 * Math.sin(prog * Math.PI)})`
  ctx.lineWidth = 1.8
  ctx.beginPath(); ctx.moveTo(nodes[ea][0], nodes[ea][1]); ctx.lineTo(ex, ey); ctx.stroke()

  // Nodes
  for (let i = 0; i < nodes.length; i++) {
    const active = i === ea || i === eb
    const r2 = active ? 5 + 1.5 * Math.sin(t * 4) : 3
    ctx.beginPath(); ctx.arc(nodes[i][0], nodes[i][1], r2, 0, Math.PI*2)
    ctx.fillStyle = active ? 'rgba(255,229,0,0.92)' : 'rgba(255,255,255,0.50)'; ctx.fill()
  }

  // Label
  const fs = Math.round(w * 0.032)
  ctx.font = `400 ${fs}px 'Inter Variable', 'Inter', sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.textAlign = 'center'
  ctx.fillText('FEDERATED', w/2, h*0.93)
}

function drawGaussian(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const rows = [
    { label: 'INVOICE',  target: 0.88, phase: 0.0 },
    { label: 'CONTRACT', target: 0.62, phase: 0.5 },
    { label: 'CLAIM',    target: 0.95, phase: 1.0 },
    { label: 'POLICY',   target: 0.73, phase: 1.5 },
  ]
  const barH = h * 0.045
  const gap   = h * 0.155
  const startY = h * 0.24
  const barX   = w * 0.36
  const barW   = w * 0.52
  const labelX = w * 0.08
  const fs     = Math.round(w * 0.030)

  ctx.font = `400 ${fs}px 'Inter Variable', 'Inter', sans-serif`

  for (let i = 0; i < rows.length; i++) {
    const { label, target, phase } = rows[i]
    const cy2 = startY + i * gap

    // Cyclic fill: ramp up, hold, reset
    const c = (t * 0.22 + phase * 0.5) % 1
    const fill = c < 0.55
      ? target * Math.min(c / 0.45, 1) * (1 + 0.03 * Math.sin(t * 8 + i))
      : target + 0.015 * Math.sin(t * 5 + i * 1.7)
    const clamped = Math.max(0.04, Math.min(0.98, fill))

    // Track
    ctx.fillStyle = 'rgba(255,255,255,0.07)'
    ctx.beginPath()
    roundRect(ctx, barX, cy2, barW, barH, 2)
    ctx.fill()

    // Fill
    const high = clamped > 0.82
    ctx.fillStyle = high ? 'rgba(255,229,0,0.72)' : 'rgba(255,255,255,0.38)'
    ctx.beginPath()
    roundRect(ctx, barX, cy2, barW * clamped, barH, 2)
    ctx.fill()

    // Doc label
    ctx.fillStyle = 'rgba(255,255,255,0.32)'; ctx.textAlign = 'left'
    ctx.fillText(label, labelX, cy2 + barH * 0.75)

    // Percent
    ctx.fillStyle = high ? 'rgba(255,229,0,0.85)' : 'rgba(255,255,255,0.40)'
    ctx.textAlign = 'right'
    ctx.fillText(`${Math.round(clamped*100)}%`, barX + barW + w*0.06, cy2 + barH * 0.75)
  }

  const fs2 = Math.round(w * 0.028)
  ctx.font = `400 ${fs2}px 'Inter Variable', 'Inter', sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.textAlign = 'center'
  ctx.fillText('UNCERTAINTY → CERTAINTY', w/2, h*0.92)
}

function drawScatter(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const r = mkRng(17)
  const clusters: [number, number][] = [[w*0.28,h*0.32],[w*0.70,h*0.28],[w*0.48,h*0.66]]
  const names = ['UMAMI', 'SWEET', 'BOLD']

  // Seeded point cloud
  type Pt = { bx:number; by:number; c:number; ph:number; sp:number }
  const pts: Pt[] = Array.from({ length: 30 }, () => {
    const c = Math.floor(r() * 3)
    const a = r() * Math.PI * 2, rad = 18 + r() * w * 0.13
    return { bx: clusters[c][0]+Math.cos(a)*rad, by: clusters[c][1]+Math.sin(a)*rad,
             c, ph: r()*Math.PI*2, sp: 0.15+r()*0.30 }
  })

  // Points
  for (const p of pts) {
    ctx.beginPath()
    ctx.arc(p.bx + Math.cos(p.ph+t*p.sp)*5, p.by + Math.sin(p.ph+t*p.sp*0.8)*5, 2, 0, Math.PI*2)
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fill()
  }

  // Cluster centers
  for (let i = 0; i < 3; i++) {
    const pulse = 4.5 + 1.2 * Math.sin(t * 1.5 + i * 2.1)
    ctx.beginPath(); ctx.arc(clusters[i][0], clusters[i][1], pulse, 0, Math.PI*2)
    ctx.fillStyle = i===1 ? 'rgba(255,229,0,0.80)' : 'rgba(255,255,255,0.55)'; ctx.fill()
    const fs = Math.round(w*0.028)
    ctx.font = `400 ${fs}px 'Inter Variable', 'Inter', sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.textAlign = 'center'
    ctx.fillText(names[i], clusters[i][0], clusters[i][1] - 14)
  }

  // Recommendation cursor — yellow dot travels between clusters
  const cyc = (t * 0.14) % 1
  const from = Math.floor(cyc * 3) % 3, to = (from+1)%3
  const prog = (cyc*3)%1
  const ep = prog<0.5 ? 2*prog*prog : 1-2*(1-prog)*(1-prog)
  const rx = clusters[from][0]+(clusters[to][0]-clusters[from][0])*ep
  const ry = clusters[from][1]+(clusters[to][1]-clusters[from][1])*ep
  ctx.beginPath(); ctx.arc(rx, ry, 4.5, 0, Math.PI*2)
  ctx.fillStyle = 'rgba(255,229,0,0.95)'; ctx.fill()

  const fs2 = Math.round(w*0.030)
  ctx.font = `400 ${fs2}px 'Inter Variable', 'Inter', sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.textAlign = 'center'
  ctx.fillText('PREFERENCE SPACE', w/2, h*0.92)
}

function drawSimplex(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const cx = w*0.50, cy = h*0.44
  const R  = Math.min(w,h)*0.27
  const labels = ['ETF', 'BOND', 'GOLD']
  const cols   = ['rgba(255,255,255,0.58)','rgba(255,229,0,0.78)','rgba(255,255,255,0.38)']

  // Smoothly shifting weights
  const raw = [
    0.35 + 0.14*Math.sin(t*0.22),
    0.30 + 0.11*Math.sin(t*0.17+2.1),
    0.35 - 0.10*Math.sin(t*0.20+1.2),
  ]
  const tot = raw.reduce((a,b)=>a+b, 0)
  const nw  = raw.map(v=>v/tot)

  let ang = -Math.PI/2
  for (let i=0; i<3; i++) {
    const sweep = nw[i]*Math.PI*2
    const mid   = ang+sweep/2

    // Segment fill
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,R,ang,ang+sweep); ctx.closePath()
    ctx.fillStyle = cols[i].replace(/[\d.]+\)$/, `${0.10+nw[i]*0.08})`); ctx.fill()
    ctx.strokeStyle = cols[i]; ctx.lineWidth = 1.2; ctx.stroke()

    // Inner label
    ctx.font = `500 ${Math.round(w*0.032)}px 'Inter Variable', 'Inter', sans-serif`
    ctx.fillStyle = cols[i]; ctx.textAlign = 'center'
    ctx.fillText(labels[i], cx+R*0.63*Math.cos(mid), cy+R*0.63*Math.sin(mid)+4)

    // Outer %
    ctx.font = `400 ${Math.round(w*0.030)}px 'Inter Variable', 'Inter', sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fillText(`${Math.round(nw[i]*100)}%`, cx+R*1.24*Math.cos(mid), cy+R*1.24*Math.sin(mid)+4)

    ang += sweep
  }

  // Donut hole
  ctx.beginPath(); ctx.arc(cx,cy,R*0.40,0,Math.PI*2)
  ctx.fillStyle = 'rgba(10,22,40,0.98)'; ctx.fill()

  const fh = Math.round(w*0.030)
  ctx.font = `400 ${fh}px 'Inter Variable', 'Inter', sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.textAlign = 'center'
  ctx.fillText('REBAL', cx, cy+3)

  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.fillText('PORTFOLIO', w/2, h*0.92)
}

function drawHull(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const mg  = w*0.14
  const bx  = mg, by = h*0.20, bw = w-mg*2, bh = h*0.60

  // Dashed boundary
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 1
  ctx.setLineDash([4,5]); ctx.strokeRect(bx, by, bw, bh); ctx.setLineDash([])

  // Corner SEC labels
  const fl = Math.round(w*0.026)
  ctx.font = `400 ${fl}px 'Inter Variable', 'Inter', sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ctx.textAlign = 'left';  ctx.fillText('SEC', bx+5, by+fl+2)
  ctx.textAlign = 'right'; ctx.fillText('SEC', bx+bw-5, by+bh-4)

  // Dots bouncing inside boundary
  const r = mkRng(55)
  for (let i=0; i<12; i++) {
    const bx2 = bx + bw*(0.1+r()*0.8)
    const by2 = by + bh*(0.1+r()*0.8)
    const vx  = (r()-0.5)*1.1, vy = (r()-0.5)*1.1
    const ph  = r()*Math.PI*2
    let x = bx2 + Math.sin(t*vx+ph)*bw*0.28
    let y = by2 + Math.cos(t*vy+ph*1.3)*bh*0.28
    // clamp inside boundary
    x = Math.max(bx+5, Math.min(bx+bw-5, x))
    y = Math.max(by+5, Math.min(by+bh-5, y))
    ctx.beginPath(); ctx.arc(x, y, 2.8, 0, Math.PI*2)
    ctx.fillStyle = 'rgba(255,229,0,0.60)'; ctx.fill()
  }

  const fb = Math.round(w*0.030)
  ctx.font = `400 ${fb}px 'Inter Variable', 'Inter', sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.textAlign = 'center'
  ctx.fillText('WITHIN BOUNDS', w/2, h*0.92)
}

function drawWave(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const cy  = h * 0.46
  const spd = 0.55

  function ecgAt(x: number): number {
    const p  = (x/w - t*spd) * 7 * Math.PI
    const mod = ((p % (Math.PI*2)) + Math.PI*2) % (Math.PI*2)
    const spike = Math.exp(-Math.pow((mod - Math.PI) * 2.2, 2)) * h * 0.28
    return cy - spike - Math.sin(p*0.3)*h*0.03
  }

  // Main ECG
  ctx.beginPath()
  for (let x=0; x<=w; x++) { x===0 ? ctx.moveTo(x,ecgAt(x)) : ctx.lineTo(x,ecgAt(x)) }
  ctx.strokeStyle = 'rgba(255,255,255,0.32)'; ctx.lineWidth = 1.5; ctx.stroke()

  // Lagged echo (represents distance latency)
  ctx.beginPath()
  for (let x=0; x<=w; x++) {
    const p2 = (x/w - t*spd*0.65 - 0.18) * 7 * Math.PI
    const mod = ((p2%(Math.PI*2))+(Math.PI*2))%(Math.PI*2)
    const y2 = cy + h*0.16 - Math.exp(-Math.pow((mod-Math.PI)*2.2,2))*h*0.13
    x===0 ? ctx.moveTo(x,y2) : ctx.lineTo(x,y2)
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 0.8; ctx.stroke()

  // Source pulse
  const pSz = 3.5 + 1.8*Math.abs(Math.sin(t*2.9))
  ctx.beginPath(); ctx.arc(w*0.08, cy, pSz, 0, Math.PI*2)
  ctx.fillStyle = 'rgba(255,229,0,0.92)'; ctx.fill()

  // Receiver dot
  ctx.beginPath(); ctx.arc(w*0.88, cy+h*0.16, 2.5, 0, Math.PI*2)
  ctx.fillStyle = `rgba(255,255,255,${0.12+0.10*Math.max(0,Math.sin(t*2.9-1.5))})`; ctx.fill()

  const fs = Math.round(w*0.028)
  ctx.font = `400 ${fs}px 'Inter Variable', 'Inter', sans-serif`
  ctx.fillStyle = 'rgba(255,255,255,0.24)'
  ctx.textAlign = 'left';  ctx.fillText('PATIENT', w*0.04, h*0.30)
  ctx.textAlign = 'right'; ctx.fillText('DOCTOR',  w*0.96, h*0.76)

  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.textAlign = 'center'
  ctx.fillText('LATENCY OF CARE', w/2, h*0.92)
}

// Polyfill helper — ctx.roundRect not in all browsers
function roundRect(ctx: CanvasRenderingContext2D, x:number, y:number, w:number, h:number, r:number) {
  if (w < 2*r) r = w/2; if (h < 2*r) r = h/2
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r)
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r)
}

// ── Dispatch ─────────────────────────────────────────────────────

const DRAW: Record<CoverVariant, (ctx:CanvasRenderingContext2D, w:number, h:number, t:number)=>void> = {
  voronoi:  drawVoronoi,
  gaussian: drawGaussian,
  scatter:  drawScatter,
  simplex:  drawSimplex,
  hull:     drawHull,
  wave:     drawWave,
}

// ── Component ─────────────────────────────────────────────────────

interface GenerativeCoverProps {
  variant:    CoverVariant
  className?: string
}

export function GenerativeCover({ variant, className }: GenerativeCoverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const DPR = Math.min(window.devicePixelRatio ?? 1, 2)
    const dims = { w: 0, h: 0 }

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      dims.w = rect.width; dims.h = rect.height
      canvas!.width  = Math.round(rect.width  * DPR)
      canvas!.height = Math.round(rect.height * DPR)
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const drawFn = DRAW[variant]
    const start  = performance.now()
    let raf = 0
    let visible = false

    function frame() {
      if (!visible || !dims.w || !dims.h) { raf = 0; return }
      const t = (performance.now() - start) / 1000
      ctx!.clearRect(0, 0, dims.w, dims.h)
      drawFn(ctx!, dims.w, dims.h, t)
      raf = requestAnimationFrame(frame)
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(frame)
    }, { threshold: 0.05 })
    io.observe(canvas)

    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [variant])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}
