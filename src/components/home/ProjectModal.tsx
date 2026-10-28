'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import Image from 'next/image'
import { X, ArrowUpRight } from 'lucide-react'
import styles from './ProjectModal.module.css'

export interface ProjectFigure {
  src:     string
  alt:     string
  caption: string
  width:   number
  height:  number
}

export interface ProjectSection {
  label:   string
  body:    string
  /** An image that sits under the paragraph it illustrates. */
  figure?: ProjectFigure
}

interface ProjectModalProps {
  open:       boolean
  onClose:    () => void
  /** Unique per modal; used for aria-labelledby. */
  id:         string
  /** Project name, used in the eyebrow and the close/visit labels. */
  name:       string
  title:      string
  intro:      string
  sections:   ProjectSection[]
  technical:  string
  url:        string
  /** Link text; defaults to "Visit {name}". */
  linkLabel?: string
  /** Fills the cover slot (image or typographic panel). The close button sits on it. */
  cover:      ReactNode
  /** Width / height of the cover slot; defaults to the shared wide strip. Use the artwork's own ratio to avoid cropping it. */
  coverRatio?: number
}

export function ProjectModal({ open, onClose, id, name, title, intro, sections, technical, url, linkLabel, cover, coverRatio }: ProjectModalProps) {
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
        style={sections.some(s => s.figure) ? { width: 'min(760px, 100%)' } : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
      >
        <div className={styles.coverWrap} style={coverRatio ? { aspectRatio: coverRatio } : undefined}>
          {cover}
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={`Close ${name} project notes`}
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.eyebrow}>{name} · Independent side project</p>
          <h2
            ref={titleRef}
            id={`${id}-title`}
            className={styles.title}
            tabIndex={-1}
          >
            {title}
          </h2>
          <p className={styles.intro}>{intro}</p>

          {sections.map(section => (
            <section key={section.label} className={styles.section}>
              <h3 className={styles.sectionLabel}>{section.label}</h3>
              <p className={styles.sectionBody}>{section.body}</p>
              {section.figure && (
                <figure className={styles.figure}>
                  <Image
                    src={section.figure.src}
                    alt={section.figure.alt}
                    width={section.figure.width}
                    height={section.figure.height}
                    loading="lazy"
                    sizes="(max-width: 800px) 100vw, 712px"
                    className={styles.figureImage}
                  />
                  <figcaption className={styles.figureCaption}>{section.figure.caption}</figcaption>
                </figure>
              )}
            </section>
          ))}

          <details className={styles.technical}>
            <summary>How I built it</summary>
            <p className={styles.sectionBody}>{technical}</p>
          </details>

          <a
            href={url}
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkLabel ?? `Visit ${name}`} <ArrowUpRight size={14} aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </div>
  )
}
