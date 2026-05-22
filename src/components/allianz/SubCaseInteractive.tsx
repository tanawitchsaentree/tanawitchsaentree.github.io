'use client'

import { ConfidenceGate } from '@/demos/allianz'
import { PromptEditor }   from '@/demos/allianz'
import { BatchDispatch }  from '@/demos/allianz'

// Thin router — demo logic lives in src/demos/
export function SubCaseGimmick({ slug }: { slug: string }) {
  if (slug === 'document-classification') return <ConfidenceGate />
  if (slug === 'prompt-management')        return <PromptEditor />
  if (slug === 'fallback-states')          return <BatchDispatch />
  return null
}
