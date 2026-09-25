import type { Metadata } from 'next'
import { ClaimsClient } from './ClaimsClient'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Designer as Builder · Claims Platform · Tanawitch Saentree',
  description: 'Working interface prototypes for reviewing commercial claims workflows with the product team, from editing a claim to handling missing information.',
}

export default function ClaimsPage() {
  return <ClaimsClient />
}
