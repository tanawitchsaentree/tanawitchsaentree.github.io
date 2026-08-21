'use client'

/**
 * Handoff: the per-document decision card used by ConfidenceGate.
 *
 * The visual embodiment of the Allianz thesis: a low-confidence document isn't
 * an error dialog, it's a handoff. AI's read + how sure it is + the runner-up +
 * the reason + the operator's two-button call. Highlighter-left-border, never red.
 *
 * The call is a click, not a form submit, but it isn't instantly irreversible:
 * a short "Undo" window follows the action before it locks in, matching the
 * case study's own principle that SLA-affecting decisions deserve more than one
 * uninterruptible click.
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

export interface HandoffDoc {
  score:       number
  aiChoice:    string
  alternative: string
  reason:      string
}

const UNDO_WINDOW_MS = 4000

export function Handoff({ doc }: { doc: HandoffDoc }) {
  const [done, setDone]     = useState<'confirm' | 'reclass' | null>(null)
  const [locked, setLocked] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  function act(kind: 'confirm' | 'reclass') {
    setDone(kind)
    setLocked(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setLocked(true), reduced ? 300 : UNDO_WINDOW_MS)
  }

  function undo() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setDone(null)
    setLocked(false)
  }

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: reduced ? 0.15 : 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div
        className="mt-1 mb-3 ml-8 mr-3 px-4 py-4 rounded-[var(--radius-md)] border border-[var(--border)]"
        style={{ background: 'var(--bg)', borderLeftWidth: 2, borderLeftColor: 'var(--accent)' }}
      >
        <div className="flex items-start justify-between gap-6 mb-4">
          <div className="min-w-0">
            <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] text-[var(--fg-subtle)] mb-1">AI reads it as</p>
            <p className="font-mono text-[var(--type-base)] text-[var(--fg)]" style={{ fontWeight: 500 }}>{doc.aiChoice}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] text-[var(--fg-subtle)] mb-1">but only</p>
            <p className="font-mono text-[var(--type-base)] text-[var(--accent-text)]" style={{ fontWeight: 500 }}>{Math.round(doc.score * 100)}% sure</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)] uppercase tracking-[0.06em]">runner-up</span>
          <span className="font-mono text-[var(--type-xs)] text-[var(--fg-muted)] px-2 py-1 rounded-[var(--radius-sm)] border" style={{ borderColor: 'var(--border)' }}>{doc.alternative}</span>
        </div>

        <p className="text-[var(--type-base)] leading-[1.6] text-[var(--fg-muted)] mb-5 max-w-[52ch]">{doc.reason}</p>

        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-wrap gap-2">
              <button type="button" onClick={() => act('confirm')}
                className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] px-3.5 py-2 rounded-[var(--radius-sm)] cursor-pointer transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]"
                style={{ background: 'var(--fg)', color: 'var(--bg)' }}>
                Confirm · {doc.aiChoice}
              </button>
              <button type="button" onClick={() => act('reclass')}
                className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] px-3.5 py-2 rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--fg-subtle)] bg-transparent cursor-pointer transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]">
                Send to · {doc.alternative}
              </button>
            </motion.div>
          ) : (
            <motion.div key="done" initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-3">
              <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em]" style={{ color: 'var(--fg)' }}>
                {done === 'confirm' ? `✓ routed to ${doc.aiChoice}, operator's call` : `↻ reassigned to ${doc.alternative}, operator's call`}
              </p>
              <AnimatePresence>
                {!locked && (
                  <motion.button
                    key="undo"
                    type="button"
                    onClick={undo}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] underline cursor-pointer"
                    style={{ color: 'var(--accent-text)' }}
                  >
                    Undo
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
