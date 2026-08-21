'use client'

/**
 * BatchDispatch: the aggregate / ops view — "a separate queue, not a filtered view."
 *
 * ConfidenceGate proves the per-document decision: tap a flagged document, see the
 * AI's read, the runner-up, and decide. This demo proves the different claim the
 * "fallback-states" case makes — that the fallback queue is a distinct operational
 * surface with its own SLA and its own cost, not overflow from the standard queue.
 *
 * Processing a batch splits it into two queues with two different clocks. There's
 * no per-document reveal here on purpose — that mechanic already belongs to
 * ConfidenceGate. What this view adds is the thing a single-document card can't
 * show: how many documents miss the standard queue, and what that costs in review
 * time once it's added up.
 */

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

type Outcome = 'queued' | 'fallback'

interface Doc {
  id: number; label: string; type: string; score: number
  outcome: Outcome; reason: string
}

const DOCS: Doc[] = [
  { id: 1, label: 'INV-7734', type: 'Invoice',      score: 0.97, outcome: 'queued',   reason: '' },
  { id: 2, label: 'CLM-2210', type: 'Claim',        score: 0.61, outcome: 'fallback',
    reason: 'References a third-party liability disputed in a prior case. Standard vs Complex routing carries different SLA consequences.' },
  { id: 3, label: 'LGL-0587', type: 'Legal notice', score: 0.91, outcome: 'queued',   reason: '' },
  { id: 4, label: 'MED-9021', type: 'Medical',      score: 0.54, outcome: 'fallback',
    reason: 'Contains both a completed treatment reference and a pending authorisation request in the same document.' },
]

// Illustrative, not a measured figure — the point is that the cost compounds per document.
const AVG_REVIEW_MINUTES = 6
const STANDARD_SLA = 'routes in seconds'
const FALLBACK_SLA = '4 business hours'

type Phase = 'idle' | 'dispatching' | 'done'

export function BatchDispatch() {
  const [phase, setPhase] = useState<Phase>('idle')
  const reduced = useReducedMotion()

  const dispatch = useCallback(() => {
    if (phase !== 'idle') return
    setPhase('dispatching')
    setTimeout(() => setPhase('done'), reduced ? 100 : 900)
  }, [phase, reduced])

  const queued   = useMemo(() => DOCS.filter(d => d.outcome === 'queued'), [])
  const fallback = useMemo(() => DOCS.filter(d => d.outcome === 'fallback'), [])
  const addedMinutes = fallback.length * AVG_REVIEW_MINUTES
  const dispatched = phase === 'dispatching' || phase === 'done'

  return (
    <div data-demo="batch-dispatch" className="w-full rounded-[var(--radius-lg)] border overflow-hidden" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">Incoming batch · {DOCS.length} documents</p>
        <AnimatePresence mode="wait">
          {phase === 'idle' ? (
            <motion.button key="btn" type="button" onClick={dispatch}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] px-3.5 py-2 rounded-[var(--radius-sm)] cursor-pointer transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]"
              style={{ background: 'var(--fg)', color: 'var(--bg)' }}>
              Process batch →
            </motion.button>
          ) : phase === 'done' ? (
            <motion.button key="reset" type="button" onClick={() => setPhase('idle')}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] text-[var(--fg-subtle)] hover:text-[var(--fg)] cursor-pointer transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]">
              reset
            </motion.button>
          ) : (
            <motion.span key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">
              Splitting into queues…
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* two queues, two clocks */}
      <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
        {/* standard queue */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-muted)]">Standard queue</p>
            <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]">{STANDARD_SLA}</span>
          </div>

          <AnimatePresence>
            {dispatched && (
              <motion.p
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="font-mono text-[var(--type-base)] text-[var(--fg)] mb-2"
              >
                {queued.length} of {DOCS.length} auto-routed
              </motion.p>
            )}
          </AnimatePresence>

          <ul className="flex flex-col gap-1">
            {queued.map(d => (
              <li key={d.id} className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]">
                {d.label} · {d.type}
              </li>
            ))}
          </ul>
        </div>

        {/* fallback queue */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--accent-text)]" style={{ fontWeight: 500 }}>
              Fallback queue
            </p>
            <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]">SLA · {FALLBACK_SLA}</span>
          </div>

          <AnimatePresence>
            {dispatched && (
              <motion.p
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="font-mono text-[var(--type-base)] text-[var(--fg)] mb-2"
              >
                {fallback.length} of {DOCS.length} held for a human decision
              </motion.p>
            )}
          </AnimatePresence>

          <ul className="flex flex-col gap-2.5">
            {fallback.map(d => (
              <li key={d.id}>
                <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.06em] text-[var(--fg)]" style={{ fontWeight: 500 }}>
                  {d.label} · {d.type}
                </p>
                <p className="text-[var(--type-xs)] text-[var(--fg-muted)] leading-[1.5] max-w-[42ch] mt-0.5">
                  {d.reason}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* the cost this queue adds, in review time — the point a single-document card can't make */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.25, delay: 0.35 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-3.5 border-t" style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--accent) 8%, transparent)' }}>
              <p className="font-mono leading-[1.6] text-[var(--fg)]" style={{ fontSize: 'var(--type-base)' }}>
                <span style={{ color: 'var(--accent-text)', fontWeight: 500 }}>~{addedMinutes} min</span> of review time this batch adds to the fallback queue, at an illustrative ~{AVG_REVIEW_MINUTES} min per document held.
                <span className="text-[var(--fg-muted)]"> That cost is invisible until the queue is measured on its own SLA, separate from the standard flow.</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
