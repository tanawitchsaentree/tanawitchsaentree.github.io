export interface ProjectFrontmatter {
  slug: string
  title: string
  company: string
  year: string
  role: string
  timeline: string
  team: string
  tags: string[]
  /** Short sentence for grid card */
  summary: string
  /** Solid hex for typographic cover background */
  coverColor: string
  /** Text color on cover — 'light' | 'dark' */
  coverFg: 'light' | 'dark'
  /** Optional: path to real cover image in /public/images/ */
  coverImage?: string
  /** Display order in grid (lower = earlier) */
  order: number
  /** If false, card appears in timeline only, not grid */
  inGrid: boolean
}

export interface Project extends ProjectFrontmatter {
  /** MDX compiled source for rendering */
  content: string
}
