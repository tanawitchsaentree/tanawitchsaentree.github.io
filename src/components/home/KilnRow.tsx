'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { KilnModal } from './KilnModal'
import { KILN_PROJECT } from './kilnData'
import styles from './HomeDocument.module.css'

interface KilnRowProps {
  /** Lets the homepage pause its background motion while the dialog is open. */
  onOpenChange: (open: boolean) => void
}

export function KilnRow({ onOpenChange }: KilnRowProps) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  useEffect(() => { onOpenChange(open) }, [open, onOpenChange])

  return (
    <>
      <div className={styles.project}>
        <div className={styles.projectImage}>
          <Image src="/images/kiln-thumb.webp" alt="" fill sizes="(max-width: 480px) 64px, 96px" />
        </div>
        <div>
          <div className={styles.projectHead}>
                  <h3 className={styles.projectTitle}>{KILN_PROJECT.title}</h3>
                  <span className={styles.projectTag}>{KILN_PROJECT.tag}</span>
                </div>
          <p className={styles.projectDescription}>{KILN_PROJECT.description}</p>
          <div className={styles.projectLinks}>
            <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">
              {KILN_PROJECT.details} <ArrowRight size={14} aria-hidden="true" /><span className="sr-only">: {KILN_PROJECT.title}</span>
            </button>
            <a href={KILN_PROJECT.url} target="_blank" rel="noopener noreferrer">
              {KILN_PROJECT.linkLabel} <ArrowUpRight size={12} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
      {/* The row sits inside <main>, which ProjectModal marks inert while open. The dialog renders
          at body level, beside <main> like the other project dialogs. */}
      {open && createPortal(<KilnModal open onClose={close} />, document.body)}
    </>
  )
}
