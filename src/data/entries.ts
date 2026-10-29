import { BREWCODEX_PROJECT, BRICKFORGE_PROJECT, PERSONAL_PROJECT, SELECTED_WORK, TOOLS } from '@/data/home'
import { PANE_PROJECT } from '@/components/home/paneData'
import { KILN_PROJECT } from '@/components/home/kilnData'

export type Category = 'work' | 'personal' | 'skill' | 'design-system'
export type ModalKey = 'manabi' | 'brewcodex' | 'brickforge' | 'pane' | 'kiln'

export const TABS: { id: 'all' | Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'work', label: 'Work' },
  { id: 'personal', label: 'Personal projects' },
  { id: 'skill', label: 'Skills' },
  { id: 'design-system', label: 'Design systems' },
]

export interface Entry {
  id: string
  categories: Category[]
  /** Small label above the title: the employer for work, the kind of project otherwise. */
  kind: string
  /** Right of the label: a period for work. */
  meta?: string
  title: string
  /** Role line under the title (work only). */
  role?: string
  description: string
  thumb?: { src: string; contain?: boolean }
  /** What the first action does. Entries that only link out have no primary action. */
  primary?: { type: 'case'; href: string; protected: boolean } | { type: 'modal'; key: ModalKey; label: string }
  external?: { href: string; label: string }
}

const work = (id: string, extra: Category[] = []): Entry => {
  const w = SELECTED_WORK.find(x => x.href === `/projects/${id}/`)!
  return {
    id, categories: ['work', ...extra], kind: w.company, meta: w.period, title: w.title, role: w.role,
    description: w.description, primary: { type: 'case', href: w.href, protected: w.protected },
  }
}

const tims = SELECTED_WORK.find(x => x.href === '/projects/tims/')!
const humanTone = TOOLS.find(t => t.name === 'Human Tone')!

/** Order is the order of the "All" tab: the work I'd lead with first, then the projects. */
export const ENTRIES: Entry[] = [
  work('allianz'),
  work('claims'),
  work('invitrace', ['design-system']),
  {
    id: 'pane', categories: ['personal', 'design-system'], kind: PANE_PROJECT.tag, title: PANE_PROJECT.title,
    description: PANE_PROJECT.description, thumb: { src: '/images/pane-thumb.webp' },
    primary: { type: 'modal', key: 'pane', label: PANE_PROJECT.details },
    external: { href: PANE_PROJECT.docsUrl, label: 'Pane docs' },
  },
  {
    id: 'kiln', categories: ['personal', 'skill', 'design-system'], kind: KILN_PROJECT.tag, title: KILN_PROJECT.title,
    description: KILN_PROJECT.description, thumb: { src: '/images/kiln-thumb.webp' },
    primary: { type: 'modal', key: 'kiln', label: KILN_PROJECT.details },
    external: { href: KILN_PROJECT.url, label: KILN_PROJECT.linkLabel },
  },
  {
    id: 'brickforge', categories: ['personal'], kind: BRICKFORGE_PROJECT.tag, title: BRICKFORGE_PROJECT.title,
    description: BRICKFORGE_PROJECT.description, thumb: { src: '/images/brickforge-thumb.webp' },
    primary: { type: 'modal', key: 'brickforge', label: BRICKFORGE_PROJECT.details },
    external: { href: BRICKFORGE_PROJECT.url, label: BRICKFORGE_PROJECT.linkLabel },
  },
  {
    id: 'brewcodex', categories: ['personal'], kind: BREWCODEX_PROJECT.tag, title: BREWCODEX_PROJECT.title,
    description: BREWCODEX_PROJECT.description, thumb: { src: '/images/brewcodex-thumb.webp', contain: true },
    primary: { type: 'modal', key: 'brewcodex', label: BREWCODEX_PROJECT.details },
    external: { href: BREWCODEX_PROJECT.url, label: 'Visit Brewcodex' },
  },
  {
    id: 'manabi', categories: ['personal'], kind: PERSONAL_PROJECT.tag, title: PERSONAL_PROJECT.title,
    description: PERSONAL_PROJECT.description, thumb: { src: '/images/manabi-thumb.webp' },
    primary: { type: 'modal', key: 'manabi', label: PERSONAL_PROJECT.details },
    external: { href: PERSONAL_PROJECT.url, label: 'Visit Manabi' },
  },
  work('vitae'),
  work('profita'),
  work('stellareat'),
  {
    id: 'tims', categories: ['personal'], kind: tims.company, meta: tims.period, title: tims.title, role: tims.role,
    description: tims.description, primary: { type: 'case', href: tims.href, protected: false },
  },
  {
    id: 'human-tone', categories: ['personal', 'skill'], kind: 'Claude Code skill', title: humanTone.name,
    description: humanTone.description,
    external: { href: humanTone.href, label: 'View on GitHub' },
  },
]
