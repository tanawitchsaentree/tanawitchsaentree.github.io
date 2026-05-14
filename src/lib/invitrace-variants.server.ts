// Server-only: reads MDX files from disk. Do NOT import in client components.
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { VariantData } from './invitrace-variants'

const VARIANTS_DIR = path.join(process.cwd(), 'content/universes/invitrace/variants')

export function getAllVariants(): Record<string, VariantData> {
  if (!fs.existsSync(VARIANTS_DIR)) return {}

  return fs
    .readdirSync(VARIANTS_DIR)
    .filter(f => f.endsWith('.mdx'))
    .reduce<Record<string, VariantData>>((acc, file) => {
      const raw = fs.readFileSync(path.join(VARIANTS_DIR, file), 'utf8')
      const { data } = matter(raw)
      const key = file.replace('.mdx', '')
      acc[key] = data as VariantData
      return acc
    }, {})
}
