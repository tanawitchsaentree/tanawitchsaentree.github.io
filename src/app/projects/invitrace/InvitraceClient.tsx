'use client'

import { InvitraceCase } from '@/demos/invitrace/InvitraceCase'

// The case study used to be a static iframe (public/demos/invitrace-ds.html). It is now a
// React page whose text lives in src/content/case-studies/invitrace.json.
export function InvitraceClient() {
  return <InvitraceCase />
}
