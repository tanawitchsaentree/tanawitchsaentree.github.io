'use client'

import { useCallback, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { GraphiteBackground } from '@/components/home/GraphiteBackground'
import { ManabiModal } from '@/components/home/ManabiModal'
import { BrewcodexModal } from '@/components/home/BrewcodexModal'
import { BrickForgeModal } from '@/components/home/BrickForgeModal'
import { KilnModal } from '@/components/home/KilnModal'
import { PaneModal } from '@/components/home/PaneModal'
import { WorkTabs } from '@/components/home/WorkTabs'
import { PROFILE } from '@/data/home'
import type { ModalKey } from '@/data/entries'
import styles from '@/components/home/HomeDocument.module.css'

export function HomeClient() {
  const [lightPaused, setLightPaused] = useState(false)
  const [openProject, setOpenProject] = useState<ModalKey | null>(null)
  const close = useCallback(() => setOpenProject(null), [])

  return (
    <>
      <GraphiteBackground paused={lightPaused || openProject !== null} />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <div className={styles.document}>
          <header className={styles.intro}>
            <h1 className={styles.name}>{PROFILE.name}</h1>
            <p className={styles.role}>{PROFILE.title}</p>
            <p className={styles.bio}>{PROFILE.introduction}</p>
            <p className={styles.location}>
              <span>{PROFILE.location}</span>
              <span aria-hidden="true">·</span>
              <span>{PROFILE.availability}</span>
            </p>
            <nav className={styles.contactLinks} aria-label="Contact and profiles">
              <a href={`mailto:${PROFILE.email}`}>Email me</a>
              <a href={PROFILE.linkedIn} target="_blank" rel="noopener noreferrer">
                LinkedIn <ArrowUpRight size={12} aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a href={PROFILE.github} target="_blank" rel="noopener noreferrer">
                GitHub <ArrowUpRight size={12} aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </nav>
          </header>

          <section id="work" className={styles.section} aria-labelledby="work-heading">
            <h2 id="work-heading" className={styles.sectionHeading}>Work and projects</h2>
            <WorkTabs onOpen={setOpenProject} />
            <div className={styles.profileLinks}>
              <a href="https://medium.com/@tanawitchsaentree" target="_blank" rel="noopener noreferrer">Writing on Medium <span className="sr-only">(opens in a new tab)</span></a>
              <a href="https://www.behance.net/tanawitchsaentree" target="_blank" rel="noopener noreferrer">More work on Behance <span className="sr-only">(opens in a new tab)</span></a>
            </div>
          </section>

          <footer className={styles.footer}>
            <a href={`mailto:${PROFILE.email}`} className={styles.email}>{PROFILE.email}</a>
            <button type="button" className={styles.lightControl} aria-pressed={lightPaused} onClick={() => setLightPaused(value => !value)}>
              {lightPaused ? 'Resume background motion' : 'Pause background motion'}
            </button>
          </footer>
        </div>
      </main>
      <ManabiModal open={openProject === 'manabi'} onClose={close} />
      <BrewcodexModal open={openProject === 'brewcodex'} onClose={close} />
      <BrickForgeModal open={openProject === 'brickforge'} onClose={close} />
      <PaneModal open={openProject === 'pane'} onClose={close} />
      <KilnModal open={openProject === 'kiln'} onClose={close} />
    </>
  )
}
