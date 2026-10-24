// Invitrace case study. All story text, rules and sample data live in
// content/gated/invitrace.json and ship only as an encrypted blob (scripts/encrypt-gated.mjs).
// These exports are live views that read the decrypted blob at render time (src/lib/gated.ts).
import { gated } from '@/lib/gated'
import type { Fork } from './drift'
import type { ArchetypeId, GovRule, Hospital, Preset } from './model'

const G = 'invitrace'
type Sec = { title: string; body: string[]; request?: RequestId }
export type RequestId = 'copy' | 'colour' | 'alert' | 'doctor' | 'sort' | 'small'
export type LineTpl = { sign: ' ' | '+' | '−'; key: string; value: string; note?: string }

export const HERO = gated<{ eyebrow: string; title: string; intro: string; caption: string; requests: { id: RequestId; text: string; anchor: string }[]; credit: string; requestLabel: string; notAnswered: string }>(G, 'HERO')
export const MARKS = gated<Record<'s1' | 's2' | 's2after' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8' | 's9' | 's10', string>>(G, 'MARKS')
export const SECTIONS = gated<{
  s1: Sec
  s2: Sec & { staleTitle: string; stale: string[]; forkF: string }
  s3: Sec & { themeHead: string; themeItems: string[]; lockedHead: string; lockedItems: string[]; moreTitle: string; more: string[]; longRule: string; emptyRule: string }
  s4: Sec & { sent: string; sentLabel: string; substitute: string; asSent: string; refused: string }
  s5: Sec
  s6: Sec & { forkWhy: string }
  s7: Sec & { cost: string }
  s8: Sec & { asideTitle: string; aside: string; simulated: string }
  s9: Sec
  s10: Sec & { file: string; passed: string; waiting: string; empty: string; limits: string }
  rot: { kinds: Record<'detach' | 'copy' | 'invent' | 'prop', { label: string; name: string; why: string; short: string }> }
}>(G, 'SECTIONS')
export const LINES = gated<Record<'copy' | 'colour' | 'alert' | 'doctorYes' | 'doctorNo' | 'sort' | 'density' | 'small', LineTpl>>(G, 'LINES')
export const ARCHETYPES = gated<Record<ArchetypeId, { label: string; who: string }>>(G, 'ARCHETYPES')
export const HOSPITALS = gated<Hospital[]>(G, 'HOSPITALS')
export const SWATCHES = gated<string[]>(G, 'SWATCHES')
export const GOVERNANCE = gated<GovRule[]>(G, 'GOVERNANCE')
export const RECORDS = gated<Record<string, { flexible: string[]; locked: string[] }>>(G, 'RECORDS')
export const PRESETS = gated<Preset[]>(G, 'PRESETS')
export const PATIENTS = gated<{ bed: string; name: string; risk: 'High' | 'Medium' | 'Low'; status: string }[]>(G, 'PATIENTS')
export const DOCTOR = gated<{ name: string; role: string; where: string; action: string }>(G, 'DOCTOR')
export const SAMPLE_COLOURS = gated<{ drift: Fork[]; masters: string[]; invent: string; onboardingStart: string }>(G, 'SAMPLE_COLOURS')
export const TEXT = gated<{ LONG_NAME: string; ALERT: string }>(G, 'TEXT')
export const XRAY = gated<{
  intro: string
  elements: { id: string; label: string }[]
  notes: { status: string; shared: string; text: string; literal: string; plain: string; skipped: string; skippedShared: string }
  reasons: { ring: string; fork: string }
}>(G, 'XRAY')
export const FIELD = gated<{ intro: string; legend: { pass: string; large: string; fail: string; gamut: string }; keys: string; others: string; refused: string }>(G, 'FIELD')
export const DRIFT = gated<{ caption: string; legend: string }>(G, 'DRIFT')
