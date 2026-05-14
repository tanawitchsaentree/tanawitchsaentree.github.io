'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useReducedMotion } from 'framer-motion'
import {
  forceSimulation, forceLink, forceManyBody, forceCenter,
  type SimulationNodeDatum, type SimulationLinkDatum,
} from 'd3-force'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tier = 'root' | 'primitive' | 'variant'

interface Node extends SimulationNodeDatum {
  id:       string
  tier:     Tier
  color:    string
  r:        number
  label:    string
  // governance
  drag:     'none' | 'spring' | 'free'
  homeX?:   number
  homeY?:   number
  // trail
  trail:    { x: number; y: number }[]
}

interface Link extends SimulationLinkDatum<Node> {
  dashed: boolean
}

// ─── Graph ────────────────────────────────────────────────────────────────────

const PC  = '#7B61FF'
const AC  = { medium: '#0D9488', large: '#D97706', specialty: '#E85D75' }

function buildGraph(): { nodes: Node[]; links: Link[] } {
  const nodes: Node[] = [
    { id:'root',              tier:'root',      color:'#111', r:10, label:'Design Token', drag:'none',   trail:[] },
    { id:'prim-button',       tier:'primitive', color:PC,     r:7,  label:'Button',       drag:'spring', trail:[] },
    { id:'prim-field',        tier:'primitive', color:PC,     r:7,  label:'Field',        drag:'spring', trail:[] },
    { id:'prim-table',        tier:'primitive', color:PC,     r:7,  label:'Table',        drag:'spring', trail:[] },

    { id:'var-button-M', tier:'variant', color:AC.medium,    r:5, label:'Button · M', drag:'free', trail:[] },
    { id:'var-button-L', tier:'variant', color:AC.large,     r:5, label:'Button · L', drag:'free', trail:[] },
    { id:'var-button-S', tier:'variant', color:AC.specialty, r:5, label:'Button · S', drag:'free', trail:[] },
    { id:'var-field-M',  tier:'variant', color:AC.medium,    r:5, label:'Field · M',  drag:'free', trail:[] },
    { id:'var-field-L',  tier:'variant', color:AC.large,     r:5, label:'Field · L',  drag:'free', trail:[] },
    { id:'var-field-S',  tier:'variant', color:AC.specialty, r:5, label:'Field · S',  drag:'free', trail:[] },
    { id:'var-table-M',  tier:'variant', color:AC.medium,    r:5, label:'Table · M',  drag:'free', trail:[] },
    { id:'var-table-L',  tier:'variant', color:AC.large,     r:5, label:'Table · L',  drag:'free', trail:[] },
    { id:'var-table-S',  tier:'variant', color:AC.specialty, r:5, label:'Table · S',  drag:'free', trail:[] },
  ]
  const links: Link[] = [
    { source:'root',        target:'prim-button', dashed:false },
    { source:'root',        target:'prim-field',  dashed:false },
    { source:'root',        target:'prim-table',  dashed:false },
    { source:'prim-button', target:'var-button-M', dashed:true },
    { source:'prim-button', target:'var-button-L', dashed:true },
    { source:'prim-button', target:'var-button-S', dashed:true },
    { source:'prim-field',  target:'var-field-M',  dashed:true },
    { source:'prim-field',  target:'var-field-L',  dashed:true },
    { source:'prim-field',  target:'var-field-S',  dashed:true },
    { source:'prim-table',  target:'var-table-M',  dashed:true },
    { source:'prim-table',  target:'var-table-L',  dashed:true },
    { source:'prim-table',  target:'var-table-S',  dashed:true },
  ]
  return { nodes, links }
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function ha(hex: string, a: number) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
  return `rgba(${r},${g},${b},${a})`
}

const MAX_TRAIL = 18

// ─── Component ────────────────────────────────────────────────────────────────

export function HeroBackground() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const reduced    = useReducedMotion()
  const rafRef     = useRef<number>(0)

  // drag state
  const dragging   = useRef<Node | null>(null)
  const rejectNode = useRef<Node | null>(null)
  const rejectT    = useRef<number>(0)
  const hovered    = useRef<Node | null>(null)

  const getCanvas   = () => canvasRef.current
  const getDpr      = () => window.devicePixelRatio || 1
  const toCanvas    = (e: MouseEvent | Touch) => {
    const c = getCanvas(); if (!c) return { x:0, y:0 }
    const r = c.getBoundingClientRect(), dpr = getDpr()
    // Return CSS-space coordinates (simulation runs in CSS space)
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  useEffect(() => {
    const canvas = getCanvas(); if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D; if (!ctx) return

    const dpr = getDpr()
    const resize = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight
      canvas.width  = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const W = () => canvas.offsetWidth
    const H = () => canvas.offsetHeight

    const { nodes, links } = buildGraph()
    const root = nodes.find(n => n.id === 'root')!

    // Position nodes
    const place = () => {
      // root — right-center
      root.x = W() * 0.62; root.y = H() * 0.5
      root.fx = root.x;    root.fy = root.y
      root.homeX = root.x; root.homeY = root.y

      const primAngles = [-0.7, 0, 0.7]
      const prims = nodes.filter(n => n.tier === 'primitive')
      prims.forEach((n, i) => {
        const a = primAngles[i] - Math.PI / 2
        n.x = (root.x ?? W() * 0.62) + Math.cos(a) * 120
        n.y = (root.y ?? H() * 0.5)  + Math.sin(a) * 120
        n.homeX = n.x; n.homeY = n.y
      })
      nodes.filter(n => n.tier === 'variant').forEach(n => {
        n.x = W() * 0.25 + Math.random() * W() * 0.65
        n.y = H() * 0.1  + Math.random() * H() * 0.8
      })
    }
    place()

    const sim = forceSimulation<Node>(nodes)
      .force('link', forceLink<Node, Link>(links).id(d => d.id).distance(d => d.dashed ? 100 : 85).strength(d => d.dashed ? 0.35 : 0.85))
      .force('charge', forceManyBody<Node>().strength(n => n.tier === 'root' ? 0 : -150))
      .force('center', forceCenter<Node>(W() * 0.62, H() * 0.5).strength(0.015))
      .alphaDecay(0.018)
      .velocityDecay(0.52)

    // ── Interaction ───────────────────────────────────────────────────────────

    const findNode = (x: number, y: number): Node | null => {
      let best: Node | null = null, bd = Infinity
      for (const n of nodes) {
        if (n.x == null || n.y == null) continue
        const d = Math.hypot(n.x - x, n.y - y)
        if (d < Math.max(n.r + 10, 16) && d < bd) { bd = d; best = n }
      }
      return best
    }

    const onDown = (e: MouseEvent) => {
      const { x, y } = toCanvas(e)
      const n = findNode(x, y)
      if (!n) return
      e.preventDefault()
      if (n.drag === 'none') {
        // Reject: root cannot be dragged
        rejectNode.current = n; rejectT.current = performance.now()
        return
      }
      dragging.current = n
      n.fx = x; n.fy = y
      sim.alphaTarget(0.3).restart()
      canvas.style.cursor = 'grabbing'
    }

    const onMove = (e: MouseEvent) => {
      const { x, y } = toCanvas(e)
      if (dragging.current) {
        e.preventDefault()
        dragging.current.fx = x
        dragging.current.fy = y
        return
      }
      const n = findNode(x, y)
      hovered.current = n
      canvas.style.cursor = n
        ? n.drag === 'none' ? 'not-allowed' : 'grab'
        : 'default'
    }

    const onUp = () => {
      const n = dragging.current; if (!n) return
      // Primitives spring back home
      if (n.drag === 'spring' && n.homeX != null && n.homeY != null) {
        n.fx = n.homeX; n.fy = n.homeY
        setTimeout(() => { n.fx = undefined; n.fy = undefined }, 600)
      } else {
        n.fx = undefined; n.fy = undefined
      }
      dragging.current = null
      sim.alphaTarget(0).alpha(0.12)
      canvas.style.cursor = 'default'
    }

    canvas.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseup', onUp)

    // ── Draw ──────────────────────────────────────────────────────────────────

    let frame = 0
    function draw() {
      const w = W(), h = H()
      ctx.clearRect(0, 0, w, h)
      frame++

      // Spring force: pull dragged primitive toward home while not dragging
      nodes.forEach(n => {
        if (n.drag === 'spring' && !dragging.current && n.homeX != null && n.homeY != null && n.x != null && n.y != null) {
          const k = 0.04
          n.vx = ((n.vx ?? 0) + (n.homeX - n.x) * k)
          n.vy = ((n.vy ?? 0) + (n.homeY - n.y) * k)
        }
      })

      // ── Reject flash on root ──────────────────────────────────────────────
      const rn = rejectNode.current
      if (rn && rn.x != null && rn.y != null) {
        const age = (performance.now() - rejectT.current) / 600
        if (age < 1) {
          const a = Math.sin(age * Math.PI) * 0.5
          ctx.beginPath()
          ctx.arc(rn.x, rn.y, rn.r + 12 * (1 - age), 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(200,57,75,${a})`
          ctx.lineWidth = 1.5
          ctx.stroke()
          // "locked" label flash
          ctx.font = '500 9px ui-monospace,monospace'
          ctx.textAlign = 'center'
          ctx.fillStyle = `rgba(200,57,75,${a * 1.4})`
          ctx.fillText('⊘ LOCKED', rn.x, rn.y - rn.r - 14)
        } else {
          rejectNode.current = null
        }
      }

      // ── Trails for variants ───────────────────────────────────────────────
      nodes.forEach(n => {
        if (n.tier !== 'variant' || n.x == null || n.y == null) return
        n.trail.push({ x: n.x, y: n.y })
        if (n.trail.length > MAX_TRAIL) n.trail.shift()

        if (n.trail.length < 2) return
        const isDragged = dragging.current?.id === n.id
        if (!isDragged) return // only show trail while dragging

        for (let i = 1; i < n.trail.length; i++) {
          const a = (i / n.trail.length) * 0.35
          ctx.beginPath()
          ctx.moveTo(n.trail[i-1].x, n.trail[i-1].y)
          ctx.lineTo(n.trail[i].x,   n.trail[i].y)
          ctx.strokeStyle = ha(n.color, a)
          ctx.lineWidth   = (i / n.trail.length) * 2.5
          ctx.lineCap     = 'round'
          ctx.stroke()
        }
      })

      // ── Links ─────────────────────────────────────────────────────────────
      links.forEach(lk => {
        const s = lk.source as Node, t = lk.target as Node
        if (s.x == null || s.y == null || t.x == null || t.y == null) return

        const g = ctx.createLinearGradient(s.x, s.y, t.x, t.y)
        g.addColorStop(0, ha(s.color, lk.dashed ? 0.22 : 0.45))
        g.addColorStop(1, ha(t.color, lk.dashed ? 0.22 : 0.45))

        ctx.beginPath()
        ctx.setLineDash(lk.dashed ? [5,5] : [])
        ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y)
        ctx.strokeStyle = g
        ctx.lineWidth   = lk.dashed ? 0.8 : 1.2
        ctx.stroke()
        ctx.setLineDash([])
      })

      // ── Nodes ─────────────────────────────────────────────────────────────
      nodes.forEach(n => {
        if (n.x == null || n.y == null) return
        const isDragged = dragging.current?.id === n.id
        const isHov     = hovered.current?.id   === n.id && !dragging.current
        const r         = n.r * (isDragged ? 1.3 : isHov ? 1.18 : 1)

        // Outer glow
        const glowR  = r + (isDragged ? 28 : isHov ? 16 : n.tier === 'root' ? 18 : 8)
        const glowA  = isDragged ? 0.28 : isHov ? 0.2 : n.tier === 'root' ? 0.1 : 0.08
        const grd    = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR)
        grd.addColorStop(0, ha(n.color, glowA))
        grd.addColorStop(1, ha(n.color, 0))
        ctx.beginPath(); ctx.arc(n.x, n.y, glowR, 0, Math.PI*2)
        ctx.fillStyle = grd; ctx.fill()

        // Root pulse ring
        if (n.tier === 'root') {
          const pulse = (Math.sin(frame * 0.025) + 1) / 2
          ctx.beginPath(); ctx.arc(n.x, n.y, r + 6 + pulse * 4, 0, Math.PI*2)
          ctx.strokeStyle = ha(n.color, 0.12 + pulse * 0.08)
          ctx.lineWidth = 1; ctx.stroke()
        }

        // Circle
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI*2)
        ctx.fillStyle = ha(n.color, isDragged ? 1 : isHov ? 0.9 : n.tier === 'root' ? 1 : 0.7)
        ctx.fill()

        // Ring on selected/hovered
        if (isDragged || isHov) {
          ctx.beginPath(); ctx.arc(n.x, n.y, r + 4, 0, Math.PI*2)
          ctx.strokeStyle = ha(n.color, 0.5)
          ctx.lineWidth = 1; ctx.stroke()
        }

        // Label on hover / drag
        if (isDragged || isHov) {
          const text = n.label.toUpperCase()
          ctx.font = '500 10px ui-monospace,monospace'
          ctx.textAlign = 'center'
          const tw   = ctx.measureText(text).width
          const lx   = n.x, ly = n.y - r - 12

          ctx.fillStyle = 'rgba(255,255,255,0.95)'
          ctx.fillRect(lx - tw/2 - 7, ly - 14, tw + 14, 18)
          ctx.strokeStyle = ha(n.color, 0.25); ctx.lineWidth = 1
          ctx.strokeRect(lx - tw/2 - 7, ly - 14, tw + 14, 18)
          ctx.fillStyle = ha(n.color, 1); ctx.fillText(text, lx, ly - 1)

          // drag affordance tag below
          const tag = n.drag === 'none' ? '⊘ locked' : n.drag === 'spring' ? '↻ constrained' : '↻ flex'
          const tagC = n.drag === 'none' ? '#C0394B' : n.drag === 'spring' ? '#D97706' : '#0D9488'
          ctx.font = '400 9px ui-monospace,monospace'
          ctx.fillStyle = ha(tagC, 0.85)
          ctx.fillText(tag, lx, ly + 9)
        }
      })

      // ── Cursor label hint (first 4s) ──────────────────────────────────────
      if (frame < 200 && !dragging.current && !hovered.current) {
        const a = Math.min(1, frame / 40) * Math.max(0, 1 - (frame - 160) / 40)
        ctx.font = '400 10px ui-monospace,monospace'
        ctx.textAlign = 'center'
        ctx.fillStyle = `rgba(136,136,136,${a * 0.6})`
        ctx.fillText('drag nodes — variants are free, root is locked', w * 0.5, h - 20)
      }

      sim.tick()
      rafRef.current = requestAnimationFrame(draw)
    }

    if (reduced) {
      for (let i = 0; i < 300; i++) sim.tick()
      draw(); return
    }
    rafRef.current = requestAnimationFrame(draw)

    const ro = new ResizeObserver(() => {
      resize()
      root.fx = W() * 0.62; root.fy = H() * 0.5
      root.homeX = root.x; root.homeY = root.y
      sim.force('center', forceCenter<Node>(W() * 0.62, H() * 0.5).strength(0.015))
      sim.alpha(0.3).restart()
    })
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(rafRef.current)
      sim.stop(); ro.disconnect()
      canvas.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [reduced])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full select-none"
      style={{ cursor: 'default' }}
    />
  )
}
