import type { Metadata } from 'next'
import { ClaimsClient } from './ClaimsClient'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Designer as Builder · Claims Platform · Tanawitch Saentree',
  description: 'A commercial claims platform where I designed by building: fifteen production features shipped straight from ticket to live app, with an audit-build-verify loop that caught what static mockups couldn\'t.',
}

export default function ClaimsPage() {
  return <ClaimsClient />
}
