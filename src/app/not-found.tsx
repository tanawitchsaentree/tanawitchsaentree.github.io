import Link from 'next/link'
import { SELECTED_WORK } from '@/data/home'
import styles from '@/components/home/HomeDocument.module.css'

export const metadata = { title: 'Page not found · Tanawitch Saentree' }

/** A dead link lands here. It names the problem and gives the ways forward: the case studies, home, email. */
export default function NotFound() {
  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.document}>
        <h1 className={styles.name}>This page has moved or never existed</h1>
        <p className={styles.bio}>Seven case studies I’d point you to instead:</p>
        <ul className={styles.lostList}>
          {SELECTED_WORK.map(w => (
            <li key={w.href}><Link href={w.href}>{w.title} <span>{w.company}</span></Link></li>
          ))}
        </ul>
        <nav className={styles.contactLinks} aria-label="Other ways forward">
          <Link href="/">Back to the home page</Link>
          <a href="mailto:tanawitch.saentree@gmail.com">Email me</a>
        </nav>
      </div>
    </main>
  )
}
