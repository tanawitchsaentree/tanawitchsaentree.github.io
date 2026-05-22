'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

// ── Data ──────────────────────────────────────────────────────────────────────

interface Doc {
  id:      number
  label:   string
  type:    string
  score:   number   // 0–1
}

const DOCS: Doc[] = [
  { id: 1, label: 'INV-4421', type: 'Invoice',       score: 0.97 },
  { id: 2, label: 'CLM-0082', type: 'Claim',         score: 0.73 },
  { id: 3, label: 'LGL-1190', type: 'Legal notice',  score: 0.91 },
  { id: 4, label: 'INV-5503', type: 'Invoice',       score: 0.61 },
  { id: 5, label: 'MED-3342', type: 'Medical',       score: 0.88 },
]

const THRESHOLD = 0.80   // production setting shown in demo

// ── Subcomponents ─────────────────────────────────────────────────────────────

function ScoreBadge({ score, visible }: { score: number; visible: boolean }) {
  const pct     = Math.round(score * 100)
  const passes  = score >= THRESHOLD
  const color   = passes ? '#16a34a' : '#dc2626'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -8, width: 0 }}
          animate={{ opacity: 1, x: 0, width: 'auto' }}
          exit={{ opacity: 0, x: -8, width: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2 overflow-hidden"
        >
          {/* Score number — big, the point of the demo */}
          <span
            className="font-mono font-medium tabular-nums"
            style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color, lineHeight: 1 }}
          >
            {pct}%
          </span>
          {/* Route badge */}
          <span
            className="font-mono text-[10px] uppercase tracking-[0.08em] px-2 py-0.5 rounded-full border"
            style={{
              color,
              borderColor: color,
              background: passes ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
              whiteSpace: 'nowrap',
            }}
          >
            {passes ? 'Auto-routed' : 'Needs review'}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function DocRow({ doc, revealed, isNew }: { doc: Doc; revealed: boolean; isNew: boolean }) {
  const passes = doc.score >= THRESHOLD

  return (
    <motion.div
      layout
      className="flex items-center justify-between gap-4 py-4 border-b border-[var(--border)] last:border-b-0"
    >
      {/* Left: icon + label */}
      <div className="flex items-center gap-3 min-w-0">
        {/* doc icon */}
        <div
          className="flex-shrink-0 relative w-7 h-9 rounded-sm border flex items-end justify-center pb-[3px]"
          style={{
            background: 'var(--bg-muted)',
            borderColor: revealed && !passes ? 'rgba(220,38,38,0.35)' : 'var(--border)',
            transition: 'border-color 300ms ease',
          }}
        >
          <div
            className="absolute top-0 right-0 w-[7px] h-[7px]"
            style={{
              background: 'var(--bg-elevated)',
              borderLeft: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
            }}
          />
          <span
            className="font-mono leading-none"
            style={{ fontSize: 7, color: 'var(--fg-subtle)' }}
          >
            DOC
          </span>
        </div>

        <div className="min-w-0">
          <p
            className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] text-[var(--fg)]"
            style={{ lineHeight: 1.3 }}
          >
            {doc.label}
          </p>
          <p
            className="font-mono text-[var(--fg-subtle)] truncate"
            style={{ fontSize: 10, marginTop: 2 }}
          >
            {doc.type}
          </p>
        </div>
      </div>

      {/* Right: before state or after state */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {!revealed ? (
          // Before: all look identical — just a checkmark
          <motion.span
            initial={isNew ? { opacity: 0, scale: 0.8 } : false}
            animate={{ opacity: 1, scale: 1 }}
            className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em]"
            style={{ color: 'var(--fg-muted)' }}
          >
            ✓ Routed
          </motion.span>
        ) : (
          <ScoreBadge score={doc.score} visible={revealed} />
        )}
      </div>
    </motion.div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function ConfidenceGate() {
  const [revealed, setRevealed] = useState(false)
  const reduced = useReducedMotion()

  const reviewCount = DOCS.filter(d => d.score < THRESHOLD).length

  return (
    <div
      className="w-full rounded-2xl border overflow-hidden"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
    >
      {/* Top bar — toggle */}
      <div
        className="flex items-center justify-between gap-4 px-6 py-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">
          Operator view — incoming documents
        </p>

        {/* Toggle */}
        <button
          type="button"
          onClick={() => setRevealed(v => !v)}
          className="flex items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--fg)] rounded-full px-3 py-1.5 border transition-colors"
          style={{
            background: revealed ? 'var(--fg)' : 'var(--bg)',
            borderColor: 'var(--fg)',
          }}
          aria-pressed={revealed}
          aria-label="Toggle confidence gate"
        >
          <span
            className="font-mono text-[10px] uppercase tracking-[0.1em] font-medium"
            style={{ color: revealed ? 'var(--bg)' : 'var(--fg)', whiteSpace: 'nowrap' }}
          >
            {revealed ? 'Gate on' : 'Gate off'}
          </span>
          {/* pill indicator */}
          <div
            className="w-7 h-3.5 rounded-full relative flex-shrink-0"
            style={{ background: revealed ? 'var(--bg)' : 'var(--border)' }}
            aria-hidden="true"
          >
            <motion.div
              className="absolute top-0.5 w-2.5 h-2.5 rounded-full"
              animate={{ left: revealed ? 'calc(100% - 12px)' : 2 }}
              transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }}
              style={{ background: revealed ? 'var(--fg)' : 'var(--fg-subtle)' }}
            />
          </div>
        </button>
      </div>

      {/* Document list */}
      <div className="px-6 py-2">
        {DOCS.map((doc, i) => (
          <DocRow
            key={doc.id}
            doc={doc}
            revealed={revealed}
            isNew={i === 0}
          />
        ))}
      </div>

      {/* Footer callout — only visible when gate is on */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className="mx-6 mb-4 px-4 py-3 rounded-xl border"
              style={{
                background: 'rgba(220,38,38,0.06)',
                borderColor: 'rgba(220,38,38,0.25)',
              }}
            >
              <p className="font-mono text-[var(--type-xs)] leading-[1.6]" style={{ color: '#dc2626' }}>
                {reviewCount} of {DOCS.length} documents needed human review —
                {' '}<span className="text-[var(--fg-muted)]" style={{ color: 'inherit', opacity: 0.8 }}>
                  they looked identical before the gate existed.
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
