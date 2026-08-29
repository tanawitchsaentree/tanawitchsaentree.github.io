'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { X, ArrowUpRight } from 'lucide-react'
import styles from './ManabiModal.module.css'

const MANABI_URL = 'https://manabischools.com'

const SECTIONS = [
  {
    label: 'the stack',
    body: "Next.js on the front, Supabase behind it. The framework isn't the interesting part. What's underneath is. There are 46 database migrations, 44 custom Postgres functions, geospatial search running on PostGIS, and full-text search tuned for Thai. The real logic lives in the database instead of being bolted on after the fact.",
  },
  {
    label: 'why that matters',
    body: 'Most people who say they built the whole thing mean they designed the screens and someone else wired the backend. I mean I wrote the schema myself. When a parent searches "schools within 5km that teach in English," that query does real geospatial work. It isn\'t filtering a list in the browser. That line is where a demo becomes a product.',
  },
  {
    label: 'how long',
    body: "Eighteen days. 502 commits. Git doesn't let me round up. Two of those days ran past 60 commits each, which is faster than I'd recommend to anyone, myself included. I share the number because it answers the question people actually have. Can this person ship, or just talk about shipping.",
  },
  {
    label: 'where ai fits',
    body: 'Claude Code wrote most of the migrations and SQL functions. I made the calls that matter. What belongs in the database versus the interface. How the two-sided flow splits between parents and schools. Where the geo-search complexity was worth paying for. The AI moved fast. The judgment was mine. That split is the whole point of how I work now.',
  },
  {
    label: "what's not done",
    body: "Almost no tests yet. It's live but early, not a product with a user base I can brag about. A couple of the late-night security migrations deserve a proper review before I'd trust them at scale. I'd rather you hear that from me than find it yourself. If you want to see how the parts actually fit, the code is open.",
  },
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
      'a[href]:not([tabindex="-1"]), button:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])'
    )
    // Title is the initial focus target (SR should announce it, not
    // "Close, button") but it's not part of the real tab order and isn't
    // guaranteed to sit first in DOM order — so it's handled as a special
    // case below rather than folded into the first/last boundary directly.
    titleRef.current?.focus()

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
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.content} data-lenis-prevent>
          <h2
            ref={titleRef}
            id="manabi-modal-title"
            className={styles.title}
            tabIndex={-1}
          >
            manabi, the whole thing, one person
          </h2>
          <p className={styles.intro}>
            Thai parents choosing a school work blind. Reviews are thin, data
            is scattered, and the stakes are their kid. Manabi puts search,
            comparison and a saved shortlist in one place. I designed it and
            then I built it end to end. No team, no dev handoff, no page
            builder. Design all the way down to the database.
          </p>

          {SECTIONS.map(section => (
            <section key={section.label} className={styles.section}>
              <div className={styles.sectionLabel}>{section.label}</div>
              <p className={styles.sectionBody}>{section.body}</p>
            </section>
          ))}

          <a
            href={MANABI_URL}
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            see it live <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}
