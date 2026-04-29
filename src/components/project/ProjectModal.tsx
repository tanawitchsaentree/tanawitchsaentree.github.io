'use client'

import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { backdropVariants, modalVariants, sheetVariants } from '@/lib/motion'
import type { ProjectFrontmatter } from '@/types/project'

interface ProjectModalProps {
  project: ProjectFrontmatter | null
  content: string | null
  onClose: () => void
}

function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) {
      document.documentElement.classList.remove('modal-open')
      return
    }
    // Measure scrollbar width before locking to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.documentElement.style.paddingRight = `${scrollbarWidth}px`
    document.documentElement.classList.add('modal-open')
    return () => {
      document.documentElement.classList.remove('modal-open')
      document.documentElement.style.paddingRight = ''
    }
  }, [active])
}

function useFocusTrap(ref: React.RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return
    const el = ref.current
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }

    el.addEventListener('keydown', onKeydown)
    first?.focus()
    return () => el.removeEventListener('keydown', onKeydown)
  }, [active, ref])
}

export function ProjectModal({ project, content: _content, onClose }: ProjectModalProps) {
  const isOpen = Boolean(project)
  const modalRef = useRef<HTMLDivElement>(null)
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768

  useScrollLock(isOpen)
  useFocusTrap(modalRef, isOpen)

  const handleClose = useCallback(() => onClose(), [onClose])

  // Esc key
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, handleClose])

  if (typeof document === 'undefined') return null

  const MotionVariant = isDesktop ? modalVariants : sheetVariants

  return createPortal(
    <AnimatePresence>
      {isOpen && project && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
            className={cn(
              'fixed inset-0 z-[100]',
              'bg-[color-mix(in_oklab,var(--fg)_55%,transparent)]',
              '[backdrop-filter:blur(8px)]'
            )}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <motion.div
            key="modal"
            ref={modalRef}
            variants={MotionVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={cn(
              'fixed z-[101] bg-[var(--bg)] overflow-hidden',
              // Desktop: centered card
              'md:inset-auto md:top-[5vh] md:left-1/2 md:-translate-x-1/2',
              'md:w-[min(90vw,1080px)] md:max-h-[90vh] md:rounded-[var(--radius-xl)]',
              // Mobile: full-screen sheet from bottom
              'inset-x-0 bottom-0 top-auto max-h-[92svh] rounded-t-[var(--radius-xl)]',
              'md:top-[5vh] md:bottom-auto md:inset-x-auto',
              'flex flex-col',
              'shadow-[0_8px_64px_rgba(0,0,0,0.4)]',
              'border border-[var(--border)]'
            )}
          >
            {/* Close button — first focusable element */}
            <div className="flex items-center justify-between px-6 pt-5 pb-0 flex-shrink-0">
              <div className="flex items-center gap-2">
                {project.tags.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    className={cn(
                      'font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]',
                      'tracking-widest uppercase'
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close project"
                className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-full',
                  'border border-[var(--border)]',
                  'text-[var(--fg-muted)] hover:text-[var(--fg)]',
                  'transition-colors duration-[var(--duration-fast)]'
                )}
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 overscroll-contain">
              <div className="px-6 md:px-10 py-8 md:py-10">
                {/* Eyebrow */}
                <p
                  className={cn(
                    'font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]',
                    'tracking-widest uppercase mb-4',
                    'flex gap-4'
                  )}
                >
                  <span>{project.year}</span>
                  <span aria-hidden="true">·</span>
                  <span>{project.role}</span>
                  <span aria-hidden="true">·</span>
                  <span>{project.timeline}</span>
                </p>

                {/* Title */}
                <h2
                  id="modal-title"
                  className={cn(
                    'font-display font-normal',
                    'text-[var(--type-3xl)] leading-[1.1] tracking-[-0.028em]',
                    'text-[var(--fg)] mb-8'
                  )}
                >
                  {project.title}
                </h2>

                {/* Summary */}
                <p
                  className={cn(
                    'text-[var(--type-lg)] text-[var(--fg-muted)]',
                    'leading-[1.65] tracking-[-0.014em]',
                    'mb-12 max-w-[var(--max-reading)]'
                  )}
                >
                  {project.summary}
                </p>

                {/* TODO: render MDX content here once next-mdx-remote is wired */}
                {/* Content will be rendered via <MDXRemote source={content} /> */}
                <div
                  className="prose prose-neutral max-w-[var(--max-reading)]"
                  aria-label="Case study content — coming soon"
                >
                  <p className="text-[var(--fg-muted)] text-[var(--type-sm)] font-mono">
                    Full case study loading…
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
