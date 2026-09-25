'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight, ChevronDown, LockKeyhole } from 'lucide-react'
import { GraphiteBackground } from '@/components/home/GraphiteBackground'
import { ManabiModal } from '@/components/home/ManabiModal'
import { PERSONAL_PROJECT, PROFILE, SELECTED_WORK, TOOLS } from '@/data/home'
import styles from '@/components/home/HomeDocument.module.css'

export function HomeClient() {
  const [lightPaused, setLightPaused] = useState(false)
  const [manabiOpen, setManabiOpen] = useState(false)
  const closeManabi = useCallback(() => setManabiOpen(false), [])

  return (
    <>
      <GraphiteBackground paused={lightPaused || manabiOpen} />
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

          <section className={styles.section} aria-labelledby="independent-heading">
            <h2 id="independent-heading" className={styles.sectionHeading}>Independent project</h2>
            <div className={styles.project}>
              <div className={styles.projectImage}>
                <Image src="/images/manabi-cover.png" alt="" fill sizes="(max-width: 480px) 64px, 96px" />
              </div>
              <div>
                <h3 className={styles.projectTitle}>{PERSONAL_PROJECT.title}</h3>
                <p className={styles.projectDescription}>{PERSONAL_PROJECT.description}</p>
                <div className={styles.projectLinks}>
                  <button type="button" onClick={() => setManabiOpen(true)} aria-haspopup="dialog">
                    {PERSONAL_PROJECT.details} <ArrowRight size={14} aria-hidden="true" />
                  </button>
                  <a href={PERSONAL_PROJECT.url} target="_blank" rel="noopener noreferrer">
                    Visit Manabi <ArrowUpRight size={12} aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          <details className={styles.more}>
            <summary>Writing &amp; tools <ChevronDown size={14} aria-hidden="true" /></summary>
            <div className={styles.moreContent}>
              <p className={styles.moreIntro}>A few things I make and share alongside product work.</p>
              <ul className={styles.toolList}>
                {TOOLS.map(tool => (
                  <li key={tool.name}>
                    <a href={tool.href} target="_blank" rel="noopener noreferrer">
                      <span className={styles.toolName}>
                        {tool.name} <ArrowUpRight size={12} aria-hidden="true" />
                        <span className="sr-only"> (opens in a new tab)</span>
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
    </>
  )
}
