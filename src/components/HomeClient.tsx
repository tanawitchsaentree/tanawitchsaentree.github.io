'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { ArrowRight, ArrowUpRight, ChevronDown, Github, LockKeyhole } from 'lucide-react'
import { GraphiteBackground } from '@/components/home/GraphiteBackground'
import { ManabiModal } from '@/components/home/ManabiModal'
import { BrewcodexModal } from '@/components/home/BrewcodexModal'
import { BrickForgeModal } from '@/components/home/BrickForgeModal'
import { BREWCODEX_PROJECT, BRICKFORGE_PROJECT, PERSONAL_PROJECT, PROFILE, SELECTED_WORK, TOOLS } from '@/data/home'
import styles from '@/components/home/HomeDocument.module.css'

// Pane renders in `npm run dev` only. The condition has to stay a literal NODE_ENV check:
// webpack drops the import (and every word of the unpublished copy) only when it can evaluate the
// branch at build time. To publish, replace the condition with `true`.
const PaneRow = process.env.NODE_ENV === 'development'
  ? dynamic(() => import('@/components/home/PaneRow').then(m => m.PaneRow))
  : null

export function HomeClient() {
  const [lightPaused, setLightPaused] = useState(false)
  const [manabiOpen, setManabiOpen] = useState(false)
  const closeManabi = useCallback(() => setManabiOpen(false), [])
  const [brewcodexOpen, setBrewcodexOpen] = useState(false)
  const closeBrewcodex = useCallback(() => setBrewcodexOpen(false), [])
  const [paneOpen, setPaneOpen] = useState(false)
  const [brickForgeOpen, setBrickForgeOpen] = useState(false)
  const closeBrickForge = useCallback(() => setBrickForgeOpen(false), [])

  return (
    <>
      <GraphiteBackground paused={lightPaused || manabiOpen || brewcodexOpen || brickForgeOpen || paneOpen} />
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

          <section className={styles.section} aria-labelledby="independent-heading">
            <h2 id="independent-heading" className={styles.sectionHeading}>Independent projects</h2>
            <div className={styles.projects}>
              <div className={styles.project}>
                <div className={styles.projectImage}>
                  <Image src="/images/manabi-thumb.webp" alt="" fill sizes="(max-width: 480px) 64px, 96px" />
                </div>
                <div>
                  <div className={styles.projectHead}>
                  <h3 className={styles.projectTitle}>{PERSONAL_PROJECT.title}</h3>
                  <span className={styles.projectTag}>{PERSONAL_PROJECT.tag}</span>
                </div>
                  <p className={styles.projectDescription}>{PERSONAL_PROJECT.description}</p>
                  <div className={styles.projectLinks}>
                    <button type="button" onClick={() => setManabiOpen(true)} aria-haspopup="dialog">
                      {PERSONAL_PROJECT.details} <ArrowRight size={14} aria-hidden="true" /><span className="sr-only">: {PERSONAL_PROJECT.title}</span>
                    </button>
                    <a href={PERSONAL_PROJECT.url} target="_blank" rel="noopener noreferrer">
                      Visit Manabi <ArrowUpRight size={12} aria-hidden="true" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className={styles.project}>
                <div className={`${styles.projectImage} ${styles.projectLogo}`}>
                  <Image src="/images/brewcodex-thumb.webp" alt="" fill sizes="(max-width: 480px) 64px, 96px" />
                </div>
                <div>
                  <div className={styles.projectHead}>
                  <h3 className={styles.projectTitle}>{BREWCODEX_PROJECT.title}</h3>
                  <span className={styles.projectTag}>{BREWCODEX_PROJECT.tag}</span>
                </div>
                  <p className={styles.projectDescription}>{BREWCODEX_PROJECT.description}</p>
                  <div className={styles.projectLinks}>
                    <button type="button" onClick={() => setBrewcodexOpen(true)} aria-haspopup="dialog">
                      {BREWCODEX_PROJECT.details} <ArrowRight size={14} aria-hidden="true" /><span className="sr-only">: {BREWCODEX_PROJECT.title}</span>
                    </button>
                    <a href={BREWCODEX_PROJECT.url} target="_blank" rel="noopener noreferrer">
                      Visit Brewcodex <ArrowUpRight size={12} aria-hidden="true" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className={styles.project}>
                <div className={styles.projectImage}>
                  <Image src="/images/brickforge-thumb.webp" alt="" fill sizes="(max-width: 480px) 64px, 96px" />
                </div>
                <div>
                  <div className={styles.projectHead}>
                    <h3 className={styles.projectTitle}>{BRICKFORGE_PROJECT.title}</h3>
                    <span className={styles.projectTag}>{BRICKFORGE_PROJECT.tag}</span>
                  </div>
                  <p className={styles.projectDescription}>{BRICKFORGE_PROJECT.description}</p>
                  <div className={styles.projectLinks}>
                    <button type="button" onClick={() => setBrickForgeOpen(true)} aria-haspopup="dialog">
                      {BRICKFORGE_PROJECT.details} <ArrowRight size={14} aria-hidden="true" /><span className="sr-only">: {BRICKFORGE_PROJECT.title}</span>
                    </button>
                    <a href={BRICKFORGE_PROJECT.url} target="_blank" rel="noopener noreferrer">
                      {BRICKFORGE_PROJECT.linkLabel} <ArrowUpRight size={12} aria-hidden="true" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </div>
                </div>
              </div>
              {PaneRow && <PaneRow onOpenChange={setPaneOpen} />}
            </div>
          </section>

          <section id="work" className={styles.section} aria-labelledby="work-heading">
            <h2 id="work-heading" className={styles.sectionHeading}>Selected work</h2>
            <ul className={styles.workList}>
              {SELECTED_WORK.map(work => (
                <li key={work.href}>
                  <Link href={work.href} className={styles.workLink}>
                    <div className={styles.workTopline}>
                      <span className={styles.company}>{work.company}</span>
                      <span className={styles.period}>{work.period}</span>
                    </div>
                    <h3 className={styles.workTitle}>{work.title}</h3>
                    <p className={styles.workRole}>{work.role}</p>
                    <p className={styles.workDescription}>{work.description}</p>
                    <span className={styles.workAction}>
                      View case study <ArrowRight size={14} aria-hidden="true" />
                      {work.protected && (
                        <span className={styles.accessNote}>
                          <LockKeyhole size={11} aria-hidden="true" /> Password required
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <details className={styles.more}>
            <summary>Writing &amp; tools <ChevronDown size={14} aria-hidden="true" /></summary>
            <div className={styles.moreContent}>
              <p className={styles.moreIntro}>Claude Code skills I build and share alongside product work. They&apos;re public on GitHub.</p>
              <ul className={styles.toolList}>
                {TOOLS.map(tool => (
                  <li key={tool.name}>
                    <a href={tool.href} target="_blank" rel="noopener noreferrer">
                      <span className={styles.toolHead}>
                        <span className={styles.toolName}>
                          <Github size={13} aria-hidden="true" className={styles.toolIcon} />
                          {tool.name} <ArrowUpRight size={12} aria-hidden="true" />
                          <span className="sr-only"> on GitHub (opens in a new tab)</span>
                        </span>
                        <span className={styles.toolKind}>{tool.kind}</span>
                      </span>
                      <span className={styles.toolDescription}>{tool.description}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className={styles.profileLinks}>
                <a href="https://medium.com/@tanawitchsaentree" target="_blank" rel="noopener noreferrer">Writing on Medium <span className="sr-only">(opens in a new tab)</span></a>
                <a href="https://www.behance.net/tanawitchsaentree" target="_blank" rel="noopener noreferrer">More work on Behance <span className="sr-only">(opens in a new tab)</span></a>
              </div>
            </div>
          </details>

          <footer className={styles.footer}>
            <a href={`mailto:${PROFILE.email}`} className={styles.email}>{PROFILE.email}</a>
            <button type="button" className={styles.lightControl} aria-pressed={lightPaused} onClick={() => setLightPaused(value => !value)}>
              {lightPaused ? 'Resume background motion' : 'Pause background motion'}
            </button>
          </footer>
        </div>
      </main>
      <ManabiModal open={manabiOpen} onClose={closeManabi} />
      <BrewcodexModal open={brewcodexOpen} onClose={closeBrewcodex} />
      <BrickForgeModal open={brickForgeOpen} onClose={closeBrickForge} />
    </>
  )
}
