'use client'

/**
 * Handoff — the shared decision card used by ConfidenceGate and BatchDispatch.
 *
 * The visual embodiment of the Allianz thesis: a low-confidence document isn't
 * an error dialog, it's a handoff. AI's read + how sure it is + the runner-up +
 * the reason + the operator's two-button call. Highlighter-left-border, never red.
 */

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

export interface HandoffDoc {
  score:       number
  aiChoice:    string
  alternative: string
  reason:      string
}

export function Handoff({ doc }: { doc: HandoffDoc }) {
  const [done, setDone] = useState<'confirm' | 'reclass' | null>(null)
  const reduced = useReducedMotion()

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
              <button type="button" onClick={() => setDone('confirm')}
                className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] px-3.5 py-2 rounded-[var(--radius-sm)] cursor-pointer transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]"
                style={{ background: 'var(--fg)', color: 'var(--bg)' }}>
                Confirm · {doc.aiChoice}
              </button>
              <button type="button" onClick={() => setDone('reclass')}
                className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] px-3.5 py-2 rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--fg-subtle)] bg-transparent cursor-pointer transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]">
                Send to · {doc.alternative}
              </button>
            </motion.div>
          ) : (
            <motion.p key="done" initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em]" style={{ color: 'var(--signal-ok)' }}>
              {done === 'confirm' ? `✓ routed to ${doc.aiChoice} — operator's call` : `↻ reassigned to ${doc.alternative} — operator's call`}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
