// Case-study content for Allianz (docsort), Claims and Invitrace. It used to ship encrypted behind
// a shared password; since 2026-11-06 the case studies are public and the JSON is bundled
// directly from src/content/case-studies. The demo data modules still read it through gated()
// so their exports stay unchanged.
import claims from '@/content/case-studies/claims.json'
import docsort from '@/content/case-studies/docsort.json'
import invitrace from '@/content/case-studies/invitrace.json'

const store: Record<string, Record<string, unknown>> = {
  claims: claims as Record<string, unknown>,
  docsort: docsort as Record<string, unknown>,
  invitrace: invitrace as Record<string, unknown>,
}

/** One key of a case-study content file, typed by the caller. */
export function gated<T extends object>(name: string, key: string): T {
  const d = store[name]
  if (!d || !(key in d)) throw new Error(`Case-study content "${name}.${key}" is missing`)
  return d[key] as T
}
