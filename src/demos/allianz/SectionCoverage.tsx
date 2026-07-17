'use client'

/**
 * SectionCoverage — "Missing review looks the same as reviewed, until you look."
 *
 * An insurance policy is a tree: Entity → Sections → Insured items.
 * The AI has reviewed some items for coverage completeness; others it skipped
 * or couldn't resolve. Without a visual signal those gaps are invisible.
 *
 * Pending items get the highlighter — same language as ConfidenceGate and
 * BatchDispatch. Clicking one opens a micro-action: confirm coverage or flag
 * for underwriter. Resolving clears the mark.
 */

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

interface SubItem {
  id: string
  label: string
  detail: string
  reviewed: boolean
}

interface Section {
  id: string
  label: string
  items: SubItem[]
}

const INITIAL: Section[] = [
  {
    id: 's001',
    label: 'Section 001',
    items: [
      { id: 'i1', label: "Kaufmann's Warehouse", detail: 'Industrial property',  reviewed: true  },
      { id: 'i2', label: 'Forklift',              detail: 'Heavy equipment',      reviewed: false },
      { id: 'i3', label: 'Storage Unit B',        detail: 'Outbuilding',          reviewed: true  },
    ],
  },
  {
    id: 's002',
    label: 'Section 002',
    items: [
      { id: 'i4', label: 'Sales of Machinery and Equipment', detail: 'Business income', reviewed: false },
      { id: 'i5', label: 'Office Furniture',                  detail: 'Contents',        reviewed: true  },
    ],
  },
  {
    id: 's003',
    label: 'Section 003',
    items: [
      { id: 'i6', label: 'Data Loss — Financial Records', detail: 'Cyber coverage',  reviewed: false },
      { id: 'i7', label: 'Business Interruption',         detail: 'BI extension',    reviewed: true  },
    ],
  },
  {
    id: 's004',
    label: 'Section 004 — Payment Demo',
    items: [
      { id: 'i8', label: 'Card Terminal Equipment', detail: 'POS hardware', reviewed: true },
      { id: 'i9', label: 'Merchant Liability',       detail: 'PL extension', reviewed: true },
    ],
  },
]

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="12" height="12" viewBox="0 0 12 12" fill="none"
      animate={{ rotate: open ? 90 : 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
    >
      <path d="M4 2.5 L8 6 L4 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  )
}

export function SectionCoverage() {
  const reduced = useReducedMotion()
  const [sections, setSections] = useState<Section[]>(INITIAL)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['s001']))
  const [activeItem, setActiveItem] = useState<string | null>('i2')

  function toggleSection(id: string) {
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setActiveItem(null)
  }

  function markReviewed(itemId: string) {
    setSections(prev => prev.map(sec => ({
      ...sec,
      items: sec.items.map(it => it.id === itemId ? { ...it, reviewed: true } : it),
    })))
    setActiveItem(null)
  }

  const allItems    = sections.flatMap(s => s.items)
  const pendingCount = allItems.filter(i => !i.reviewed).length
  const totalCount   = allItems.length

  return (
    <div
      data-demo="section-coverage"
      className="w-full rounded-[var(--radius-lg)] border overflow-hidden"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
    >
      {/* header */}
      <div
        className="flex items-center justify-between gap-4 px-5 py-3.5 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]" aria-hidden="true">●</span>
          <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)] truncate">
            Policy sections · {totalCount} items
          </p>
        </div>
        <AnimatePresence mode="wait">
          {pendingCount > 0 ? (
            <motion.span
              key="pending"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em]"
              style={{ color: 'var(--accent-text)', fontWeight: 500 }}
            >
              {pendingCount} pending
            </motion.span>
          ) : (
            <motion.span
              key="done"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] text-[var(--fg-subtle)]"
            >
              ✓ all reviewed
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* entity group label */}
      <div
        className="flex items-center gap-3 px-5 py-2.5 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-muted)' }}
      >
        <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
          Entity
        </span>
      </div>

      {/* section tree */}
      <div className="divide-y divide-[var(--border)]">
        {sections.map(sec => {
          const isOpen    = openSections.has(sec.id)
          const hasPending = sec.items.some(i => !i.reviewed)

          return (
            <div key={sec.id}>
              {/* section row */}
              <button
                type="button"
                onClick={() => toggleSection(sec.id)}
                className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]"
                style={{ background: isOpen ? 'color-mix(in srgb, var(--fg) 4%, transparent)' : 'transparent' }}
              >
                <span
                  className="flex-shrink-0 transition-colors duration-[var(--duration-fast)]"
                  style={{ color: 'var(--fg-subtle)' }}
                >
                  <ChevronIcon open={isOpen} />
                </span>
                <span
                  className="flex-1 font-mono text-[var(--type-sm)] truncate"
                  style={{ color: 'var(--fg)', fontWeight: isOpen ? 600 : 400 }}
                >
                  {sec.label}
                </span>
                {hasPending && (
                  <span
                    className="font-mono text-[var(--type-xs)] flex-shrink-0"
                    style={{ color: 'var(--accent-text)' }}
                    aria-label="has pending review items"
                  >
                    ●
                  </span>
                )}
              </button>

              {/* sub-items */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                    exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: reduced ? 0.15 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="divide-y divide-[var(--border)]">
                      {sec.items.map(item => {
                        const pending  = !item.reviewed
                        const isActive = activeItem === item.id

                        return (
                          <div key={item.id} className="relative">
                            {/* yellow highlight behind pending row */}
                            <AnimatePresence>
                              {pending && (
                                <motion.div
                                  className="absolute inset-y-[2px] left-0 right-0 -z-0 pointer-events-none"
                                  initial={reduced ? { opacity: 0 } : { scaleX: 0, opacity: 0 }}
                                  animate={reduced ? { opacity: 1 } : { scaleX: 1, opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                  style={{ originX: 0, background: 'color-mix(in srgb, var(--accent) 20%, transparent)' }}
                                  aria-hidden="true"
                                />
                              )}
                            </AnimatePresence>

                            {/* item row */}
                            <div
                              className="relative z-10 flex items-center gap-3 pl-10 pr-5 py-2.5"
                              role={pending ? 'button' : undefined}
                              tabIndex={pending ? 0 : undefined}
                              onClick={pending ? () => setActiveItem(prev => prev === item.id ? null : item.id) : undefined}
                              onKeyDown={pending ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveItem(prev => prev === item.id ? null : item.id) } } : undefined}
                              style={{ cursor: pending ? 'pointer' : 'default' }}
                              aria-expanded={pending ? isActive : undefined}
                            >
                              <span
                                className="font-mono text-[var(--type-xs)] flex-shrink-0"
                                style={{ color: 'var(--fg-subtle)' }}
                                aria-hidden="true"
                              >▭</span>

                              <div className="flex-1 min-w-0">
                                <p
                                  className="font-mono text-[var(--type-sm)] truncate"
                                  style={{ color: 'var(--fg)', fontWeight: pending ? 500 : 400 }}
                                >
                                  {item.label}
                                </p>
                                <p
                                  className="font-mono text-[var(--type-xs)] mt-0.5 truncate"
                                  style={{ color: 'var(--fg-subtle)' }}
                                >
                                  {item.detail}
                                </p>
                              </div>

                              <span
                                className="font-mono text-[var(--type-xs)] flex-shrink-0 uppercase tracking-[0.08em]"
                                style={{ color: pending ? 'var(--accent-text)' : 'var(--fg-subtle)', fontWeight: pending ? 500 : 400 }}
                              >
                                {pending ? `review ${isActive ? '↑' : '↓'}` : '✓'}
                              </span>
                            </div>

                            {/* inline action panel */}
                            <AnimatePresence initial={false}>
                              {isActive && pending && (
                                <motion.div
                                  initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                                  animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                                  exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                                  transition={{ duration: reduced ? 0.15 : 0.28, ease: [0.16, 1, 0.3, 1] }}
                                  className="overflow-hidden relative z-10"
                                >
                                  <div
                                    className="ml-10 mr-5 mb-3 rounded-[var(--radius-sm)] border px-4 py-3 flex items-center justify-between gap-4"
                                    style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                                  >
                                    <p
                                      className="font-mono text-[var(--type-xs)] leading-[1.6]"
                                      style={{ color: 'var(--fg-muted)' }}
                                    >
                                      No coverage review on record for this item.
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => markReviewed(item.id)}
                                      className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] px-3 py-1.5 rounded-[var(--radius-sm)] flex-shrink-0 cursor-pointer transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]"
                                      style={{ background: 'var(--fg)', color: 'var(--bg)', border: '1px solid var(--fg)' }}
                                    >
                                      Mark reviewed
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* summary band */}
      <AnimatePresence>
        {pendingCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-5 py-3.5 border-t"
            style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--accent) 8%, transparent)' }}
          >
            <p className="font-mono leading-[1.6] text-[var(--fg)]" style={{ fontSize: '1rem' }}>
              <span style={{ color: 'var(--accent-text)', fontWeight: 500 }}>{pendingCount} of {totalCount}</span> items have no coverage review
              <span style={{ color: 'var(--fg-muted)' }}> — and looked complete until the gate marked them.</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
