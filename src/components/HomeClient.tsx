'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FieldCanvas } from '@/components/home/FieldCanvas'
import styles from '@/components/home/HomeDocument.module.css'

// ── routing / data ────────────────────────────────────────────

const UNIVERSE_SLUGS: Record<string, string> = {
  'allianz-doc-classification': '/projects/allianz',
  'invitrace-design-system':    '/projects/invitrace',
  'profita-mutual-fund':        '/projects/profita',
  'stellareat':                 '/projects/stellareat',
  'vitae':                      '/projects/vitae',
  'tims-pos':                   '/projects/tims',
  'claims':                     '/projects/claims',
}

interface WorkRow {
  year:      string
  company:   string
  role:      string
  outcome:   string
  slug?:     string
}

const WORK_HISTORY: WorkRow[] = [
  {
    year: '2025 →', company: 'Allianz Technology', role: 'Senior Designer',
    outcome: 'Validation now takes hours',
    slug: 'allianz-doc-classification',
  },
  {
    year: '2024–25', company: 'Invitrace Health', role: 'Lead Product Designer',
    outcome: 'Three archetypes, one engine',
    slug: 'invitrace-design-system',
  },
  {
    year: '2024', company: 'Stellareat', role: 'Product Designer',
    outcome: 'Personalisation flow for recipes',
    slug: 'stellareat',
  },
  {
    year: '2020', company: 'Robowealth · LH Bank', role: 'Senior UX/UI Designer',
    outcome: 'Best App for CX (2023)',
    slug: 'profita-mutual-fund',
  },
]

interface KitRow {
  kind:      string
  name:      string
  role:      string
  outcome:   string
  href:      string
}

const KIT: KitRow[] = [
  {
    kind: 'skill', name: '/human-tone', role: 'made it, free to grab',
    outcome: 'catches AI phrasing pre-publish',
    href: 'https://github.com/tanawitchsaentree/Human-tone',
  },
]

const SOCIAL = [
  { label: 'mail',     href: 'mailto:tanawitch.saentree@gmail.com' },
  { label: 'github',   href: 'https://github.com/tanawitchsaentree' },
  { label: 'medium',   href: 'https://medium.com/@tanawitchsaentree' },
  { label: 'behance',  href: 'https://www.behance.net/tanawitchsaentree' },
] as const

// ── WorkRow ───────────────────────────────────────────────────

function WorkRowItem({ entry, onNavigate }: { entry: WorkRow; onNavigate: (href: string) => void }) {
  const [show, setShow] = useState(false)
  const path = entry.slug ? UNIVERSE_SLUGS[entry.slug] : undefined

  const body = (
    <>
      <span className={styles.yr}>{entry.year}</span>
      <span className={styles.nm}>{entry.company.toLowerCase()}</span>
      {' · '}
      <span className={styles.dt}>{show ? entry.outcome : entry.role}</span>
    </>
  )

  const handlers = {
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false),
    onFocus: () => setShow(true),
    onBlur:  () => setShow(false),
  }

  if (path) {
    return (
      <button
        type="button"
        className={`${styles.row} ${styles.ln} ${show ? styles.show : ''}`}
        {...handlers}
        onClick={() => onNavigate(path)}
      >
        {body}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`${styles.row} ${styles.ln} ${show ? styles.show : ''}`}
      {...handlers}
      onClick={() => setShow(s => !s)}
    >
      {body}
    </button>
  )
}

function KitRowItem({ entry }: { entry: KitRow }) {
  const [show, setShow] = useState(false)

  return (
    <a
      href={entry.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.row} ${styles.ln} ${show ? styles.show : ''}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      <span className={styles.yr}>{entry.kind}</span>
      <span className={styles.nm}>{entry.name}</span>
      {' · '}
      <span className={styles.dt}>{show ? entry.outcome : entry.role}</span>
    </a>
  )
}

// ── HomeClient ────────────────────────────────────────────────

export function HomeClient() {
  const router = useRouter()
  const [open, setOpen]         = useState(false)
  const [fieldOn, setFieldOn]   = useState(false)
  const [pulseSignal, setPulseSignal] = useState(0)

  const navigateWithTransition = useCallback((href: string) => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as Document & { startViewTransition: (cb: () => void) => void })
        .startViewTransition(() => router.push(href))
    } else {
      router.push(href)
    }
  }, [router])

  return (
    <>
      <FieldCanvas
        active={fieldOn}
        pulseSignal={pulseSignal}
        className="fixed inset-0 -z-10 pointer-events-none transition-opacity duration-[1.1s] ease-[var(--ease-in-out-natural)]"
        style={{ opacity: fieldOn ? 1 : 0 }}
      />

      <main id="main-content" tabIndex={-1} className="flex" style={{ minHeight: '100svh' }}>
        <h1 className="sr-only">Tanawitch Saentree — Senior Product Designer</h1>

        <div
          className="m-auto px-6"
          style={{ width: 'min(62ch, 100%)', padding: 'clamp(3rem, 8vw, 5rem) 1.5rem' }}
        >
          {/* ── Bio ─────────────────────────────────── */}
          <div className="mb-1">
            <span className="text-[var(--fg)]">tanawitch saentree</span>{' '}
            <span className="text-[var(--fg-muted)]">· senior product designer at allianz technology</span>
          </div>
          <p className="text-[var(--fg-muted)] leading-[1.9] mt-3 mb-4 max-w-[46ch]">
            i design AI workflows for regulated industries like insurance, banks, and hospitals,
            and ship the production code that proves they work. bangkok, open to relocating.
          </p>
          <a href="mailto:tanawitch.saentree@gmail.com" className="text-[var(--fg-muted)]">
            tanawitch.saentree@gmail.com
          </a>

          {/* ── the fold ────────────────────────────── */}
          <div id="home-fold" className={`${styles.fold} ${open ? styles.open : ''}`}>
            <div className={styles.foldInner}>
              <div className={`${styles.h} ${styles.ln} mt-6 mb-1`}>work</div>
              {WORK_HISTORY.map(entry => (
                <WorkRowItem key={entry.company} entry={entry} onNavigate={navigateWithTransition} />
              ))}

              <div className={`${styles.h} ${styles.ln} mt-6 mb-1`}>kit</div>
              {KIT.map(entry => (
                <KitRowItem key={entry.name} entry={entry} />
              ))}

              <div className={`${styles.h} ${styles.ln} mt-6 mb-1 text-[var(--fg-subtle)]`}>contact</div>
              <div className={styles.ln}>
                {SOCIAL.map((link, i) => (
                  <span key={link.label}>
                    <a href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-[var(--fg-muted)]">
                      {link.label}
                    </a>
                    {i < SOCIAL.length - 1 && ' · '}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className={`${styles.row} ${styles.ln} mt-1`}
                onClick={() => { setFieldOn(true); setPulseSignal(s => s + 1) }}
                aria-label="Reveal the point field behind this page"
              >
                <span className={styles.yr}>live</span>
                <span className={styles.nm}>field</span>
                {' · '}
                <span className={styles.dt}>the 4,500 points behind this page</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            className={`${styles.toggle} mt-6`}
            aria-expanded={open}
            aria-controls="home-fold"
            onClick={() => setOpen(o => !o)}
          >
            ( {open ? 'less' : 'more'} )<span className={styles.cursor}>_</span>
          </button>
        </div>
      </main>
    </>
  )
}
