import type { Metadata } from 'next'
import { ClaimsClient } from './ClaimsClient'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Designer as Builder — Claims Platform · Tanawitch Saentree',
  description: 'I stopped shipping Figma and started shipping working software — verified against acceptance criteria. Eight moments where designing in code changed what the product could be.',
}

export default function ClaimsPage() {
  return <ClaimsClient />
}
