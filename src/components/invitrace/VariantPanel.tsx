'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'
import type { VariantData, Primitive, Archetype } from '@/lib/invitrace-variants'
import { ARCHETYPE_META, PRIMITIVE_META } from '@/lib/invitrace-variants'

interface VariantPanelProps {
  data: VariantData | null
  onClose: () => void
}

export function VariantPanel({ data, onClose }: VariantPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!data) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [data, onClose])

  // Focus trap + focus panel on open
  useEffect(() => {
    if (data) setTimeout(() => panelRef.current?.focus(), 50)
  }, [data])

  const primitiveColor = data ? PRIMITIVE_META[data.primitive as Primitive].color : '#7B61FF'
  const archetypeMeta  = data ? ARCHETYPE_META[data.archetype as Archetype] : null

  return (
    <AnimatePresence>
      {data && (
        <>
          {/* Backdrop — mobile only */}
          <motion.div
            key="panel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-30 bg-[color-mix(in_oklab,var(--fg)_40%,transparent)]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.aside
            key="variant-panel"
            ref={panelRef}
            tabIndex={-1}
            role="complementary"
            aria-label={`Variant details: ${data.title}`}
            aria-live="polite"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0,     opacity: 1 }}
            exit={{ x: '100%',   opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'fixed top-0 right-0 z-40 h-full',
              'w-full md:w-[380px]',
              'bg-[var(--bg-elevated)] border-l border-[var(--border)]',
              'overflow-y-auto overscroll-contain',
              'flex flex-col',
              'focus:outline-none'
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[var(--border)] flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: primitiveColor }}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[var(--type-xs)] uppercase tracking-widest text-[var(--fg-subtle)]">
                    {data.primitive}
                  </span>
                  <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]">→</span>
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: archetypeMeta?.color }}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[var(--type-xs)] uppercase tracking-widest text-[var(--fg-subtle)]">
                    {data.archetype}
                  </span>
                </div>
                <h2 className="font-display font-normal text-[var(--type-lg)] leading-[1.2] tracking-[-0.02em] text-[var(--fg)]">
                  {data.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className={cn(
                  'flex-shrink-0 ml-4 w-7 h-7 flex items-center justify-center',
                  'border border-[var(--border)] text-[var(--fg-muted)]',
                  'hover:text-[var(--fg)] transition-colors duration-[180ms]',
                  'font-mono text-[var(--type-xs)]'
                )}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-6 flex-1">
              {/* Description */}
              <p className="text-[var(--type-sm)] text-[var(--fg-muted)] leading-[1.7]">
                {data.description}
              </p>

              {/* Flexible axis */}
              <div>
                <p className="font-mono text-[var(--type-xs)] uppercase tracking-widest text-[var(--accent-text)] mb-2">
                  ↻ Axis — can be adjusted
                </p>
                <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
                  {data.axisFlexible.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[var(--type-sm)] text-[var(--fg)]">
                      <span className="mt-[0.35em] w-1.5 h-1.5 rounded-full bg-[var(--fg-subtle)] flex-shrink-0" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Locked axis */}
              <div>
                <p className="font-mono text-[var(--type-xs)] uppercase tracking-widest text-[var(--fg-subtle)] mb-2">
                  ✕ Axis — locked for all hospitals
                </p>
                <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
                  {data.axisLocked.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[var(--type-sm)] text-[var(--fg-muted)]">
                      <span className="mt-[0.35em] w-1.5 h-1.5 rounded-sm bg-[var(--border)] flex-shrink-0" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reasoning */}
              <div className="border-t border-[var(--border)] pt-5">
                <p className="font-mono text-[var(--type-xs)] uppercase tracking-widest text-[var(--fg-subtle)] mb-2">
                  Why this trade-off
                </p>
                <p className="text-[var(--type-sm)] text-[var(--fg-muted)] leading-[1.7] italic">
                  {data.reasoning}
                </p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
