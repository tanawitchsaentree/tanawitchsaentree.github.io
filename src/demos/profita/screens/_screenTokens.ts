// App-screen palette — matches the HTML mockup (:root vars)
// Used only inside src/demos/profita/screens/
// Logical screen width: 300px. Height: 300 * (19.5/9) ≈ 650px.

export const SC = {
  // Core
  navy:    '#2f4459',
  navyD:   '#26384a',
  navyDD:  '#1f2f3f',
  navyL:   '#3c5470',
  gold:    '#c2a256',
  goldL:   '#d8c185',
  goldCard:'#cdb26c',
  paper:   '#f3f4f6',
  white:   '#ffffff',
  ink:     '#2b3d4f',
  grey:    '#8b94a0',
  greyL:   '#c4cad2',
  green:   'var(--signal-ok)',
  red:     'var(--signal-danger)',
  pink:    '#e6c9cd',

  // Portfolio allocation series — shared by the donut chart and its legend/list
  allocDiy:        '#5cb37f',
  allocRetirement: '#8a6fc0',
  allocTravel:     '#d3ac57',

  // Fonts
  ui:   "'Plus Jakarta Sans', system-ui, sans-serif",
  mono: "'IBM Plex Mono', monospace",
} as const

// Logical dimensions — design at 300×650, frame scales it down
export const SW = 300   // logical screen width
export const SH = 650   // logical screen height = SW * 19.5/9

// StatusBar — shared across all screens (no status bar; PhoneFrame provides the notch)
// Screens should NOT include a status bar row.

// Helpers
export function px(n: number) { return n + 'px' }

// A plain horizontal divider
export const divider = {
  height: 1,
  background: '#eef0f3',
  margin: '0',
} as const
