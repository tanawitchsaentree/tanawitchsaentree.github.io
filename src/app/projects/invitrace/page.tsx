import { InvitraceClient } from './InvitraceClient'

import { NextCase } from '@/components/case-study/NextCase'

export const dynamic = 'force-static'

export default function InvitracePage() {
  return <><InvitraceClient /><NextCase current="invitrace" /></>
}
