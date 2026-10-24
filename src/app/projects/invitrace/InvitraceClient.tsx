'use client'

import { InvitraceCase } from '@/demos/invitrace/InvitraceCase'

// The case study used to be a static iframe (public/demos/invitrace-ds.html), which anyone
// could open without the password. It is now a React page whose text ships encrypted.
export function InvitraceClient() {
  return <InvitraceCase />
}
