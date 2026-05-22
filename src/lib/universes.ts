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

export interface SubCaseSections {
  problem: string       // ## The problem
  considered: string    // ## What I considered
  decision: string      // ## The decision + ## What changed (merged)
  tradeoff: string      // ## Trade-off ที่ยังอยู่
}

export interface SubCaseWithContent extends SubCaseFrontmatter {
  content: string         // full MDX (for fallback if needed)
  sections: SubCaseSections
}

// Split raw MDX content (after frontmatter) into named sections by ## heading
function parseSections(content: string): SubCaseSections {
  const blocks: Record<string, string> = {}
  let currentKey = ''

  for (const line of content.split('\n')) {
    const match = line.match(/^##\s+(.+)$/)
    if (match) {
      currentKey = match[1].trim()
      blocks[currentKey] = ''
    } else if (currentKey) {
      blocks[currentKey] = (blocks[currentKey] ?? '') + line + '\n'
    }
  }

  const trim = (s: string) => (s ?? '').trim()

  // Merge "The decision" + "What changed" into one panel
  const decisionMerged = [
    trim(blocks['The decision'] ?? ''),
    trim(blocks['What changed'] ?? ''),
  ].filter(Boolean).join('\n\n')

  return {
    problem:    trim(blocks['The problem'] ?? ''),
    considered: trim(blocks['What I considered'] ?? ''),
    decision:   decisionMerged,
    tradeoff:   trim(blocks['Trade-off ที่ยังอยู่'] ?? ''),
  }
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
      return {
        ...data,
        content,
        sections: parseSections(content),
      } as SubCaseWithContent
    })
    .sort((a, b) => a.order - b.order)
}
