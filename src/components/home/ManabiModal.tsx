'use client'

import Image from 'next/image'
import { ProjectModal, type ProjectSection } from './ProjectModal'
import styles from './ProjectModal.module.css'
import { PERSONAL_PROJECT } from '@/data/home'

const SECTIONS: ProjectSection[] = [
  { label: 'From a long list to a few real options', body: 'I connected search, school profiles, comparison, and saved schools around the same family preferences. Parents can narrow their options and return to a shortlist without piecing the information together again.' },
  { label: 'Reasons parents can check', body: 'I replaced a weighted match percentage with the priorities a school meets. That decision shaped both the interface and the matching logic: show why an option appears, and leave room for what the data cannot answer.' },
  { label: 'The work behind the school pages', body: 'I also built school and admin tools for updating records and reviewing changes, with access rules that keep unpublished records out of public search. Keeping the information usable became part of the product work.' },
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
      intro="Manabi is my independent school-search project for families in Thailand. I took it from product direction and design through development and launch, including the school data and tools behind the public site."
      sections={SECTIONS}
      technical="Built with Next.js, TypeScript and Supabase/PostgreSQL, with AI assistance during development. Search uses PostGIS for location and PostgreSQL full-text search for Thai queries."
      url={PERSONAL_PROJECT.url}
      cover={
        <Image
          src="/images/manabi-cover.png"
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 640px"
          className={styles.cover}
        />
      }
    />
  )
}
