'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/cn'

// ─── Preset bundles ───────────────────────────────────────────────────────────

interface Preset {
  id:      string
  label:   string
  sub:     string
  tokens:  {
    radius:   number
    spacing:  number
    fontSize: number
    color:    string
    density:  'compact' | 'normal' | 'spacious'
    weight:   number
  }
}

const PRESETS: Preset[] = [
  {
    id: 'compact', label: 'Compact System', sub: 'High-volume ICU/ER',
    tokens: { radius: 0, spacing: 6,  fontSize: 11, color: '#374151', density: 'compact',  weight: 500 },
  },
  {
    id: 'accessible', label: 'Accessible Mode', sub: 'Elderly / low-vision ward',
    tokens: { radius: 8, spacing: 20, fontSize: 16, color: '#1D4ED8', density: 'spacious', weight: 600 },
  },
  {
    id: 'warm', label: 'Warm Brand', sub: 'Private clinic chain',
    tokens: { radius: 16, spacing: 14, fontSize: 13, color: '#9333EA', density: 'normal', weight: 500 },
  },
  {
    id: 'clinical', label: 'Clinical Dark', sub: 'Night shift / radiology',
    tokens: { radius: 2, spacing: 10, fontSize: 12, color: '#10B981', density: 'compact', weight: 400 },
  },
]

type Archetype = 'medium' | 'large' | 'specialty'

const ARCH_BASE: Record<Archetype, Preset['tokens']> = {
  medium:    { radius: 3,  spacing: 8,  fontSize: 12, color: '#0D9488', density: 'compact',  weight: 500 },
  large:     { radius: 8,  spacing: 16, fontSize: 14, color: '#C97A0A', density: 'normal',   weight: 600 },
  specialty: { radius: 20, spacing: 14, fontSize: 13, color: '#C0394B', density: 'spacious', weight: 500 },
}

const ARCH_META: Record<Archetype, { label: string; sub: string }> = {
  medium:    { label: 'Medium',    sub: 'District hospital · 200 beds'  },
  large:     { label: 'Large',     sub: 'Teaching hospital · 800 beds'  },
  specialty: { label: 'Specialty', sub: 'Oncology clinic · 40 beds'     },
}

// ─── Tilt wrapper ─────────────────────────────────────────────────────────────

function TiltCard({ children, accent, isTarget, shaking }: {
  children: React.ReactNode
  accent:   string
  isTarget: boolean
  shaking:  boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mx  = useMotionValue(0)
  const my  = useMotionValue(0)
  const rx  = useSpring(useTransform(my, [-1,1], [5,-5]), { stiffness: 280, damping: 28 })
  const ry  = useSpring(useTransform(mx, [-1,1], [-6,6]), { stiffness: 280, damping: 28 })

  const onMove = useCallback((e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return
    mx.set((e.clientX - r.left - r.width/2)  / (r.width/2))
    my.set((e.clientY - r.top  - r.height/2) / (r.height/2))
  }, [mx, my])

  const onLeave = useCallback(() => { mx.set(0); my.set(0) }, [mx, my])

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', transformPerspective: 900,
        borderColor: isTarget ? accent : 'var(--border)',
        boxShadow: isTarget ? `0 0 0 2px ${accent}, 0 20px 48px ${accent}30` : '0 1px 0 var(--border)',
        transition: 'border-color 0.15s var(--ease-out-quick), box-shadow 0.15s var(--ease-out-quick)',
      } as React.CSSProperties}
      animate={shaking ? { x: [0,-9,9,-7,7,-4,4,0] } : { x: 0 }}
      transition={shaking ? { duration: 0.45 } : { duration: 0.18 }}
      className="border overflow-hidden relative"
    >
      {isTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: `${accent}06` }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

// ─── CARD M — Dense workflow board ────────────────────────────────────────────

const M_PATIENTS = [
  { id:'001', name:'Somchai K.',  ward:'3A',  status:'Active',    flag:'●' , flagColor:'#0D9488' },
  { id:'002', name:'Napat W.',    ward:'ER',  status:'Waiting',   flag:'◐' , flagColor:'#C97A0A' },
  { id:'003', name:'Siriporn T.', ward:'ICU', status:'Critical',  flag:'▲' , flagColor:'#C0394B' },
  { id:'004', name:'Malee P.',    ward:'4B',  status:'Discharge', flag:'○' , flagColor:'#888888' },
]

function CardMedium({ t }: { t: Preset['tokens'] }) {
  const { radius: r, spacing: sp, fontSize: fs, color, weight: fw, density } = t
  const rowPy = density === 'compact' ? 4 : density === 'spacious' ? 10 : 7

  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* Quick action bar */}
      <div
        className="flex items-center gap-1.5 flex-wrap border-b border-[var(--border)]"
        style={{ padding: `${sp*0.5}px ${sp}px`, background: `${color}08` }}
      >
        {['✓ Admit','✗ Discharge','→ Transfer','⊕ New'].map(a => (
          <button
            key={a}
            type="button"
            className="font-mono cursor-default leading-none transition-[font-size,color,background-color,border-color,border-radius,padding] duration-300 ease-[var(--ease-out-quick)]"
            style={{
              padding: `${Math.round(sp*0.35)}px ${Math.round(sp*0.7)}px`,
              borderRadius: r,
              fontSize: fs - 1,
              fontWeight: fw,
              color,
              background: `${color}12`,
              border: `1px solid ${color}30`,
            }}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Dense table */}
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['ID','Patient','Ward','Status'].map(h => (
              <th
                key={h}
                className="text-left font-mono font-normal text-[var(--fg-subtle)] uppercase tracking-widest"
                style={{ fontSize: fs - 2, padding: `${rowPy}px ${sp*0.75}px` }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {M_PATIENTS.map((p, i) => (
            <tr
              key={p.id}
              style={{ borderBottom: i < M_PATIENTS.length-1 ? '1px solid var(--border)' : 'none' }}
            >
              <td className="font-mono text-[var(--fg-subtle)]" style={{ fontSize: fs-1, padding: `${rowPy}px ${sp*0.75}px` }}>{p.id}</td>
              <td className="font-mono text-[var(--fg)]"         style={{ fontSize: fs,   padding: `${rowPy}px ${sp*0.75}px`, fontWeight: fw }}>{p.name}</td>
              <td className="font-mono text-[var(--fg-muted)]"   style={{ fontSize: fs-1, padding: `${rowPy}px ${sp*0.75}px` }}>{p.ward}</td>
              <td style={{ padding: `${rowPy}px ${sp*0.75}px` }}>
                <span className="font-mono" style={{ fontSize: fs-2, color: p.flagColor }}>
                  {p.flag} {p.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer count */}
      <div
        className="flex items-center justify-between border-t border-[var(--border)]"
        style={{ padding: `${sp*0.5}px ${sp}px`, background: 'var(--bg-elevated)' }}
      >
        <span className="font-mono text-[var(--fg-subtle)]" style={{ fontSize: fs-2 }}>4 patients · 1 critical</span>
        <span className="font-mono" style={{ fontSize: fs-2, color }}>{new Date().toLocaleTimeString('en', { hour:'2-digit', minute:'2-digit' })}</span>
      </div>
    </div>
  )
}

// ─── CARD L — Dashboard with stat blocks ──────────────────────────────────────

function CardLarge({ t }: { t: Preset['tokens'] }) {
  const { radius: r, spacing: sp, fontSize: fs, color, weight: fw } = t
  const stats = [
    { label: 'Admitted', val: 24, color },
    { label: 'Pending',  val: 8,  color: '#888' },
    { label: 'Critical', val: 2,  color: '#C0394B' },
    { label: 'Discharged',val:18, color: '#aaa' },
  ]

  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* Stat row */}
      <div
        className="grid grid-cols-4 border-b border-[var(--border)]"
        style={{ background: 'var(--bg-elevated)' }}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={cn('flex flex-col items-center justify-center', i < 3 && 'border-r border-[var(--border)]')}
            style={{ padding: `${sp*0.75}px ${sp*0.5}px` }}
          >
            <span className="font-display font-medium leading-none transition-[font-size,color] duration-300 ease-[var(--ease-out-quick)]" style={{ fontSize: fs + 8, color: s.color }}>{s.val}</span>
            <span className="font-mono text-[var(--fg-subtle)] text-center leading-tight mt-1" style={{ fontSize: fs - 3 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Patient list — expanded style */}
      {[
        { name: 'Napat Wongsa',     dept: 'Internal Medicine', ward: 'Ward 5B', days: 2, dr: 'Dr. Somjit',   tag: 'Stable'   },
        { name: 'Siriporn Thana',   dept: 'Cardiology',        ward: 'Ward 3A', days: 5, dr: 'Dr. Preeya',   tag: 'Monitor'  },
        { name: 'Kamon Ladda',      dept: 'Neurology',         ward: 'ICU-2',   days: 1, dr: 'Dr. Chatchai', tag: 'Critical' },
      ].map((p, i) => {
        const tagColor = p.tag === 'Critical' ? '#C0394B' : p.tag === 'Monitor' ? '#C97A0A' : color
        return (
          <div
            key={p.name}
            className={cn('flex items-start justify-between', i < 2 && 'border-b border-[var(--border)]')}
            style={{ padding: `${sp*0.7}px ${sp}px` }}
          >
            <div>
              <p className="font-sans text-[var(--fg)] leading-tight transition-[font-size] duration-300 ease-[var(--ease-out-quick)]" style={{ fontSize: fs, fontWeight: fw }}>{p.name}</p>
              <p className="font-mono text-[var(--fg-muted)] mt-0.5" style={{ fontSize: fs - 2 }}>{p.dept} · {p.ward} · Day {p.days}</p>
              <p className="font-mono text-[var(--fg-subtle)] mt-0.5" style={{ fontSize: fs - 2 }}>{p.dr}</p>
            </div>
            <span
              className="font-mono flex-shrink-0"
              style={{
                fontSize: fs - 3,
                padding: `2px ${Math.round(sp*0.5)}px`,
                borderRadius: r,
                color: tagColor,
                background: `${tagColor}15`,
                border: `1px solid ${tagColor}30`,
                marginTop: 2,
              }}
            >
              {p.tag}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── CARD S — Patient profile focus ───────────────────────────────────────────

function CardSpecialty({ t }: { t: Preset['tokens'] }) {
  const { radius: r, spacing: sp, fontSize: fs, color, weight: fw, density } = t
  const bigFs = density === 'spacious' ? fs + 6 : density === 'compact' ? fs + 2 : fs + 4

  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* Current patient — large focus */}
      <div style={{ padding: `${sp*1.2}px ${sp}px`, background: `${color}08`, borderBottom: '1px solid var(--border)' }}>
        <p className="font-mono text-[var(--fg-subtle)] uppercase tracking-widest mb-1" style={{ fontSize: fs - 2 }}>Current patient</p>
        <p className="font-display text-[var(--fg)] leading-tight transition-[font-size] duration-300 ease-[var(--ease-out-quick)]" style={{ fontSize: bigFs, fontWeight: fw }}>Malee Pimchan</p>
        <p className="font-mono text-[var(--fg-muted)] mt-0.5" style={{ fontSize: fs - 1 }}>F · 47 · Breast oncology</p>

        {/* Treatment progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[var(--fg-muted)]" style={{ fontSize: fs - 2 }}>Treatment cycle</span>
            <span className="font-mono" style={{ fontSize: fs - 2, color }}>3 / 5</span>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => (
              <div
                key={i}
                className="flex-1 transition-[height,border-radius,background-color] duration-300 ease-[var(--ease-out-quick)]"
                style={{
                  height: density === 'spacious' ? 8 : 5,
                  borderRadius: r,
                  background: i <= 3 ? color : 'var(--border)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Next appointment */}
      <div
        className="flex items-center gap-3 border-b border-[var(--border)]"
        style={{ padding: `${sp*0.8}px ${sp}px` }}
      >
        <div
          className="flex-shrink-0 flex items-center justify-center font-mono transition-[width,height,border-radius,font-size,background-color,color] duration-300 ease-[var(--ease-out-quick)]"
          style={{
            width: density === 'spacious' ? 44 : 36,
            height: density === 'spacious' ? 44 : 36,
            borderRadius: r,
            background: `${color}15`,
            color,
            fontSize: fs,
            fontWeight: fw,
          }}
        >
          ⏱
        </div>
        <div>
          <p className="font-sans text-[var(--fg)] leading-tight" style={{ fontSize: fs, fontWeight: fw }}>Chemo session IV</p>
          <p className="font-mono text-[var(--fg-muted)]" style={{ fontSize: fs - 2 }}>Thu 15 May · 09:00 · Oncology ward B</p>
        </div>
      </div>

      {/* Notes */}
      <div style={{ padding: `${sp*0.8}px ${sp}px`, borderBottom: '1px solid var(--border)' }}>
        <p className="font-mono text-[var(--fg-subtle)] uppercase tracking-widest mb-1.5" style={{ fontSize: fs - 2 }}>Clinical note</p>
        <p className="font-sans text-[var(--fg-muted)] leading-relaxed" style={{ fontSize: fs - 1 }}>
          Responding well to protocol. Fatigue reported — adjust anti-emetic dosage before next session.
        </p>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between"
        style={{ padding: `${sp*0.6}px ${sp}px`, background: 'var(--bg-elevated)' }}
      >
        <span className="font-mono text-[var(--fg-subtle)]" style={{ fontSize: fs - 2 }}>Dr. Siriporn · Oncology</span>
        <span className="font-mono" style={{ fontSize: fs - 2, color }}>3 upcoming</span>
      </div>
    </div>
  )
}

// ─── Preset chip ──────────────────────────────────────────────────────────────

function PresetChip({ preset, onDragEnd }: {
  preset:    Preset
  onDragEnd: (id: string, x: number, y: number) => void
}) {
  return (
    <motion.div
      drag
      dragSnapToOrigin
      dragElastic={0.15}
      dragMomentum={false}
      onDragEnd={(_, info) => onDragEnd(preset.id, info.point.x, info.point.y)}
      whileDrag={{ scale: 1.05, zIndex: 50, boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}
      whileHover={{ y: -2 }}
      className="px-4 py-3 border border-[var(--border)] bg-[var(--bg)] cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: 'none' }}
    >
      <p className="font-mono text-[var(--type-sm)] text-[var(--fg)] font-medium">{preset.label}</p>
      <p className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)] mt-0.5">{preset.sub}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="w-3 h-3 rounded-full border border-black/10" style={{ background: preset.tokens.color }} />
        <span className="font-mono text-[var(--fg-subtle)]" style={{ fontSize: '10px' }}>r{preset.tokens.radius} · {preset.tokens.spacing}px · {preset.tokens.fontSize}px</span>
      </div>
    </motion.div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

const ARCHETYPES: Archetype[] = ['medium', 'large', 'specialty']

export function AtomicSection() {
  const cardRefs = useRef<Partial<Record<Archetype, HTMLDivElement>>>({})
  const [applied, setApplied]    = useState<Record<Archetype, Preset['tokens']>>({
    medium:    { ...ARCH_BASE.medium    },
    large:     { ...ARCH_BASE.large     },
    specialty: { ...ARCH_BASE.specialty },
  })
  const [shaking,  setShaking]   = useState<Archetype | null>(null)
  const [target,   setTarget]    = useState<Archetype | null>(null)
  const [lastDrop, setLastDrop]  = useState<Record<Archetype, string | null>>({ medium: null, large: null, specialty: null })

  const findCard = useCallback((x: number, y: number): Archetype | null => {
    for (const arch of ARCHETYPES) {
      const el = cardRefs.current[arch]; if (!el) continue
      const r = el.getBoundingClientRect()
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return arch
    }
    return null
  }, [])

  const handleDrag = useCallback((_: string, x: number, y: number) => {
    setTarget(findCard(x, y))
  }, [findCard])

  const handleDragEnd = useCallback((presetId: string, x: number, y: number) => {
    setTarget(null)
    const arch   = findCard(x, y); if (!arch) return
    const preset = PRESETS.find(p => p.id === presetId); if (!preset) return
    setApplied(prev => ({ ...prev, [arch]: { ...preset.tokens } }))
    setLastDrop(prev => ({ ...prev, [arch]: preset.label }))
    setTimeout(() => setLastDrop(prev => ({ ...prev, [arch]: null })), 2000)
  }, [findCard])

  const reset = useCallback(() => {
    setApplied({ medium: { ...ARCH_BASE.medium }, large: { ...ARCH_BASE.large }, specialty: { ...ARCH_BASE.specialty } })
  }, [])

  const hasChanges = ARCHETYPES.some(a => JSON.stringify(applied[a]) !== JSON.stringify(ARCH_BASE[a]))

  return (
    <section
      className={cn('px-6 md:px-12 lg:px-20 xl:px-[7.5rem]', 'py-24 md:py-32 border-t border-[var(--border)]')}
      aria-labelledby="atomic-heading"
    >
      {/* Header */}
      <div className="mb-14 max-w-[56ch]">
        <p className="font-mono text-[var(--type-xs)] uppercase tracking-widest text-[var(--accent-text)] mb-4">
          03 — Atomic structure
        </p>
        <h2 id="atomic-heading" className="font-display font-normal leading-[1.1] tracking-[-0.02em] text-[clamp(1.625rem,4vw,2.5rem)] text-[var(--fg)] mb-4">
          Three hospitals. Three structures. One system.
        </h2>
        <p className="text-[var(--type-base)] text-[var(--fg-muted)] leading-[1.7]">
          Drag a preset onto any hospital card. Medium runs a dense workflow board. Large runs a stats dashboard. Specialty is patient-profile focused. Same token root — completely different organisms.
        </p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-10 lg:gap-14 items-start">

        {/* Presets */}
        <div>
          <p className="font-mono text-[var(--type-xs)] uppercase tracking-widest text-[var(--fg-subtle)] mb-3">
            Preset bundles — drag onto any card
          </p>
          <div className="flex flex-col gap-2">
            {PRESETS.map(p => (
              <PresetChip
                key={p.id}
                preset={p}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <p className="font-mono text-[var(--type-xs)] text-[var(--fg-muted)] leading-[1.75]">
              Each preset is a named token bundle — the same way a hospital configures the system through a defined set of overrides, not free-form edits.
            </p>
            {hasChanges && (
              <button
                type="button"
                onClick={reset}
                className="mt-4 font-mono text-[var(--type-xs)] uppercase tracking-widest text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors border border-[var(--border)] px-3 py-2"
              >
                ↺ Reset all cards
              </button>
            )}
          </div>
        </div>

        {/* Cards — each has different structure */}
        <div className="grid sm:grid-cols-3 gap-4" style={{ perspective: '1200px' }}>
          {ARCHETYPES.map(arch => {
            const t    = applied[arch]
            const meta = ARCH_META[arch]
            return (
              <div key={arch} ref={el => { if (el) cardRefs.current[arch] = el }}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-mono text-[var(--type-xs)] text-[var(--fg-muted)] uppercase tracking-widest">{meta.label}</p>
                  <AnimatePresence>
                    {lastDrop[arch] && (
                      <motion.span
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="font-mono text-[var(--fg-subtle)]"
                        style={{ fontSize: '10px' }}
                      >
                        ✓ {lastDrop[arch]}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <p className="font-mono text-[var(--fg-subtle)] mb-3" style={{ fontSize: '10px' }}>{meta.sub}</p>

                <TiltCard
                  accent={t.color}
                  isTarget={target === arch}
                  shaking={shaking === arch}
                >
                  {arch === 'medium'    && <CardMedium    t={t} />}
                  {arch === 'large'     && <CardLarge     t={t} />}
                  {arch === 'specialty' && <CardSpecialty t={t} />}
                </TiltCard>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
