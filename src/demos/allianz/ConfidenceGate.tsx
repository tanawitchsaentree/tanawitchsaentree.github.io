'use client'

/**
 * ConfidenceGate — the project's thesis, made tactile.
 *
 * "Good AI and bad AI looked identical at the point of decision."
 *
 * Gate OFF: every document reads the same — a calm column of "✓ routed" ink.
 * The operator has no way to know which results were guesses.
 *
 * Gate ON: the documents the AI wasn't sure about get HIGHLIGHTED — literally
 * marked with the highlighter, the way you'd flag a line on paper you need to
 * come back to. Not red, not an error: a decision waiting for a human. That
 * colour choice IS the argument — uncertainty is a state to act on, not a fault
 * to fix. Each flagged doc opens an inline handoff: the AI's read, the runner-up,
 * and the operator's call.
 */

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { Handoff } from './Handoff'

interface Doc {
  id:          number
  label:       string
  type:        string
  score:       number
  aiChoice:    string
  alternative: string
  reason:      string
}

const DOCS: Doc[] = [
  { id: 1, label: 'INV-4421', type: 'Invoice',      score: 0.97, aiChoice: 'Accounts Payable', alternative: 'Legal',            reason: '' },
  { id: 2, label: 'CLM-0082', type: 'Claim',        score: 0.64, aiChoice: 'Claims · Standard', alternative: 'Claims · Complex', reason: 'References a third-party liability disputed in a prior case. Standard vs Complex carry different SLAs.' },
  { id: 3, label: 'LGL-1190', type: 'Legal notice', score: 0.93, aiChoice: 'Legal',             alternative: 'Compliance',       reason: '' },
  { id: 4, label: 'INV-5503', type: 'Invoice',      score: 0.58, aiChoice: 'Accounts Payable',  alternative: 'Procurement',      reason: 'Line items match a purchase order still in approval. Could be payable now or pending receipt.' },
  { id: 5, label: 'MED-3342', type: 'Medical',      score: 0.89, aiChoice: 'Medical Claims',    alternative: 'Pre-authorisation', reason: '' },
]

const THRESHOLD = 0.80

function ConfBar({ score, on }: { score: number; on: boolean }) {
  const pct = Math.round(score * 100)
  const low = score < THRESHOLD
  return (
    <div className="flex items-center gap-2.5 w-[116px] flex-shrink-0">
      <div className="relative flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          initial={false}
          animate={{ width: on ? `${pct}%` : '100%' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: on ? (low ? 'var(--accent)' : 'var(--fg)') : 'var(--fg-subtle)' }}
        />
      </div>
      <span
        className="font-mono tabular-nums text-[var(--type-xs)] w-9 text-right transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-quick)]"
        style={{ color: on ? (low ? 'var(--accent-text)' : 'var(--fg)') : 'var(--fg-subtle)' }}
      >
        {on ? `${pct}%` : '—'}
      </span>
    </div>
  )
}

function DocRow({ doc, on, expanded, onToggle }: {
  doc: Doc; on: boolean; expanded: boolean; onToggle: () => void
}) {
  const reduced = useReducedMotion()
  const low = doc.score < THRESHOLD
  const flagged = on && low

  return (
    <div className="relative">
      {/* highlighter mark — sweeps in behind a flagged row */}
      <AnimatePresence>
        {flagged && (
          <motion.div
            className="absolute inset-y-[3px] left-0 right-0 -z-0 rounded-[3px] pointer-events-none"
            initial={reduced ? { opacity: 0 } : { scaleX: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0, background: 'color-mix(in srgb, var(--accent) 22%, transparent)' }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div
        className={cn(
          'relative z-10 flex items-center gap-4 py-3.5 px-3',
          flagged && 'cursor-pointer'
        )}
        role={flagged ? 'button' : undefined}
        tabIndex={flagged ? 0 : undefined}
        aria-expanded={flagged ? expanded : undefined}
        onClick={flagged ? onToggle : undefined}
        onKeyDown={flagged ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() } } : undefined}
      >
        {/* file glyph */}
        <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)] w-4 flex-shrink-0 text-center" aria-hidden="true">
          ▭
        </span>

        {/* identity */}
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[var(--type-sm)] uppercase tracking-[0.06em] text-[var(--fg)]" style={{ fontWeight: 500 }}>
            {doc.label}
          </p>
          <p className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)] truncate mt-0.5">
            {doc.type}
          </p>
        </div>

        <ConfBar score={doc.score} on={on} />

        {/* verdict */}
        <span className="w-[120px] flex-shrink-0 text-right">
          {!on ? (
            <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] text-[var(--fg-subtle)]">
              ✓ routed
            </span>
          ) : flagged ? (
            <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] text-[var(--accent-text)] inline-flex items-center gap-1.5">
              decide {expanded ? '↑' : '↓'}
            </span>
          ) : (
            <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] text-[var(--fg-muted)]">
              → {doc.aiChoice}
            </span>
          )}
        </span>
      </div>

      {/* inline handoff — the decision, not an error dialog */}
      <AnimatePresence initial={false}>
        {flagged && expanded && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden relative z-10"
          >
            <Handoff doc={doc} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ConfidenceGate() {
  const [on, setOn] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)
  const reviewCount = DOCS.filter(d => d.score < THRESHOLD).length

  return (
    <div
      data-demo="confidence-gate"
      className="w-full rounded-[var(--radius-lg)] border overflow-hidden"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
    >
      {/* terminal header */}
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]" aria-hidden="true">●</span>
          <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)] truncate">
            Triage queue · 5 documents
          </p>
        </div>

        <button
          type="button"
          onClick={() => { setOn(v => !v); setExpanded(null) }}
          className="flex items-center gap-2.5 cursor-pointer rounded-full pl-3 pr-1.5 py-1.5 border transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)] focus-visible:outline-2 focus-visible:outline-[var(--fg)] focus-visible:outline-offset-2"
          style={{ background: on ? 'var(--fg)' : 'var(--bg)', borderColor: 'var(--fg)' }}
          aria-pressed={on}
          aria-label="Toggle confidence gate"
        >
          <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]" style={{ color: on ? 'var(--bg)' : 'var(--fg)', fontWeight: 500, whiteSpace: 'nowrap' }}>
            Confidence gate {on ? 'on' : 'off'}
          </span>
          <span className="w-7 h-3.5 rounded-full relative flex-shrink-0" style={{ background: on ? 'var(--bg)' : 'var(--border)' }} aria-hidden="true">
            <motion.span
              className="absolute top-0.5 w-2.5 h-2.5 rounded-full"
              animate={{ left: on ? 'calc(100% - 12px)' : '2px' }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              style={{ background: on ? 'var(--fg)' : 'var(--fg-subtle)' }}
            />
          </span>
        </button>
      </div>

      {/* column labels */}
      <div className="flex items-center gap-4 px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="w-4 flex-shrink-0" aria-hidden="true" />
        <span className="flex-1 font-mono text-[var(--type-xs)] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">Document</span>
        <span className="w-[116px] flex-shrink-0 font-mono text-[var(--type-xs)] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">Confidence</span>
        <span className="w-[120px] flex-shrink-0 text-right font-mono text-[var(--type-xs)] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">Routing</span>
      </div>

      {/* rows */}
      <div className="px-2 divide-y divide-[var(--border)]">
        {DOCS.map(doc => (
          <DocRow
            key={doc.id}
            doc={doc}
            on={on}
            expanded={expanded === doc.id}
            onToggle={() => setExpanded(prev => prev === doc.id ? null : doc.id)}
          />
        ))}
      </div>

      {/* summary band */}
      <AnimatePresence>
        {on && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="px-5 py-3.5 border-t"
            style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--accent) 8%, transparent)' }}
          >
            <p className="font-mono text-[var(--type-xs)] leading-[1.6] text-[var(--fg)]">
              <span style={{ color: 'var(--accent-text)', fontWeight: 500 }}>{reviewCount} of {DOCS.length}</span> were guesses, not answers
              <span className="text-[var(--fg-muted)]"> — and looked identical to the rest until the gate marked them.</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
