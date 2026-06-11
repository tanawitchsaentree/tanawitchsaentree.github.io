'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

type RuleVariant = 'narrow' | 'medium' | 'broad'

const RULE_VARIANTS: Record<RuleVariant, { label: string; phrase: string; description: string }> = {
  narrow: { label: 'Narrow',   phrase: 'only if all fields match exactly',      description: 'High precision, high fallback rate' },
  medium: { label: 'Balanced', phrase: 'if the document type and sender match', description: 'Current production setting' },
  broad:  { label: 'Broad',    phrase: 'if the document type matches',          description: 'Low fallback, higher misroute risk' },
}

interface Doc {
  id:     number
  label:  string
  type:   string
  routed: RuleVariant[]
}

const DOCS: Doc[] = [
  { id: 1, label: 'INV-4421', type: 'Invoice',      routed: ['narrow', 'medium', 'broad'] },
  { id: 2, label: 'CLM-0082', type: 'Claim',        routed: ['medium', 'broad'] },
  { id: 3, label: 'LGL-1190', type: 'Legal notice', routed: ['broad'] },
  { id: 4, label: 'MED-3342', type: 'Medical',      routed: ['narrow', 'medium', 'broad'] },
]

function DocResult({ doc, variant, prevVariant }: { doc: Doc; variant: RuleVariant; prevVariant: RuleVariant }) {
  const routed    = doc.routed.includes(variant)
  const wasRouted = doc.routed.includes(prevVariant)
  const changed   = routed !== wasRouted
  const reduced   = useReducedMotion()

  return (
    <motion.div
      layout
      className="flex items-center justify-between gap-3 py-4 border-b border-[var(--border)] last:border-b-0"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex-shrink-0 relative w-8 h-10 rounded-[2px] border flex items-end justify-center pb-1"
          style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}
        >
          <div className="absolute top-0 right-0 w-2 h-2"
            style={{ background: 'var(--bg-elevated)', borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
          />
          <span className="font-mono leading-none" style={{ fontSize: 7, color: 'var(--fg-subtle)' }}>DOC</span>
        </div>
        <div>
          <p className="font-mono text-[var(--type-sm)] font-medium uppercase tracking-[0.06em] text-[var(--fg)]">{doc.label}</p>
          <p className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)] mt-0.5">{doc.type}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <AnimatePresence>
          {changed && (
            <motion.span
              key={`changed-${variant}`}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-[var(--type-xs)] uppercase tracking-[0.06em]"
              style={{ color: 'var(--accent-text)' }}
            >
              ← changed
            </motion.span>
          )}
        </AnimatePresence>

        <motion.span
          key={`${doc.id}-${routed}`}
          initial={reduced ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] px-2 py-0.5 rounded-full border"
          style={{
            color: routed ? '#16a34a' : '#6b7280',
            borderColor: routed ? 'rgba(22,163,74,0.3)' : 'var(--border)',
            background: routed ? 'rgba(22,163,74,0.07)' : 'transparent',
            whiteSpace: 'nowrap',
          }}
        >
          {routed ? 'Auto-routed' : 'Fallback'}
        </motion.span>
      </div>
    </motion.div>
  )
}

export function PromptEditor() {
  const [active, setActive] = useState<RuleVariant>('medium')
  const [prev,   setPrev]   = useState<RuleVariant>('medium')
  const reduced             = useReducedMotion()

  function select(v: RuleVariant) { setPrev(active); setActive(v) }

  const changedCount = DOCS.filter(d =>
    d.routed.includes(active) !== d.routed.includes(prev)
  ).length

  const variant = RULE_VARIANTS[active]

  return (
    <div
      className="w-full rounded-2xl border overflow-hidden"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">
          Prompt editor — classification rule
        </p>
        <AnimatePresence mode="wait">
          {changedCount > 0 && active !== prev && (
            <motion.span
              key={`${active}-badge`}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] px-2 py-0.5 rounded-full"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              {changedCount} route{changedCount > 1 ? 's' : ''} changed
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Prompt display */}
      <div className="px-6 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="font-mono text-[var(--type-sm)] text-[var(--fg-muted)] leading-[1.9]">
          Route this document to the claims team{' '}

          {/* Clickable rule token */}
          <button
            type="button"
            className="relative font-mono font-medium rounded px-1.5 py-0.5 border cursor-pointer transition-[color,background,border-color]"
            style={{
              fontSize: 'inherit',
              color: 'var(--accent-text)',
              borderColor: 'color-mix(in oklab, var(--accent-text) 40%, transparent)',
              background: 'color-mix(in oklab, var(--accent-text) 8%, transparent)',
            }}
            aria-label="Edit classification rule"
            onClick={() => {
              const order: RuleVariant[] = ['narrow', 'medium', 'broad']
              select(order[(order.indexOf(active) + 1) % order.length])
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={active}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block"
              >
                {variant.phrase}
              </motion.span>
            </AnimatePresence>
          </button>

          {'. Uncertain cases defer to review.'}
        </p>

        {/* Variant selector pills */}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          {(Object.entries(RULE_VARIANTS) as [RuleVariant, typeof RULE_VARIANTS[RuleVariant]][]).map(([key, v]) => (
            <button
              key={key}
              type="button"
              onClick={() => select(key)}
              className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] px-3 py-1.5 rounded border transition-[color,background,border-color] cursor-pointer"
              style={{
                background: active === key ? 'var(--fg)' : 'transparent',
                color: active === key ? 'var(--bg)' : 'var(--fg-subtle)',
                borderColor: active === key ? 'var(--fg)' : 'var(--border)',
              }}
            >
              {v.label}
            </button>
          ))}
          <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]">
            — {variant.description}
          </span>
        </div>
      </div>

      {/* Doc results */}
      <div className="px-6 py-1">
        {DOCS.map(doc => (
          <DocResult key={doc.id} doc={doc} variant={active} prevVariant={prev} />
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t flex items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
        <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] text-[var(--fg-subtle)]">
          Click the highlighted phrase to cycle rules
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            type="button"
            className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] px-3 py-1.5 rounded border cursor-pointer transition-colors"
            style={{ color: 'var(--fg-muted)', borderColor: 'var(--border)', background: 'transparent' }}
          >
            Save draft
          </button>
          <button
            type="button"
            className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] px-3 py-1.5 rounded border cursor-pointer transition-colors"
            style={{ color: 'var(--bg)', borderColor: 'var(--fg)', background: 'var(--fg)' }}
          >
            Submit for approval →
          </button>
        </div>
      </div>
    </div>
  )
}
