// Invitrace case study. All story text, rules and sample data live in
// content/gated/invitrace.json and ship only as an encrypted blob (scripts/encrypt-gated.mjs).
// These exports are live views that read the decrypted blob at render time (src/lib/gated.ts).
import { gated } from '@/lib/gated'
import type { ArchetypeId, GovRule, Hospital, Preset } from './model'

const G = 'invitrace'
type Section = { title: string; lead: string; body: string[] }

export const HERO = gated<{ eyebrow: string; title: string; intro: string; sample: string }>(G, 'HERO')
export const SECTIONS = gated<{
  problem: Section & { drifted: string; consolidated: string }
  tiers: Section & { contrastRule: string }
  governance: Section & { whyTitle: string; why: string[] }
  rot: Section & { kinds: Record<'detach' | 'copy' | 'invent' | 'prop', { label: string; name: string; why: string; short: string }>; principle: string }
  slots: Section & { forkWhy: string }
  edges: Section & { longRule: string; emptyRule: string }
  failed: Section & { demoNote: string }
  decisions: Section
  views: Section
  onboarding: Section
  log: Section
  limits: string
}>(G, 'SECTIONS')
export const ARCHETYPES = gated<Record<ArchetypeId, { label: string; who: string }>>(G, 'ARCHETYPES')
export const HOSPITALS = gated<Hospital[]>(G, 'HOSPITALS')
export const SWATCHES = gated<string[]>(G, 'SWATCHES')
export const GOVERNANCE = gated<GovRule[]>(G, 'GOVERNANCE')
export const RECORDS = gated<Record<string, { flexible: string[]; locked: string[] }>>(G, 'RECORDS')
export const PRESETS = gated<Preset[]>(G, 'PRESETS')
export const PATIENTS = gated<{ bed: string; name: string; risk: 'High' | 'Medium' | 'Low'; status: string }[]>(G, 'PATIENTS')
export const DOCTOR = gated<{ name: string; role: string; where: string; action: string }>(G, 'DOCTOR')
export const DECISIONS = gated<{ title: string; problem: string; options: { key: string; text: string }[]; chosen: string; rationale: string; cost: string }[]>(G, 'DECISIONS')
export const SAMPLE_COLOURS = gated<{ drift: { pad: string; r: number; bg: string; rot: number; x: number; y: number }[]; masters: string[]; invent: string; onboardingStart: string }>(G, 'SAMPLE_COLOURS')
export const TEXT = gated<{ LONG_NAME: string; ALERT: string }>(G, 'TEXT')
