import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { ProjectFrontmatter } from '@/types/project'

const CONTENT_DIR = path.join(process.cwd(), 'content/projects')

export function getAllProjects(): ProjectFrontmatter[] {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'))
  return files
    .map(file => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8')
      const { data } = matter(raw)
      return { ...data, slug: file.replace('.mdx', '') } as ProjectFrontmatter
    })
    .sort((a, b) => a.order - b.order)
}

export function getProjectBySlug(slug: string): { frontmatter: ProjectFrontmatter; content: string } {
  const file = path.join(CONTENT_DIR, `${slug}.mdx`)
  const raw = fs.readFileSync(file, 'utf8')
  const { data, content } = matter(raw)
  return {
    frontmatter: { ...data, slug } as ProjectFrontmatter,
    content,
  }
}

export function getGridProjects(): ProjectFrontmatter[] {
  return getAllProjects().filter(p => p.inGrid)
}
