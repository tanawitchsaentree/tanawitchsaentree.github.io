'use client'

import { ConfidenceSlider } from './ConfidenceSlider'

// Routes to the correct gimmick per sub-case slug
export function SubCaseGimmick({ slug }: { slug: string }) {
  if (slug === 'document-classification') return <ConfidenceSlider />
  // Gimmick 2 + 3 coming next
  return null
}
