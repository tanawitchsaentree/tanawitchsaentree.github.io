'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useSpring, animated, config } from 'react-spring'
import { useDrag } from '@use-gesture/react'

// ── Types ──────────────────────────────────────────────────────

interface Doc {
  id: number
  label: string
  score: number   // 0–1
  x: number       // initial stagger position, 0–1 across stream
}

// ── Static document data ───────────────────────────────────────

const DOCS_DESKTOP: Doc[] = [
  { id: 1,  label: 'INV-4421',  score: 0.97, x: 0.05 },
  { id: 2,  label: 'CLM-0082',  score: 0.73, x: 0.17 },
  { id: 3,  label: 'LGL-1190',  score: 0.91, x: 0.29 },
  { id: 4,  label: 'INV-5503',  score: 0.61, x: 0.41 },
  { id: 5,  label: 'MED-3342',  score: 0.88, x: 0.53 },
  { id: 6,  label: 'RCP-0044',  score: 0.34, x: 0.65 },
  { id: 7,  label: 'INS-9901',  score: 0.95, x: 0.77 },
  { id: 8,  label: 'CLM-0120',  score: 0.48, x: 0.89 },
]

const DOCS_MOBILE: Doc[] = [
  { id: 1, label: 'INV-4421', score: 0.97, x: 0.1  },
  { id: 2, label: 'CLM-0082', score: 0.73, x: 0.3  },
  { id: 3, label: 'LGL-1190', score: 0.91, x: 0.5  },
  { id: 4, label: 'INV-5503', score: 0.61, x: 0.7  },
  { id: 5, label: 'MED-3342', score: 0.88, x: 0.9  },
]

// ── Zone classification ────────────────────────────────────────

function getZone(pct: number): 'strict' | 'balanced' | 'loose' {
  if (pct >= 80) return 'strict'
  if (pct >= 40) return 'balanced'
  return 'loose'
}

const ZONE_LABELS: Record<ReturnType<typeof getZone>, string> = {
  strict:   'Operators stay focused — few escalations',
  balanced: 'Trade-off zone — current production setting',
  loose:    'Operators overwhelmed — review queue flooded',
}

const ZONE_COLORS: Record<ReturnType<typeof getZone>, string> = {
  strict:   'var(--fg)',
  balanced: 'var(--accent-text)',
  loose:    '#ef4444',
}

// ── Document icon ──────────────────────────────────────────────

function DocIcon({
  doc,
  threshold,
  onClick,
  highlighted,
}: {
  doc: Doc
  threshold: number   // 0–100
  onClick: (doc: Doc) => void
  highlighted: boolean
}) {
  const passes = doc.score * 100 >= threshold
  const targetX = passes ? -60 : 60  // queue=left, review=right (relative px offset hint)

  const [spring] = useSpring(() => ({
    x: targetX,
    config: config.gentle,
  }))

  // re-animate on passes change
  const springRef = useRef<ReturnType<typeof useSpring>[0]>(spring)
  springRef.current = spring

  useEffect(() => {
    // useSpring doesn't have an imperative API at top level in this pattern;
    // we'll use a separate animated value approach below
  }, [passes])

  return (
    <motion.button
      type="button"
      onClick={() => onClick(doc)}
      layout
      animate={{
        x: passes ? -48 : 48,
        opacity: highlighted ? 1 : 0.85,
        scale: highlighted ? 1.08 : 1,
      }}
      transition={{ type: 'spring', stiffness: 180, damping: 22 }}
      className="flex flex-col items-center gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--fg)] rounded"
      aria-label={`${doc.label}, confidence ${Math.round(doc.score * 100)}%`}
    >
      {/* Doc icon */}
      <div
        className="relative w-8 h-10 rounded-sm border flex items-end justify-center pb-1"
        style={{
          background: passes ? 'var(--bg-elevated)' : 'color-mix(in oklab, var(--bg-elevated) 60%, transparent)',
          borderColor: highlighted ? 'var(--accent-text)' : 'var(--border)',
          transition: 'border-color 200ms ease',
        }}
      >
        {/* folded corner */}
        <div
          className="absolute top-0 right-0 w-2 h-2"
          style={{
            background: 'var(--bg)',
            borderLeft: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
          }}
        />
        {/* score badge */}
        <span
          className="font-mono text-[9px] leading-none"
          style={{ color: passes ? 'var(--accent-text)' : 'var(--fg-subtle)' }}
        >
          {Math.round(doc.score * 100)}%
        </span>
      </div>
      <span
        className="font-mono uppercase tracking-[0.06em] leading-none"
        style={{ fontSize: 8, color: 'var(--fg-subtle)' }}
      >
        {doc.label}
      </span>
    </motion.button>
  )
}

// ── Tooltip on doc tap ─────────────────────────────────────────

function DocTooltip({ doc, threshold, onClose }: { doc: Doc; threshold: number; onClose: () => void }) {
  const passes = doc.score * 100 >= threshold
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.18 }}
      className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      style={{ bottom: 'calc(100% + 8px)', minWidth: 220 }}
    >
      <div
        className="rounded-lg px-3 py-2 text-center border"
        style={{
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--fg-subtle)] mb-1">
          {doc.label}
        </p>
        <p className="font-mono text-[11px] text-[var(--fg)]">
          score <span style={{ color: 'var(--accent-text)' }}>{Math.round(doc.score * 100)}%</span>
          {' '}
          {passes ? '≥' : '<'} threshold <span style={{ color: 'var(--fg)' }}>{threshold}%</span>
        </p>
        <p className="font-mono text-[10px] mt-1" style={{ color: passes ? 'var(--accent-text)' : '#ef4444' }}>
          → {passes ? 'Auto-routed to team queue' : 'Sent to review card'}
        </p>
      </div>
    </motion.div>
  )
}

// ── Slider thumb ───────────────────────────────────────────────

function SliderTrack({
  value,
  onChange,
}: {
  value: number   // 0–100
  onChange: (v: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  const bind = useDrag(
    ({ xy: [clientX], first, memo }) => {
      const track = trackRef.current
      if (!track) return memo
      const rect = track.getBoundingClientRect()
      const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
      onChange(Math.round(pct))
      return memo
    },
    { axis: 'x', filterTaps: true }
  )

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft')  onChange(Math.max(0,   value - 5))
    if (e.key === 'ArrowRight') onChange(Math.min(100, value + 5))
    if (e.key === 'Home') onChange(0)
    if (e.key === 'End')  onChange(100)
  }, [value, onChange])

  return (
    <div
      ref={trackRef}
      className="relative w-full h-1 rounded-full cursor-pointer select-none"
      style={{ background: 'var(--border)' }}
      {...bind()}
      role="presentation"
    >
      {/* Fill */}
      <div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{
          width: `${value}%`,
          background: 'var(--fg)',
          transition: 'width 40ms linear',
        }}
      />

      {/* Zone ticks */}
      {[40, 80].map(tick => (
        <div
          key={tick}
          className="absolute top-1/2 -translate-y-1/2 w-px h-3"
          style={{ left: `${tick}%`, background: 'var(--border)', opacity: 0.6 }}
          aria-hidden="true"
        />
      ))}

      {/* Thumb */}
      <div
        {...bind()}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label="Confidence threshold"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-[var(--fg)] focus-visible:outline-offset-2"
        style={{
          left: `${value}%`,
          background: 'var(--fg)',
          borderColor: 'var(--bg)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          transition: 'left 40ms linear',
          touchAction: 'none',
        }}
      />
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────

export function ConfidenceSlider() {
  const reduced = useReducedMotion()
  const isMobileRef = useRef(false)
  const [threshold, setThreshold] = useState(60)
  const [highlightedDoc, setHighlightedDoc] = useState<Doc | null>(null)
  const [docs, setDocs] = useState<Doc[]>(DOCS_DESKTOP)
  const [autoDemoDone, setAutoDemoDone] = useState(false)
  const autoDemoRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Detect mobile, set doc list
  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches
    isMobileRef.current = isMobile
    setDocs(isMobile ? DOCS_MOBILE : DOCS_DESKTOP)

    if (!isMobile && !reduced && !autoDemoDone) {
      // Auto-demo: 60 → 30 → 95 → 60, 1x only
      const steps: Array<[number, number]> = [
        [600,  30],   // pause, then drag to 30%
        [1800, 95],   // drag to 95%
        [3200, 60],   // settle at 60%
      ]
      steps.forEach(([delay, val]) => {
        autoDemoRef.current = setTimeout(() => setThreshold(val), delay)
      })
      setTimeout(() => setAutoDemoDone(true), 4000)
    }
    return () => { if (autoDemoRef.current) clearTimeout(autoDemoRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDocClick = useCallback((doc: Doc) => {
    setHighlightedDoc(prev => prev?.id === doc.id ? null : doc)
  }, [])

  const zone = getZone(threshold)
  const passing = docs.filter(d => d.score * 100 >= threshold).length
  const reviewing = docs.length - passing

  return (
    <div
      className="relative w-full rounded-2xl border overflow-hidden select-none"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border)',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
      }}
      aria-label="Confidence gate simulator"
    >

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">
          Interactive — Confidence Gate
        </p>
        <p
          className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]"
          style={{ color: 'var(--accent-text)' }}
        >
          Threshold: {threshold}%
        </p>
      </div>

      {/* Document stream */}
      <div className="relative mb-8">
        <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--fg-subtle)] mb-3">
          Document stream
        </p>

        <div
          className="relative flex items-end justify-around"
          style={{ height: 72 }}
        >
          {docs.map(doc => (
            <div key={doc.id} className="relative">
              <DocIcon
                doc={doc}
                threshold={threshold}
                onClick={handleDocClick}
                highlighted={highlightedDoc?.id === doc.id}
              />
              <AnimatePresence>
                {highlightedDoc?.id === doc.id && (
                  <DocTooltip
                    doc={doc}
                    threshold={threshold}
                    onClose={() => setHighlightedDoc(null)}
                  />
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Arrow down */}
        <div className="flex justify-center mt-2">
          <span className="font-mono text-[var(--fg-subtle)] text-xs">↓</span>
        </div>
      </div>

      {/* Gate row */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-8">

        {/* Left bucket — Team Queue */}
        <motion.div
          className="rounded-xl border p-3 text-center"
          animate={{
            borderColor: zone === 'strict'
              ? 'var(--fg)'
              : zone === 'balanced'
                ? 'var(--accent-text)'
                : 'var(--border)',
          }}
          transition={{ duration: 0.3 }}
          style={{ background: 'var(--bg)' }}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--fg-subtle)] mb-1">
            Team Queue
          </p>
          <motion.p
            className="font-mono font-medium"
            style={{ fontSize: 'clamp(1.25rem, 3vw, 2rem)', color: 'var(--fg)' }}
            key={passing}
            initial={{ scale: 1.2, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {passing}
          </motion.p>
          <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">
            auto-routed
          </p>
        </motion.div>

        {/* Gate label */}
        <div className="flex flex-col items-center gap-2 px-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">Gate</span>
          <div
            className="rounded-full px-3 py-1 border font-mono text-[10px] uppercase tracking-[0.08em]"
            style={{
              background: 'var(--bg)',
              borderColor: 'var(--fg)',
              color: 'var(--fg)',
              whiteSpace: 'nowrap',
            }}
          >
            ≥ {threshold}%
          </div>
          <div
            className="w-px flex-1"
            style={{ background: 'var(--border)', minHeight: 8 }}
            aria-hidden="true"
          />
        </div>

        {/* Right bucket — Review Card */}
        <motion.div
          className="rounded-xl border p-3 text-center"
          animate={{
            borderColor: zone === 'loose'
              ? '#ef4444'
              : zone === 'balanced'
                ? 'var(--accent-text)'
                : 'var(--border)',
          }}
          transition={{ duration: 0.3 }}
          style={{ background: 'var(--bg)' }}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--fg-subtle)] mb-1">
            Review Card
          </p>
          <motion.p
            className="font-mono font-medium"
            style={{
              fontSize: 'clamp(1.25rem, 3vw, 2rem)',
              color: zone === 'loose' ? '#ef4444' : 'var(--fg)',
            }}
            key={reviewing}
            initial={{ scale: 1.2, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {reviewing}
          </motion.p>
          <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">
            need review
          </p>
        </motion.div>
      </div>

      {/* Slider */}
      <div className="mb-6">
        <div className="flex justify-between mb-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">0% — route all</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">100% — review all</span>
        </div>
        <SliderTrack value={threshold} onChange={setThreshold} />
        <div className="flex justify-between mt-2">
          <span className="font-mono text-[9px] text-[var(--fg-subtle)]">loose</span>
          <span className="font-mono text-[9px]" style={{ color: 'var(--accent-text)' }}>balanced</span>
          <span className="font-mono text-[9px] text-[var(--fg-subtle)]">strict</span>
        </div>
      </div>

      {/* Zone label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={zone}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] text-center"
          style={{ color: ZONE_COLORS[zone] }}
        >
          {ZONE_LABELS[zone]}
        </motion.p>
      </AnimatePresence>

      {/* Tap hint */}
      <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-[var(--fg-subtle)] text-center mt-4 opacity-60">
        Tap any document to see why it was routed
      </p>
    </div>
  )
}
