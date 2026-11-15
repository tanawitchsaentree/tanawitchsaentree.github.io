import { StellareatClient } from './StellareatClient'

import { NextCase } from '@/components/case-study/NextCase'

export const dynamic = 'force-static'

export default function StellareatPage() {
  return <><StellareatClient /><NextCase current="stellareat" /></>
}
