'use client'

import Image from 'next/image'
import { ProjectModal, type ProjectSection } from './ProjectModal'
import styles from './ProjectModal.module.css'
import { BREWCODEX_PROJECT } from '@/data/home'

const SECTIONS: ProjectSection[] = [
  { label: 'A deck around what you like and own', body: 'Players pick game moments and cards they like, or import a collection from Arena, Moxfield or Archidekt. The engine builds a 60-card deck in one to five colours, with a mana base and a wildcard budget. A library map then marks each colour set as playable, craftable or short. Precon and Commander pages work outside Arena too. So does the deck doctor, which takes any pasted list.' },
  { label: 'Checked against real tournament lists', body: 'I split 812 tournament lists by day. The engine learns from earlier days and is tested on later ones. An early version collapsed five-colour requests into two. Colours kept is now 100% on the validation set, up from 28.6%.' },
  { label: 'How closely to follow winning decks', body: "I didn't want it to copy winning decks, but those lists are the only real evidence of strength. With no lists at all, only 5% of its spells showed up in real decks. So I measured how much weight a new deck should give them. At full weight a deck matched its nearest winning list 88%, more than the 81% winners match each other. That is a copy. At a quarter weight it matched 74%, and the share of its cards that later winning lists play rose from 44% to 69%. Full weight only applies when the player asks for a competitive deck." },
  { label: 'A score I chose not to show', body: 'I tried a single strength score twice. It dropped as wildcards filled out the list, which is backwards. Each deck now shows the named archetype it is closest to and that archetype’s real match win rate.' },
  { label: 'Where it stands', body: 'Brewcodex is live and early. Most of the traffic so far is me testing, and I only started excluding my own visits on 20 October. More tournament sources and Thai baht card prices are next.' },
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
      intro="Brewcodex started with Arena. New players there own a few thousand cards and can’t tell a good deck from a pile of good cards. It grew into a site for anyone who doesn’t want to pay for a deck that isn’t theirs. You say what you like and what you own. It builds a deck around that and explains it in plain language. I directed the product, UX and art, and built it with Claude Code."
      sections={SECTIONS}
      technical="Vanilla JavaScript with no framework, Cloudflare Workers and D1, and deck generation in a Web Worker so the page stays responsive. Card and list data comes from Gatherer, Scryfall, MTGJSON and the lists Wizards publishes. Cutting the Commander data by colour identity took the precon page from 1.5 MB to about 130 KB. The repository is private."
      url={BREWCODEX_PROJECT.url}
      coverRatio={1662 / 708}
      cover={
        <Image
          src="/images/brewcodex-cover.webp"
          alt="Brewcodex artwork: a cat-eyed wizard in a purple night flicks glowing cards toward a castle."
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, 640px"
          className={styles.cover}
        />
      }
    />
  )
}
