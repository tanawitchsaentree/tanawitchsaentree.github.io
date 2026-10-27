'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { PaneModal } from './PaneModal'
import { PANE_PROJECT } from './paneData'
import styles from './HomeDocument.module.css'

interface PaneRowProps {
  /** Lets the homepage pause its background motion while the dialog is open. */
  onOpenChange: (open: boolean) => void
}

export function PaneRow({ onOpenChange }: PaneRowProps) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  useEffect(() => { onOpenChange(open) }, [open, onOpenChange])

  return (
    <>
      <div className={styles.project}>
        <div className={styles.projectImage}>
          <Image src="/images/pane-thumb.webp" alt="" fill sizes="(max-width: 480px) 64px, 96px" />
        </div>
        <div>
          <div className={styles.projectHead}>
                  <h3 className={styles.projectTitle}>{PANE_PROJECT.title}</h3>
                  <span className={styles.projectTag}>{PANE_PROJECT.tag}</span>
                </div>
          <p className={styles.projectDescription}>{PANE_PROJECT.description}</p>
          <div className={styles.projectLinks}>
            <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">
              {PANE_PROJECT.details} <ArrowRight size={14} aria-hidden="true" /><span className="sr-only">: {PANE_PROJECT.title}</span>
            </button>
          </div>
        </div>
      </div>
      {/* The row sits inside <main>, which ProjectModal marks inert while open. The dialog renders
          at body level, beside <main> like the other project dialogs. */}
      {open && createPortal(<PaneModal open onClose={close} />, document.body)}
    </>
  )
}
