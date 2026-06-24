'use client'

/**
 * BatchDispatch — "Fallback before happy path. Uncertainty is a handoff."
 *
 * Process a real incoming batch. Most documents route themselves (ink — the
 * system acted). The ones the AI can't commit to get highlighted (the marker)
 * and wait — tapping one opens the handoff: AI's read, the runner-up, the reason,
 * and the operator's call. The closing line names the whole stance: not an error,
 * a decision. Same colour language as the gate and the prompt editor.
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Handoff } from './Handoff'

type Outcome = 'queued' | 'fallback'

interface Doc {
  id: number; label: string; type: string; score: number
  outcome: Outcome; aiChoice: string; alternative: string; reason: string
}

const DOCS: Doc[] = [
  { id: 1, label: 'INV-4421', type: 'Invoice', score: 0.97, outcome: 'queued', aiChoice: 'Accounts Payable', alternative: 'Legal', reason: '' },
  { id: 2, label: 'CLM-0082', type: 'Claim', score: 0.61, outcome: 'fallback', aiChoice: 'Claims · Standard', alternative: 'Claims · Complex',
    reason: 'References a third-party liability disputed in a prior case. Standard or Complex routing carries different SLA consequences.' },
  { id: 3, label: 'LGL-1190', type: 'Legal notice', score: 0.91, outcome: 'queued', aiChoice: 'Legal', alternative: 'Compliance', reason: '' },
  { id: 4, label: 'MED-3342', type: 'Medical', score: 0.54, outcome: 'fallback', aiChoice: 'Medical Claims', alternative: 'Pre-authorisation',
    reason: 'Contains both a completed treatment reference and a pending authorisation request. Routing depends on which the operator treats as primary.' },
]

type Phase = 'idle' | 'dispatching' | 'done'

function DocItem({ doc, phase, index, expanded, onToggle }: {
  doc: Doc; phase: Phase; index: number; expanded: boolean; onToggle: () => void
}) {
  const reduced = useReducedMotion()
  const delay = reduced ? 0 : index * 0.1
  const isFallback = doc.outcome === 'fallback'
  const dispatched = phase === 'dispatching' || phase === 'done'
  const interactive = isFallback && dispatched

  return (
    <div className="relative">
      {/* highlighter behind a flagged row */}
      <AnimatePresence>
        {interactive && (
          <motion.div
            className="absolute inset-y-[3px] left-0 right-0 -z-0 rounded-[3px] pointer-events-none"
            initial={reduced ? { opacity: 0 } : { scaleX: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: delay + 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0, background: 'color-mix(in srgb, var(--accent) 20%, transparent)' }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div
        className="relative z-10 flex items-center gap-4 py-3.5 px-3"
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={interactive ? onToggle : undefined}
        onKeyDown={interactive ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() } } : undefined}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
        aria-expanded={interactive ? expanded : undefined}
      >
        <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)] w-4 flex-shrink-0 text-center" aria-hidden="true">▭</span>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-[var(--type-sm)] uppercase tracking-[0.06em] text-[var(--fg)]" style={{ fontWeight: 500 }}>{doc.label}</p>
          <p className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)] mt-0.5">{doc.type}</p>
        </div>

        <AnimatePresence>
          {dispatched && (
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, delay, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em]"
                style={{ color: isFallback ? 'var(--accent-text)' : 'var(--fg-muted)', fontWeight: isFallback ? 500 : 400 }}>
                {isFallback ? `decide ${expanded ? '↑' : '↓'}` : `→ ${doc.aiChoice}`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {interactive && expanded && <div className="relative z-10"><Handoff doc={doc} /></div>}
      </AnimatePresence>
    </div>
  )
}

export function BatchDispatch() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [expanded, setExpanded] = useState<number | null>(null)
  const reduced = useReducedMotion()

  const dispatch = useCallback(() => {
    if (phase !== 'idle') return
    setPhase('dispatching')
    setTimeout(() => setPhase('done'), reduced ? 100 : 900)
  }, [phase, reduced])

  const fallbackCount = DOCS.filter(d => d.outcome === 'fallback').length

  return (
    <div data-demo="batch-dispatch" className="w-full rounded-[var(--radius-lg)] border overflow-hidden" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">Incoming batch · 4 documents</p>
        <AnimatePresence mode="wait">
          {phase === 'idle' ? (
            <motion.button key="btn" type="button" onClick={dispatch}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] px-3.5 py-2 rounded-[var(--radius-sm)] cursor-pointer transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]"
              style={{ background: 'var(--fg)', color: 'var(--bg)' }}>
              Process batch →
            </motion.button>
          ) : phase === 'done' ? (
            <motion.div key="sum" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] text-[var(--fg-muted)]">{DOCS.length - fallbackCount} auto-routed</span>
              <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]">·</span>
              <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] text-[var(--accent-text)]" style={{ fontWeight: 500 }}>{fallbackCount} to decide</span>
              <button type="button" onClick={() => { setPhase('idle'); setExpanded(null) }}
                className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] text-[var(--fg-subtle)] hover:text-[var(--fg)] cursor-pointer transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]">
                reset
              </button>
            </motion.div>
          ) : (
            <motion.span key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">
              Processing…
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="px-2 divide-y divide-[var(--border)]">
        {DOCS.map((doc, i) => (
          <DocItem key={doc.id} doc={doc} phase={phase} index={i}
            expanded={expanded === doc.id}
            onToggle={() => setExpanded(p => p === doc.id ? null : doc.id)} />
        ))}
      </div>

      <AnimatePresence>
        {phase === 'done' && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.25, delay: 0.4 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-3.5 border-t" style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--accent) 8%, transparent)' }}>
              <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] text-[var(--fg)]">
                Tap a marked document — <span className="text-[var(--fg-muted)] normal-case tracking-normal">it&apos;s not an error, it&apos;s a decision waiting for you.</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
