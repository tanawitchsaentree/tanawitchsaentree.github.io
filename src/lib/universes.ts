import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const UNIVERSES_DIR = path.join(process.cwd(), 'content/universes')

export interface SubCaseFrontmatter {
  title: string
  slug: string
  tagline: string
  year: string
  tags: string[]
  order: number
}

export interface SubCaseWithContent extends SubCaseFrontmatter {
  content: string
}

export function getUniverseSubCases(universe: string): SubCaseWithContent[] {
  const dir = path.join(UNIVERSES_DIR, universe)
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.mdx'))
    .map(file => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8')
      const { data, content } = matter(raw)
      return { ...data, content } as SubCaseWithContent
    })
    .sort((a, b) => a.order - b.order)
}
