'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

// ── Data ──────────────────────────────────────────────────────────────────────

type Outcome = 'queued' | 'fallback'

interface Doc {
  id:         number
  label:      string
  type:       string
  score:      number   // 0–1
  outcome:    Outcome
  aiChoice:   string
  alternative: string
  reason:     string
}

const DOCS: Doc[] = [
  {
    id: 1, label: 'INV-4421', type: 'Invoice', score: 0.97, outcome: 'queued',
    aiChoice: 'Accounts Payable', alternative: 'Legal', reason: '',
  },
  {
    id: 2, label: 'CLM-0082', type: 'Claim', score: 0.61, outcome: 'fallback',
    aiChoice: 'Claims — Standard',
    alternative: 'Claims — Complex',
    reason: 'Claim references a third-party liability disputed in a prior case. Standard or Complex routing carries different SLA consequences.',
  },
  {
    id: 3, label: 'LGL-1190', type: 'Legal notice', score: 0.91, outcome: 'queued',
    aiChoice: 'Legal', alternative: 'Compliance', reason: '',
  },
  {
    id: 4, label: 'MED-3342', type: 'Medical', score: 0.54, outcome: 'fallback',
    aiChoice: 'Medical Claims',
    alternative: 'Pre-authorisation',
    reason: 'Document contains both a completed treatment reference and a pending authorisation request. Routing depends on which the operator treats as primary.',
  },
]

type Phase = 'idle' | 'dispatching' | 'done'

// ── Subcomponents ─────────────────────────────────────────────────────────────

function ReviewCard({ doc }: { doc: Doc }) {
  const [action, setAction] = useState<'confirm' | 'reclassify' | null>(null)
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: reduced ? 0.15 : 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div
        className="mx-0 mt-2 rounded-xl border p-4"
        style={{
          background: 'var(--bg)',
          borderColor: 'rgba(220,38,38,0.25)',
          borderLeft: '2px solid #dc2626',
        }}
      >
        {/* AI reading */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--fg-subtle)] mb-1">
              AI reading
            </p>
            <p className="font-mono text-[11px] font-medium text-[var(--fg)]">
              {doc.aiChoice}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--fg-subtle)] mb-1">
              Confidence
            </p>
            <p className="font-mono text-[11px] font-medium" style={{ color: '#dc2626' }}>
              {Math.round(doc.score * 100)}%
            </p>
          </div>
        </div>

        {/* Closest alternative */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-[9px] text-[var(--fg-subtle)] uppercase tracking-[0.06em]">
            vs.
          </span>
          <span className="font-mono text-[10px] text-[var(--fg-muted)] px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border)' }}>
            {doc.alternative}
          </span>
        </div>

        {/* Reason */}
        <p className="text-[var(--type-xs)] leading-[1.6] text-[var(--fg-muted)] mb-4">
          {doc.reason}
        </p>

        {/* Actions */}
        <AnimatePresence mode="wait">
          {!action ? (
            <motion.div
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-2"
            >
              <button
                type="button"
                onClick={() => setAction('confirm')}
                className="flex-1 font-mono text-[9px] uppercase tracking-[0.1em] py-2 rounded border cursor-pointer transition-colors"
                style={{ background: 'var(--fg)', color: 'var(--bg)', borderColor: 'var(--fg)' }}
              >
                Confirm → {doc.aiChoice}
              </button>
              <button
                type="button"
                onClick={() => setAction('reclassify')}
                className="flex-1 font-mono text-[9px] uppercase tracking-[0.1em] py-2 rounded border cursor-pointer transition-colors"
                style={{ color: 'var(--fg-muted)', borderColor: 'var(--border)', background: 'transparent' }}
              >
                Reclassify → {doc.alternative}
              </button>
            </motion.div>
          ) : (
            <motion.p
              key="done"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-[10px] uppercase tracking-[0.08em]"
              style={{ color: action === 'confirm' ? '#16a34a' : 'var(--accent-text)' }}
            >
              {action === 'confirm'
                ? `✓ Routed to ${doc.aiChoice}`
                : `↻ Reclassified to ${doc.alternative}`}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function DocItem({
  doc,
  phase,
  index,
  expanded,
  onToggle,
}: {
  doc: Doc
  phase: Phase
  index: number
  expanded: boolean
  onToggle: () => void
}) {
  const reduced   = useReducedMotion()
  const delay     = reduced ? 0 : index * 0.12
  const isFallback = doc.outcome === 'fallback'
  const dispatched = phase === 'dispatching' || phase === 'done'

  return (
    <div className="border-b border-[var(--border)] last:border-b-0">
      <div
        className="flex items-center justify-between gap-3 py-3"
        role={isFallback && dispatched ? 'button' : undefined}
        tabIndex={isFallback && dispatched ? 0 : undefined}
        onClick={isFallback && dispatched ? onToggle : undefined}
        onKeyDown={isFallback && dispatched ? e => e.key === 'Enter' && onToggle() : undefined}
        style={{ cursor: isFallback && dispatched ? 'pointer' : 'default' }}
        aria-expanded={isFallback && dispatched ? expanded : undefined}
      >
        {/* Left */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex-shrink-0 relative w-6 h-8 rounded-[2px] border flex items-end justify-center pb-[2px]"
            style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}
          >
            <div className="absolute top-0 right-0 w-[6px] h-[6px]"
              style={{ background: 'var(--bg-elevated)', borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
            />
            <span className="font-mono leading-none" style={{ fontSize: 6, color: 'var(--fg-subtle)' }}>DOC</span>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--fg)]">{doc.label}</p>
            <p className="font-mono text-[var(--fg-subtle)]" style={{ fontSize: 9 }}>{doc.type}</p>
          </div>
        </div>

        {/* Status badge */}
        <AnimatePresence>
          {dispatched && (
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, delay, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-1.5"
            >
              {isFallback && (
                <span className="font-mono text-[9px] text-[var(--fg-subtle)]">
                  {expanded ? '↑' : '↓'}
                </span>
              )}
              <span
                className="font-mono text-[10px] uppercase tracking-[0.08em] px-2 py-0.5 rounded-full border"
                style={isFallback ? {
                  color: '#dc2626',
                  borderColor: 'rgba(220,38,38,0.3)',
                  background: 'rgba(220,38,38,0.07)',
                } : {
                  color: '#16a34a',
                  borderColor: 'rgba(22,163,74,0.3)',
                  background: 'rgba(22,163,74,0.07)',
                }}
              >
                {isFallback ? 'Fallback' : `→ ${doc.aiChoice}`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Review card */}
      <AnimatePresence>
        {isFallback && dispatched && expanded && (
          <ReviewCard doc={doc} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function BatchDispatch() {
  const [phase,    setPhase]    = useState<Phase>('idle')
  const [expanded, setExpanded] = useState<number | null>(null)
  const reduced = useReducedMotion()

  const dispatch = useCallback(() => {
    if (phase !== 'idle') return
    setPhase('dispatching')
    setTimeout(() => setPhase('done'), reduced ? 100 : 800)
  }, [phase, reduced])

  const fallbackCount = DOCS.filter(d => d.outcome === 'fallback').length

  return (
    <div
      className="w-full rounded-2xl border overflow-hidden"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">
          Batch dispatch — incoming queue
        </p>

        <AnimatePresence mode="wait">
          {phase === 'idle' ? (
            <motion.button
              key="btn"
              type="button"
              onClick={dispatch}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 rounded border cursor-pointer transition-colors"
              style={{ background: 'var(--fg)', color: 'var(--bg)', borderColor: 'var(--fg)' }}
            >
              Process batch →
            </motion.button>
          ) : phase === 'done' ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.08em]" style={{ color: '#16a34a' }}>
                {DOCS.length - fallbackCount} routed
              </span>
              <span className="font-mono text-[9px] text-[var(--fg-subtle)]">·</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.08em]" style={{ color: '#dc2626' }}>
                {fallbackCount} fallback
              </span>
              <button
                type="button"
                onClick={() => { setPhase('idle'); setExpanded(null) }}
                className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--fg-subtle)] hover:text-[var(--fg)] cursor-pointer transition-colors"
              >
                Reset
              </button>
            </motion.div>
          ) : (
            <motion.span
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--fg-subtle)]"
            >
              Processing…
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Doc list */}
      <div className="px-6 py-2">
        {DOCS.map((doc, i) => (
          <DocItem
            key={doc.id}
            doc={doc}
            phase={phase}
            index={i}
            expanded={expanded === doc.id}
            onToggle={() => setExpanded(prev => prev === doc.id ? null : doc.id)}
          />
        ))}
      </div>

      {/* Footer hint */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.25, delay: 0.4 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--fg-subtle)]">
                Tap a fallback document to see the handoff — not an error, a decision.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
