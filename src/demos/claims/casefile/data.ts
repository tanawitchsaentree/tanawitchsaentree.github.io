// Case file, Act 1. All story text and sample data live in content/gated/claims.json and
// ship only as an encrypted blob (scripts/encrypt-gated.mjs). These exports are live views
// that read the decrypted blob at render time; see src/lib/gated.ts.
import { gated } from '@/lib/gated'

const G = 'claims'

export type EdgeCase = 'expired' | 'noCause' | 'location'
type Moment = { title: string; body: string; how: string[] }

export const CLAIM = gated<{
  id: string; line: string; client: string; lossDay: number; policy: string; expiredPolicy: string
  cause: string; location: string; handlerReason: string; payee: string
}>(G, 'CLAIM')
export const EDGE_CASES = gated<{ id: EdgeCase; label: string }[]>(G, 'EDGE_CASES')
export const SECTIONS = gated<string[]>(G, 'SECTIONS')
export const SECTION_DETAILS = gated<{ name: string; what: string; damage: string }[]>(G, 'SECTION_DETAILS')
export const HERO = gated<{ eyebrow: string; title: string; intro: string; stats: string[] }>(G, 'HERO')
export const MOMENTS = gated<Moment[]>(G, 'MOMENTS')
export const CLOSE_STEPS = gated<string[]>(G, 'CLOSE_STEPS')
/** dateSection: the section that leaned on the loss date. credit: the closing line. */
export const COPY = gated<{ dateSection: string; credit: string }>(G, 'COPY')

// Interaction numbers (no story text).
export const RESERVE = 80_000
export const PAYMENT_MAX = 150_000
export const PAYMENT_STEP = 5_000
export const PAYMENT_AUTOPLAY = 120_000
export const DATE_AUTOPLAY_SHIFT = 7

export const fmtMoney = (n: number) => `EUR ${n.toLocaleString('en-GB')}`
export const fmtLoss = (shift: number) => `${CLAIM.lossDay + shift} Mar 2026`
