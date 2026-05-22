'use client'

import { useState, useId } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'
import type { SubCaseSections } from '@/lib/universes'

// ── Static thesis + hint per sub-case ─────────────────────────

const THESIS: Record<string, string> = {
  'document-classification': 'Good AI and bad AI looked identical at the point of decision.',
  'prompt-management':       'The people who knew what to fix had no way to fix it.',
  'fallback-states':         'Every AI fails. The interface had no language for it.',
}

const HINT: Record<string, string> = {
  'document-classification': 'Drag the threshold. Watch routing change.',
  'prompt-management':       'Press start. Compare what one week feels like.',
  'fallback-states':         'Drag a document into each bucket.',
}

// ── Disclosure panel ───────────────────────────────────────────

interface DisclosureProps {
  label: string
  content: string
  isOpen: boolean
  onToggle: () => void
}

function Disclosure({ label, content, isOpen, onToggle }: DisclosureProps) {
  const id = useId()
  const reduced = useReducedMotion()

  return (
    <div className="border-t border-[var(--border)]">
      <button
        type="button"
        id={`${id}-btn`}
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between gap-4',
          'py-4 cursor-pointer text-left',
          'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
          'transition-colors duration-[200ms]',
          isOpen ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
        )}
      >
        <span>{label}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: reduced ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
          className="flex-shrink-0 text-[var(--fg-subtle)]"
          style={{ fontSize: 12 }}
        >
          ↓
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-btn`}
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6">
              <div
                className={cn(
                  'prose-disclosure',
                  'text-[var(--type-sm)] leading-[1.75] tracking-[-0.008em]',
                  'text-[var(--fg-muted)]',
                  'max-w-[60ch]'
                )}
              >
                {content.split('\n\n').map((para, i) => {
                  // Render markdown-style bold + list items inline
                  if (para.trim().startsWith('- **')) {
                    // Option list — render as styled items
                    return (
                      <ul key={i} className="list-none p-0 m-0 flex flex-col gap-3 mb-4">
                        {para.split('\n').filter(l => l.trim().startsWith('- ')).map((line, j) => {
                          const inner = line.replace(/^- /, '')
                          // bold the **Option X:** part
                          const boldMatch = inner.match(/^\*\*(.+?)\*\*(.*)$/)
                          return (
                            <li key={j} className="relative pl-4">
                              <span
                                className="absolute left-0 top-0"
                                style={{ color: 'var(--accent-text)' }}
                                aria-hidden="true"
                              >—</span>
                              {boldMatch ? (
                                <>
                                  <strong className="text-[var(--fg)] font-medium">{boldMatch[1]}</strong>
                                  {boldMatch[2]}
                                </>
                              ) : inner}
                            </li>
                          )
                        })}
                      </ul>
                    )
                  }
                  return (
                    <p key={i} className={i < content.split('\n\n').length - 1 ? 'mb-4' : ''}>
                      {renderInlineBold(para.trim())}
                    </p>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Naive inline **bold** renderer — no markdown lib needed for this scope
function renderInlineBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  if (parts.length === 1) return text
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-[var(--fg)] font-medium">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

// ── SubCaseShell ───────────────────────────────────────────────

interface SubCaseShellProps {
  slug: string
  index: number       // 0-based, for eyebrow "01 ·"
  title: string
  tags: string[]
  sections: SubCaseSections
  children?: React.ReactNode   // gimmick slot
}

type PanelKey = 'why' | 'considered' | 'tradeoff' | null

export function SubCaseShell({
  slug,
  index,
  title,
  tags,
  sections,
  children,
}: SubCaseShellProps) {
  const [openPanel, setOpenPanel] = useState<PanelKey>(null)

  const thesis = THESIS[slug]
  const hint   = HINT[slug]

  function toggle(key: PanelKey) {
    setOpenPanel(prev => prev === key ? null : key)
  }

  return (
    <article
      className={cn(
        'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
        'py-20 md:py-28',
        'border-b border-[var(--border)] last:border-b-0'
      )}
    >
      {/* Eyebrow */}
      <p className={cn(
        'font-mono text-[var(--type-xs)] tracking-widest uppercase mb-5',
        'text-[var(--accent-text)]'
      )}>
        {String(index + 1).padStart(2, '0')} · {tags.slice(0, 2).join(' · ')}
      </p>

      {/* Title */}
      <h2
        className={cn(
          'font-display font-normal',
          'text-[clamp(1.75rem,4vw,3rem)] leading-[1.05] tracking-[-0.032em]',
          'text-[var(--fg)] mb-4 max-w-[80rem]'
        )}
      >
        {title}
      </h2>

      {/* Thesis — one-line display */}
      {thesis && (
        <p
          className={cn(
            'font-display font-normal italic',
            'text-[clamp(1.1rem,2.2vw,1.5rem)] leading-[1.2] tracking-[-0.018em]',
            'text-[var(--fg-muted)] mb-10 max-w-[52ch]'
          )}
        >
          &ldquo;{thesis}&rdquo;
        </p>
      )}

      {/* Gimmick slot */}
      <div className="max-w-[80rem] mb-4">
        {children ?? (
          // Placeholder until gimmick is built
          <div
            className="w-full rounded-2xl border border-dashed border-[var(--border)] flex items-center justify-center"
            style={{ minHeight: 240 }}
          >
            <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">
              Interactive demo
            </p>
          </div>
        )}
      </div>

      {/* Inline hint */}
      {hint && (
        <p className={cn(
          'font-mono text-[var(--type-xs)] uppercase tracking-[0.08em]',
          'text-[var(--fg-subtle)] mb-8'
        )}>
          {hint}
        </p>
      )}

      {/* Expandable disclosures */}
      <div className="max-w-[60ch]">
        <Disclosure
          label="Why this design?"
          content={[sections.problem, sections.decision].filter(Boolean).join('\n\n')}
          isOpen={openPanel === 'why'}
          onToggle={() => toggle('why')}
        />
        <Disclosure
          label="What I considered"
          content={sections.considered}
          isOpen={openPanel === 'considered'}
          onToggle={() => toggle('considered')}
        />
        <Disclosure
          label="The trade-offs that remain"
          content={sections.tradeoff}
          isOpen={openPanel === 'tradeoff'}
          onToggle={() => toggle('tradeoff')}
        />
        <div className="border-t border-[var(--border)]" aria-hidden="true" />
      </div>
    </article>
  )
}
