import { COPY, RESERVE, SECTIONS, type EdgeCase } from './data'

export type Decision = { kind: 'approved' | 'declined'; reason: string } | null

export type FileState = {
  /** Which scroll moment is active: 0 = hero, 1–7 = moments. Set by one IntersectionObserver. */
  active: number
  linked: boolean
  edge: EdgeCase | null
  dateShift: number
  amount: number
  reserve: number
  request: boolean
  decision: Decision
  flipped: boolean
  closeStep: number // 0–3; 3 = closed
}

export const INITIAL: FileState = {
  active: 0, linked: false, edge: null, dateShift: 0, amount: 0, reserve: RESERVE,
  request: false, decision: null, flipped: false, closeStep: 0,
}

export type Mark = 'ok' | 'warn' | 'danger' | null
/** One index tab on the file's edge. `label` is the short vertical tab text. */
export type Tab = { id: string; label: string; mark: Mark }

/** Everything attached to the claim at this point. The status never appears here. */
export function deriveTabs(s: FileState): Tab[] {
  const tabs: Tab[] = []
  if (s.active >= 1 && (s.linked || s.edge === 'expired')) {
    tabs.push({ id: 'policy', label: 'Policy', mark: s.edge === 'expired' && s.active < 2 ? 'danger' : 'ok' })
  }
  if (s.active >= 1 && s.edge === 'noCause') tabs.push({ id: 'cause', label: 'Cause', mark: null })
  if (s.active >= 1 && s.edge === 'location') tabs.push({ id: 'location', label: 'Location', mark: null })
  if (s.active >= 2) {
    for (const name of SECTIONS) {
      const review = name === COPY.dateSection && s.active >= 3 && s.dateShift !== 0
      tabs.push({ id: `section-${name}`, label: name === 'Business interruption' ? 'Interruption' : name, mark: review ? 'warn' : null })
    }
  }
  if (s.active >= 4) tabs.push({ id: 'payments', label: 'Payment', mark: s.amount > s.reserve ? 'warn' : s.amount > 0 ? 'ok' : null })
  if (s.active >= 5 && s.request) {
    tabs.push({ id: 'request', label: 'Rejection', mark: s.decision?.kind === 'approved' ? 'ok' : s.decision ? null : 'warn' })
  }
  return tabs
}

export const isSolid = (s: FileState) => s.active >= 2 || (s.linked && s.edge !== 'expired')
export const requestPending = (s: FileState) => s.request && !s.decision
export const closeReason = (s: FileState) => (s.decision?.kind === 'approved' ? 'Rejection' : 'Settled')
export const claimsWaiting = (s: FileState) => (requestPending(s) ? 1 : 0)
