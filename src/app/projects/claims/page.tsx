import type { Metadata } from 'next'
import { ClaimsClient } from './ClaimsClient'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'The life of a cargo claim · Claims · Tanawitch Saentree',
  description: 'Following one damaged shipment through a claims system I designed and prototyped, from the first phone call to closing.',
}

export default function ClaimsPage() {
  return <ClaimsClient />
}
