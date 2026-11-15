'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import styles from '@/components/home/HomeDocument.module.css'

// An older link to the Allianz document-sorting case study. The site is static, so this page
// forwards the reader in the browser (keeping ?ref= so the visit is still attributed) and keeps
// a plain link for anyone with scripts off.
export default function OldAllianzLink() {
  useEffect(() => {
    window.location.replace(`/projects/allianz/${window.location.search}${window.location.hash}`)
  }, [])
  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.document}>
        <h1 className={styles.name}>This case study moved</h1>
        <p className={styles.bio}><Link href="/projects/allianz/">Open the Allianz case study</Link></p>
      </div>
    </main>
  )
}
