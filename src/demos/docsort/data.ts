// Allianz case study. All story text and sample data live in content/gated/docsort.json and
// ship only as an encrypted blob (scripts/encrypt-gated.mjs). These exports are live views
// that read the decrypted blob at render time; see src/lib/gated.ts.
import { gated } from '@/lib/gated'

const G = 'docsort'

export type L1 = { name: string; l2: string[] }
export type Shape = 'claims' | 'complaints' | 'policy'
export type Sample = {
  id: string; file: string; expected: string
  result: { leaf: string; confidence: number; reasoning: string } | { failed: string }
}
export type QueueDoc = { id: string; date: string; sender: string; category: string; queue: string }
type Moment = { title: string; body: string; how: string[] }

/** L0 = line of business. Each office builds its own tree under it. */
export const SHAPES = gated<Record<Shape, { label: string; l0: string; l1: L1[]; note?: string }>>(G, 'SHAPES')
export const SHAPE_ORDER: Shape[] = ['claims', 'complaints', 'policy']
/** The card that moment 2 adds and removes (and autoplay adds). */
export const TOGGLE_CARD = gated<{ l1: string; l2: string }>(G, 'TOGGLE_CARD')
export const PROMPT_HEAD = gated<string[]>(G, 'PROMPT_HEAD')
export const SAMPLES = gated<Sample[]>(G, 'SAMPLES')
export const QUEUES = gated<string[]>(G, 'QUEUES')
export const QUEUE_DOCS = gated<QueueDoc[]>(G, 'QUEUE_DOCS')
/** Extracted fields for the opened document. One cell is flagged for a check. */
export const FIELDS = gated<{ field: string; value: string; flag?: string }[]>(G, 'FIELDS')
export const HERO = gated<{ eyebrow: string; title: string; intro: string }>(G, 'HERO')
export const MOMENTS = gated<Moment[]>(G, 'MOMENTS')
export const COPY = gated<{ credit: string; duplicateError: string }>(G, 'COPY')
