'use client'

import { ConfidenceGate } from '@/demos/allianz'

// Routes slug → demo component.
// Demo logic lives in src/demos/ — keep this file as a thin router only.
export function SubCaseGimmick({ slug }: { slug: string }) {
  if (slug === 'document-classification') return <ConfidenceGate />
  // LoopRace (prompt-management) and FallbackSort (fallback-states) coming next
  return null
}
