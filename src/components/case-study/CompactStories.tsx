'use client'
import { ClaimsCaseFile } from '@/demos/claims/casefile/ClaimsCaseFile'

// Stellareat, Tims and Vitae now live in their own files so edits stop colliding here.
export { StellarStory } from './StellarStory'
export { TimsStory } from './TimsStory'
export { VitaeStory } from './VitaeStory'

export function ClaimsStory() {
 return <ClaimsCaseFile />
}
