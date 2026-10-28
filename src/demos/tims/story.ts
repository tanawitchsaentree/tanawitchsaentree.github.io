// The Tims page follows one invented order from the speaker to the window.
// Each section is a "moment"; the ticket pinned beside the page changes as moments become active.
// The marker is a position on the 40-second window, a story beat, never a measurement.

export const WINDOW = 40

export type Zone = 'fresh' | 'late' | 'done'

export type Line = { text: string; custom?: boolean }

export type Beat = {
  /** Ticket is shown while this beat is active. */
  show: boolean
  /** Where the marker sits on the 0 to 40 ruler. */
  at: number
  zone: Zone
  status: string
  note: string
  lines: Line[]
  /** The large becomes a medium and is struck through until the undo. */
  changed: boolean
  /** The first PRESET_LINES lines are bracketed as one preset tap. */
  preset: boolean
  stamp: string
}

export const PRESET_LINES = 4

const ORDER: Line[] = [
  { text: 'Large' },
  { text: 'Coffee' },
  { text: 'Cream ×2' },
  { text: 'Sugar ×2' },
  { text: 'Extra hot', custom: true },
  { text: 'Timbits ×10', custom: true },
]

const base: Beat = {
  show: true, at: 0, zone: 'fresh', status: 'Fresh', note: '',
  lines: ORDER, changed: false, preset: false, stamp: '',
}

// Index = section moment: 0 hero, 1 counter, 2 problem, 3 idea, 4 demo, 5 real orders, 6 fixed, 7 learned, 8 receipt.
export const BEATS: Beat[] = [
  { ...base, show: false },
  { ...base, at: 7,  status: 'Ringing in',    note: 'Seven cars are waiting behind it.' },
  { ...base, at: 31, zone: 'late', status: 'Getting late', note: 'The customer changed their mind.', changed: true },
  { ...base, at: 31, zone: 'late', status: 'Getting late', note: 'One tap covers the usual part.', changed: true, preset: true },
  { ...base, show: false },
  { ...base, at: 11, status: 'Fresh', note: 'Same order. Twenty regulars to test it on.', preset: true },
  { ...base, at: 14, status: 'Fresh', note: 'Large to medium and back, with undo.', changed: false, preset: true },
  { ...base, at: 22, zone: 'done', status: 'Out the window', note: 'The car pulls away.', preset: true, stamp: 'Served' },
  { ...base, show: false },
]

export const CAR = { header: 'Drive-thru · 8:02 a.m.', car: 'Car 1 of 8' } as const
export const DISCLAIMER = 'Illustrated order. The marker shows the story, not a measurement.'
