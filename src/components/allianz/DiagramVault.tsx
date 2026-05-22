'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'

const DIAGRAMS = [
  {
    slug: 'document-classification',
    label: 'Document Classification — System',
    src: '/projects/allianz/screen-doc-classification.svg',
  },
  {
    slug: 'document-classification-ui',
    label: 'Document Classification — Interface',
    src: '/projects/allianz/screen-doc-classification-ui.svg',
  },
  {
    slug: 'prompt-management',
    label: 'Prompt Management — System',
    src: '/projects/allianz/screen-prompt-management.svg',
  },
  {
    slug: 'prompt-management-ui',
    label: 'Prompt Management — Interface',
    src: '/projects/allianz/screen-prompt-management-ui.svg',
  },
  {
    slug: 'fallback-states',
    label: 'Fallback States — Failure Taxonomy',
    src: '/projects/allianz/screen-fallback-states.svg',
  },
  {
    slug: 'fallback-states-ui',
    label: 'Fallback States — Operator View',
    src: '/projects/allianz/screen-fallback-states-ui.svg',
  },
  {
    slug: 'system-overview',
    label: 'System Overview — Three Layers',
    src: '/projects/allianz/screen-system-overview.svg',
  },
]

export function DiagramVault() {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()

  return (
    <section
      className={cn(
        'border-t border-[var(--border)]',
        'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
        'py-12 md:py-16'
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-4 cursor-pointer w-full text-left',
          'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
          'text-[var(--fg-subtle)] hover:text-[var(--fg-muted)]',
          'transition-colors duration-[200ms]',
          'bg-transparent border-none p-0'
        )}
      >
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: reduced ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
          style={{ fontSize: 12 }}
        >
          ↓
        </motion.span>
        <span>{open ? 'Hide technical diagrams' : 'How the system actually works'}</span>
        <span className="ml-auto text-[var(--fg-subtle)] opacity-50">
          {DIAGRAMS.length} diagrams
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-6 pt-10 max-w-[80rem]">
              {DIAGRAMS.map(d => (
                <figure key={d.slug} className="flex flex-col gap-2">
                  <div
                    className="rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border)] bg-[var(--bg-elevated)]"
                    style={{ aspectRatio: '3/2' }}
                    data-cursor="diagram"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.src}
                      alt={d.label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <figcaption className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] text-[var(--fg-subtle)]">
                    {d.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
