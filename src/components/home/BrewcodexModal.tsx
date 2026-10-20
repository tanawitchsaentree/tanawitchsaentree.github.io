'use client'

import { ProjectModal, type ProjectSection } from './ProjectModal'
import styles from './ProjectModal.module.css'
import { BREWCODEX_PROJECT } from '@/data/home'

const SECTIONS: ProjectSection[] = [
  { label: 'From taste and collection to a deck', body: 'Players pick game moments and cards they like, or import a collection from Arena, Moxfield or Archidekt. The engine builds a 60-card deck in one to five colours with a mana base and a wildcard budget, and a library map shows which colour sets are playable, craftable or short.' },
  { label: 'Checked against real tournament lists', body: 'I split 812 tournament lists by day. The engine learns from earlier days and is tested on later ones. An early version collapsed five-colour requests into two. After the fix, colours kept went from 28.6% to 100% and castable mana from 71.1% to 92.1% on the validation set.' },
  { label: 'A score I chose not to show', body: 'I tried a single strength score twice. It fell as wildcards filled out the list, which is backwards. Each deck now shows the named archetype it is closest to and that archetype’s real match win rate.' },
  { label: 'Where it stands', body: 'Brewcodex is live and early. In the last 30 days the start page had 122 views and two decks were saved. More tournament sources and Thai baht card prices are next.' },
]

interface BrewcodexModalProps {
  open: boolean
  onClose: () => void
}

export function BrewcodexModal({ open, onClose }: BrewcodexModalProps) {
  return (
    <ProjectModal
      open={open}
      onClose={onClose}
      id="brewcodex-modal"
      name="Brewcodex"
      title="Finding a deck without knowing the archetypes"
      intro="New Arena players with a few thousand cards and few wildcards can’t tell a good deck from a pile of good cards. Brewcodex asks what they like, what they own and how many wildcards they have, then builds a deck and explains it in plain language. I directed the product, UX and art, and built it with Claude Code."
      sections={SECTIONS}
      technical="Vanilla JavaScript with no framework, Cloudflare Workers and D1, and deck generation in a Web Worker so the page stays responsive. Card and list data comes from Gatherer, Scryfall, MTGJSON and the lists Wizards publishes. Cutting the Commander data by colour identity took the precon page from 1.5 MB to about 130 KB. The repository is private."
      url={BREWCODEX_PROJECT.url}
      cover={
        <p className={styles.coverNote}>
          <span className="sr-only">Not shown: </span>
          <s className={styles.coverStruck}>strength %</s>
          <span className={styles.coverInstead}>
            <span className="sr-only">Shows instead: </span>
            the closest named archetype and its real{' '}
            <span className={styles.coverSignal}>win rate</span>
          </span>
        </p>
      }
    />
  )
}
