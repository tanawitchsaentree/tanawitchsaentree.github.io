'use client'

import Image from 'next/image'
import { ProjectModal, type ProjectSection } from './ProjectModal'
import styles from './ProjectModal.module.css'
import { PERSONAL_PROJECT } from '@/data/home'

const SECTIONS: ProjectSection[] = [
  { label: 'Where parents look today', body: 'Thai parents compare schools through Facebook groups and brochures. Manabi puts the schools side by side, and parents can build a shortlist without logging in.' },
  { label: 'Reasons parents can check', body: 'I replaced a weighted match percentage with the priorities a school meets. When a school hasn’t given a number, the site says so. The gap doesn’t push the school down the list.' },
  { label: 'The tools behind the pages', body: 'I also built the tools schools and admins use to keep those pages up to date.' },
]

interface ManabiModalProps {
  open: boolean
  onClose: () => void
}

export function ManabiModal({ open, onClose }: ManabiModalProps) {
  return (
    <ProjectModal
      open={open}
      onClose={onClose}
      id="manabi-modal"
      name="Manabi"
      title="Helping parents make a school shortlist"
      intro="Manabi is a school-search site I made for families in Thailand. I designed it and built it on my own."
      sections={SECTIONS}
      technical="Built with Next.js, TypeScript and Supabase/PostgreSQL, with AI assistance during development. Search uses PostGIS for location and PostgreSQL full-text search for Thai queries."
      url={PERSONAL_PROJECT.url}
      cover={
        <Image
          src="/images/manabi-cover.png"
          alt=""
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, 640px"
          className={styles.cover}
        />
      }
    />
  )
}
