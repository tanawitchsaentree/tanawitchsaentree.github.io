'use client'

/**
 * PromptEditor — "Governance is a UI, not a doc."
 *
 * A prompt is a policy. Editing the classification rule visibly re-routes live
 * documents, so the configurator sees the consequence of a wording change before
 * committing. Then the governance moment is real: draft → submit → published,
 * with the publish button only live once something actually changed. No dead
 * controls — the approval flow is the point of the case.
 *
 * Routed = ink (the system acted). Fallback = highlighter (a line flagged for a
 * human) — same language as the confidence gate, never a red error.
 */

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'

type RuleVariant = 'narrow' | 'medium' | 'broad'

const RULE_VARIANTS: Record<RuleVariant, { label: string; phrase: string; description: string }> = {
  narrow: { label: 'Narrow',   phrase: 'only if every field matches exactly', description: 'High precision · more goes to review' },
  medium: { label: 'Balanced', phrase: 'if the document type and sender match', description: 'Current production rule' },
  broad:  { label: 'Broad',    phrase: 'if the document type matches',         description: 'Fewer reviews · higher misroute risk' },
}

interface Doc { id: number; label: string; type: string; routed: RuleVariant[] }

const DOCS: Doc[] = [
  { id: 1, label: 'INV-4421', type: 'Invoice',      routed: ['narrow', 'medium', 'broad'] },
  { id: 2, label: 'CLM-0082', type: 'Claim',        routed: ['medium', 'broad'] },
  { id: 3, label: 'LGL-1190', type: 'Legal notice', routed: ['broad'] },
  { id: 4, label: 'MED-3342', type: 'Medical',      routed: ['narrow', 'medium', 'broad'] },
]

type PubState = 'clean' | 'dirty' | 'submitting' | 'published'

function DocResult({ doc, variant, prevVariant }: { doc: Doc; variant: RuleVariant; prevVariant: RuleVariant }) {
  const routed    = doc.routed.includes(variant)
  const wasRouted = doc.routed.includes(prevVariant)
  const changed   = routed !== wasRouted
  const reduced   = useReducedMotion()

  return (
    <motion.div layout className="relative flex items-center gap-4 py-3.5 px-3">
      {/* highlighter mark behind fallback rows */}
      <AnimatePresence>
        {!routed && (
          <motion.div
            className="absolute inset-y-[3px] left-0 right-0 -z-0 rounded-[3px] pointer-events-none"
            initial={reduced ? { opacity: 0 } : { scaleX: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0, background: 'color-mix(in srgb, var(--accent) 18%, transparent)' }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <span className="relative z-10 font-mono text-[var(--type-xs)] text-[var(--fg-subtle)] w-4 flex-shrink-0 text-center" aria-hidden="true">▭</span>

      <div className="relative z-10 min-w-0 flex-1">
        <p className="font-mono text-[var(--type-sm)] uppercase tracking-[0.06em] text-[var(--fg)]" style={{ fontWeight: 500 }}>{doc.label}</p>
        <p className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)] mt-0.5">{doc.type}</p>
      </div>

      <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
        <AnimatePresence>
          {changed && (
            <motion.span
              key={`ch-${variant}`}
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="font-mono text-[var(--type-xs)] uppercase tracking-[0.06em] text-[var(--accent-text)]"
            >
              changed
            </motion.span>
          )}
        </AnimatePresence>
        <motion.span
          key={`${doc.id}-${routed}`}
          initial={reduced ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em]"
          style={{ color: routed ? 'var(--fg-muted)' : 'var(--accent-text)', fontWeight: routed ? 400 : 500 }}
        >
          {routed ? '→ auto-routed' : 'to review'}
        </motion.span>
      </div>
    </motion.div>
  )
}

export function PromptEditor() {
  const [active, setActive] = useState<RuleVariant>('medium')
  const [prev, setPrev]     = useState<RuleVariant>('medium')
  const [pub, setPub]       = useState<PubState>('clean')
  const [published, setPublished] = useState<RuleVariant>('medium')
  const reduced = useReducedMotion()

  function select(v: RuleVariant) {
    if (v === active || pub === 'submitting') return
    setPrev(active); setActive(v)
    setPub(v === published ? 'clean' : 'dirty')
  }

  function submit() {
    if (pub !== 'dirty') return
    setPub('submitting')
    setTimeout(() => { setPublished(active); setPub('published'); setTimeout(() => setPub('clean'), 1800) }, reduced ? 100 : 900)
  }

  const changedCount = DOCS.filter(d => d.routed.includes(active) !== d.routed.includes(prev)).length
  const variant = RULE_VARIANTS[active]
  const reviewCount = DOCS.filter(d => !d.routed.includes(active)).length

  return (
    <div data-demo="prompt-editor" className="w-full rounded-[var(--radius-lg)] border overflow-hidden" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
      {/* header with version state */}
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">
          Classification rule · claims
        </p>
        <span
          className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em]"
          style={{ color: pub === 'clean' ? 'var(--fg-subtle)' : 'var(--accent-text)' }}
        >
          {pub === 'clean' ? 'published' : pub === 'published' ? '✓ live' : 'draft · unsaved'}
        </span>
      </div>

      {/* the prompt as policy text */}
      <div className="px-5 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="font-mono text-[var(--type-base)] text-[var(--fg-muted)] leading-[1.9]">
          Route this document to the claims team{' '}
          <button
            type="button"
            className="relative font-mono rounded-[var(--radius-sm)] px-1.5 py-0.5 border cursor-pointer transition-[color,background,border-color] duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]"
            style={{
              fontSize: 'inherit', fontWeight: 500, color: 'var(--accent-text)',
              borderColor: 'color-mix(in oklab, var(--accent-text) 40%, transparent)',
              background: 'color-mix(in oklab, var(--accent-text) 8%, transparent)',
            }}
            aria-label="Cycle classification rule"
            onClick={() => { const o: RuleVariant[] = ['narrow', 'medium', 'broad']; select(o[(o.indexOf(active) + 1) % 3]) }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={active}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
              >
                {variant.phrase}
              </motion.span>
            </AnimatePresence>
          </button>
          {'. Anything below threshold defers to review.'}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-5">
          {(Object.entries(RULE_VARIANTS) as [RuleVariant, typeof RULE_VARIANTS[RuleVariant]][]).map(([key, v]) => (
            <button
              key={key}
              type="button"
              onClick={() => select(key)}
              className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] px-3 py-1.5 rounded-[var(--radius-sm)] border cursor-pointer transition-[color,background,border-color] duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]"
              style={{
                background: active === key ? 'var(--fg)' : 'transparent',
                color:      active === key ? 'var(--bg)' : 'var(--fg-subtle)',
                borderColor: active === key ? 'var(--fg)' : 'var(--border)',
              }}
            >
              {v.label}
            </button>
          ))}
          <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]">— {variant.description}</span>
        </div>
      </div>

      {/* live routing preview */}
      <div className="px-2 divide-y divide-[var(--border)]">
        {DOCS.map(doc => <DocResult key={doc.id} doc={doc} variant={active} prevVariant={prev} />)}
      </div>

      {/* governance footer — real publish flow */}
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)] min-w-0">
          <AnimatePresence mode="wait">
            <motion.span
              key={`${active}-${changedCount}`}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="inline-block"
            >
              {changedCount > 0 && active !== prev
                ? <><span className="text-[var(--accent-text)]" style={{ fontWeight: 500 }}>{changedCount} document{changedCount > 1 ? 's' : ''} re-routed</span> · {reviewCount} now to review</>
                : <>{reviewCount} of {DOCS.length} defer to review under this rule</>}
            </motion.span>
          </AnimatePresence>
        </p>

        <button
          type="button"
          onClick={submit}
          disabled={pub !== 'dirty'}
          className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] px-3.5 py-2 rounded-[var(--radius-sm)] flex-shrink-0 cursor-pointer transition-[opacity,background] duration-[var(--duration-fast)] ease-[var(--ease-out-quick)] disabled:cursor-not-allowed"
          style={{
            background: pub === 'dirty' || pub === 'submitting' ? 'var(--fg)' : 'transparent',
            color: pub === 'dirty' || pub === 'submitting' ? 'var(--bg)' : 'var(--fg-subtle)',
            border: '1px solid', borderColor: pub === 'dirty' || pub === 'submitting' ? 'var(--fg)' : 'var(--border)',
            opacity: pub === 'clean' || pub === 'published' ? 0.5 : 1,
          }}
        >
          {pub === 'submitting' ? 'Submitting…' : pub === 'published' ? '✓ Published' : 'Submit for approval →'}
        </button>
      </div>
    </div>
  )
}
