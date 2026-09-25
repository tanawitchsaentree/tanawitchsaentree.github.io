'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { X, ArrowUpRight } from 'lucide-react'
import styles from './ManabiModal.module.css'
import { PERSONAL_PROJECT } from '@/data/home'

const SECTIONS = [
  { label: 'From a long list to a few real options', body: 'I connected search, school profiles, comparison, and saved schools around the same family preferences. Parents can narrow their options and return to a shortlist without piecing the information together again.' },
  { label: 'Reasons parents can check', body: 'I replaced a weighted match percentage with the priorities a school meets. That decision shaped both the interface and the matching logic: show why an option appears, and leave room for what the data cannot answer.' },
  { label: 'The work behind the school pages', body: 'I also built school and admin tools for updating records and reviewing changes, with access rules that keep unpublished records out of public search. Keeping the information usable became part of the product work.' },
]

interface ManabiModalProps {
  open: boolean
  onClose: () => void
}

export function ManabiModal({ open, onClose }: ManabiModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement
    const dialog = dialogRef.current
    const tabbable = dialog?.querySelectorAll<HTMLElement>(
      'a[href]:not([tabindex="-1"]), button:not([tabindex="-1"]), summary, [tabindex]:not([tabindex="-1"])'
    )
    // Title is the initial focus target (SR should announce it, not
    // "Close, button") but it's not part of the real tab order and isn't
    // guaranteed to sit first in DOM order — so it's handled as a special
    // case below rather than folded into the first/last boundary directly.
    titleRef.current?.focus()
    const main = document.getElementById('main-content')
    const wasInert = main?.hasAttribute('inert') ?? false
    main?.setAttribute('inert', '')

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !tabbable || tabbable.length === 0) return

      const first = tabbable[0]
      const last = tabbable[tabbable.length - 1]

      if (document.activeElement === titleRef.current) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
        return
      }

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (!wasInert) main?.removeAttribute('inert')
      previouslyFocused.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manabi-modal-title"
      >
        <div className={styles.coverWrap}>
          <Image
            src="/images/manabi-cover.png"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 640px"
            className={styles.cover}
          />
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close Manabi project notes"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.content} data-lenis-prevent>
          <p className={styles.eyebrow}>Manabi · Independent side project</p>
          <h2
            ref={titleRef}
            id="manabi-modal-title"
            className={styles.title}
            tabIndex={-1}
          >
            Helping parents make a school shortlist
          </h2>
          <p className={styles.intro}>
            Manabi is my independent school-search project for families in Thailand. I took it from product direction and design through development and launch, including the school data and tools behind the public site.
          </p>

          {SECTIONS.map(section => (
            <section key={section.label} className={styles.section}>
              <h3 className={styles.sectionLabel}>{section.label}</h3>
              <p className={styles.sectionBody}>{section.body}</p>
            </section>
          ))}

          <details className={styles.technical}>
            <summary>How I built it</summary>
            <p className={styles.sectionBody}>
              Built with Next.js, TypeScript and Supabase/PostgreSQL, with AI assistance
              during development. Search uses PostGIS for location and PostgreSQL
              full-text search for Thai queries.
            </p>
          </details>

          <a
            href={PERSONAL_PROJECT.url}
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Manabi <ArrowUpRight size={14} aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </div>
  )
}
