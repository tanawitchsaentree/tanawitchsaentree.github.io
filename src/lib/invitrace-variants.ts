// Client-safe: types + constants only — no fs/path/gray-matter
export type Primitive = 'button' | 'field' | 'table'
export type Archetype = 'medium' | 'large' | 'specialty'

export interface VariantData {
  primitive: Primitive
  archetype: Archetype
  title: string
  description: string
  axisFlexible: string[]
  axisLocked: string[]
  reasoning: string
}

export const TREE_PRIMITIVES: Primitive[] = ['button', 'field', 'table']
export const TREE_ARCHETYPES: Archetype[] = ['medium', 'large', 'specialty']

export const ARCHETYPE_META: Record<Archetype, { label: string; color: string; abbr: string }> = {
  medium:    { label: 'Medium hospital',   color: '#0D9488', abbr: 'M' },
  large:     { label: 'Large hospital',    color: '#D97706', abbr: 'L' },
  specialty: { label: 'Specialty clinic',  color: '#E85D75', abbr: 'S' },
}

export const PRIMITIVE_META: Record<Primitive, { label: string; color: string }> = {
  button: { label: 'Button',  color: '#7B61FF' },
  field:  { label: 'Field',   color: '#7B61FF' },
  table:  { label: 'Table',   color: '#7B61FF' },
}
