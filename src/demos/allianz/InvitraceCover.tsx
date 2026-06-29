'use client'

/*
 * InvitraceCover — exploded design-system cover for the work grid card.
 * Shows floating component fragments + color tokens to communicate
 * "federated design system" at a glance.
 *
 * Designed at 900×700px — zoomed to 0.42 in the grid card, showing top ~620px.
 */

const ARCH = [
  { token: '--arch-medium',    name: 'District',  label: 'arch-medium'    },
  { token: '--arch-large',     name: 'Teaching',  label: 'arch-large'     },
  { token: '--arch-specialty', name: 'Specialty', label: 'arch-specialty' },
  { token: '--arch-root',      name: 'Root',      label: 'arch-root'      },
]

const TOKENS = [
  { label: '--spacing-sm',    value: '4px'   },
  { label: '--spacing-md',    value: '8px'   },
  { label: '--radius-lg',     value: '12px'  },
  { label: '--duration-base', value: '280ms' },
]

const BADGES = [
  { text: 'ROUTED',   signal: '--signal-ok'     },
  { text: 'FLAGGED',  signal: '--signal-warn'   },
  { text: 'REVIEWED', signal: '--arch-root'     },
]

// Thin card shell reused across fragments
function FragCard({
  children,
  rotate = 0,
  style = {},
}: {
  children: React.ReactNode
  rotate?: number
  style?: React.CSSProperties
}) {
  return (
    <div style={{
      position:     'absolute',
      background:   'var(--bg)',
      borderRadius: 12,
      border:       '1px solid var(--border)',
      boxShadow:    '0 2px 8px color-mix(in srgb, var(--fg) 7%, transparent), 0 1px 2px color-mix(in srgb, var(--fg) 4%, transparent)',
      transform:    `rotate(${rotate}deg)`,
      ...style,
    }}>
      {children}
    </div>
  )
}

// Eyebrow label inside fragment cards
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize:      10,
      fontWeight:    600,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color:         'var(--fg-subtle)',
      margin:        '0 0 10px 0',
      fontFamily:    "'League Spartan', sans-serif",
    }}>{children}</p>
  )
}

export function InvitraceCover() {
  return (
    <div style={{
      position:   'relative',
      width:      900,
      height:     700,
      background: 'var(--bg-elevated)',
      overflow:   'hidden',
      fontFamily: "'League Spartan', sans-serif",
    }}>

      {/* ── Frag 1: Archetype color palette — top-left, slight tilt ── */}
      <FragCard rotate={-3} style={{ top: 48, left: 56, padding: '20px 24px', width: 280 }}>
        <Label>Archetype Palette</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ARCH.map(a => (
            <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width:        32,
                height:       32,
                borderRadius: 8,
                background:   `var(${a.token})`,
                flexShrink:   0,
              }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', lineHeight: 1.2 }}>
                  {a.name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--fg-subtle)', letterSpacing: '0.06em', marginTop: 1 }}>
                  {a.token}
                </div>
              </div>
              <div style={{
                marginLeft:    'auto',
                fontSize:      9,
                color:         `var(${a.token})`,
                letterSpacing: '0.1em',
                fontWeight:    600,
                background:    `color-mix(in srgb, var(${a.token}) 12%, transparent)`,
                padding:       '2px 7px',
                borderRadius:  4,
              }}>
                {a.label.replace('arch-', '')}
              </div>
            </div>
          ))}
        </div>
      </FragCard>

      {/* ── Frag 2: Confidence bar — top-right, slight tilt other way ── */}
      <FragCard rotate={2.5} style={{ top: 36, left: 390, padding: '20px 24px', width: 340 }}>
        <Label>Confidence Gate</Label>
        {[
          { doc: 'INV-4421 · Invoice',      pct: 94, routing: 'ROUTED',  signal: '--signal-ok',   flag: false },
          { doc: 'CLM-0082 · Claim',        pct: 71, routing: 'ROUTED',  signal: '--signal-ok',   flag: false },
          { doc: 'LGL-1190 · Legal notice', pct: 38, routing: 'FLAGGED', signal: '--signal-warn', flag: true  },
          { doc: 'MED-3342 · Medical',      pct: 82, routing: 'ROUTED',  signal: '--signal-ok',   flag: false },
        ].map((row, i) => (
          <div key={i} style={{
            display:      'flex',
            alignItems:   'center',
            gap:          10,
            borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
            background:   row.flag ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
            margin:       row.flag ? '0 -8px' : '0',
            padding:      row.flag ? '7px 8px' : '7px 0',
            borderRadius: row.flag ? 4 : 0,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {row.doc}
              </div>
              <div style={{ marginTop: 4, height: 4, borderRadius: 2, background: 'var(--bg-muted)', overflow: 'hidden' }}>
                <div style={{
                  height:          '100%',
                  width:           `${row.pct}%`,
                  borderRadius:    2,
                  background:      row.flag ? 'var(--accent)' : 'var(--arch-medium)',
                  transition:      'width var(--duration-reveal) var(--ease-out-standard)',
                }} />
              </div>
            </div>
            <div style={{
              fontSize:      9,
              fontWeight:    600,
              color:         `var(${row.signal})`,
              background:    `color-mix(in srgb, var(${row.signal}) 12%, transparent)`,
              padding:       '2px 6px',
              borderRadius:  3,
              letterSpacing: '0.08em',
              flexShrink:    0,
            }}>
              {row.routing}
            </div>
          </div>
        ))}
      </FragCard>

      {/* ── Frag 3: Token chips — middle left ── */}
      <FragCard rotate={1.5} style={{ top: 310, left: 72, padding: '16px 20px', width: 220 }}>
        <Label>Design Tokens</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {TOKENS.map(t => (
            <div key={t.label} style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              padding:        '4px 8px',
              background:     'var(--bg-elevated)',
              borderRadius:   5,
              border:         '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 10, color: 'var(--fg-muted)', fontWeight: 500, letterSpacing: '0.04em' }}>
                {t.label}
              </span>
              <span style={{ fontSize: 10, color: 'var(--fg)', fontWeight: 700 }}>
                {t.value}
              </span>
            </div>
          ))}
        </div>
      </FragCard>

      {/* ── Frag 4: Badge cluster — middle right ── */}
      <FragCard rotate={-1.5} style={{ top: 300, left: 380, padding: '16px 20px', width: 200 }}>
        <Label>Status</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {BADGES.map(b => (
            <div key={b.text} style={{
              display:       'inline-flex',
              alignItems:    'center',
              gap:           6,
              padding:       '6px 12px',
              background:    `color-mix(in srgb, var(${b.signal}) 12%, transparent)`,
              borderRadius:  6,
              fontSize:      11,
              fontWeight:    700,
              letterSpacing: '0.1em',
              color:         `var(${b.signal})`,
            }}>
              <span style={{
                width:        6,
                height:       6,
                borderRadius: '50%',
                background:   `var(${b.signal})`,
                flexShrink:   0,
              }} />
              {b.text}
            </div>
          ))}
        </div>
      </FragCard>

      {/* ── Frag 5: Arch color swatches — bottom, partially cropped ── */}
      <FragCard rotate={-1} style={{ top: 480, left: 40, padding: '16px 20px', width: 560 }}>
        <Label>Hospital Archetypes</Label>
        <div style={{ display: 'flex', gap: 10 }}>
          {ARCH.map(a => (
            <div key={a.label} style={{ flex: 1 }}>
              <div style={{
                height:       56,
                borderRadius: 8,
                background:   `var(${a.token})`,
              }} />
              <div style={{ fontSize: 10, color: 'var(--fg-muted)', marginTop: 5, letterSpacing: '0.05em' }}>
                {a.name}
              </div>
            </div>
          ))}
        </div>
      </FragCard>

      {/* ── Frag 6: Type scale — bottom-right ── */}
      <FragCard rotate={3} style={{ top: 470, left: 650, padding: '16px 20px', width: 210 }}>
        <Label>Type Scale</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { size: 28, weight: 800, text: 'Aa',                   muted: false },
            { size: 20, weight: 700, text: 'Bb',                   muted: false },
            { size: 14, weight: 500, text: 'Cc Dd Ee',             muted: false },
            { size: 11, weight: 400, text: 'Fine print / eyebrow', muted: true  },
          ].map((t, i) => (
            <div key={i} style={{
              fontSize:      t.size,
              fontWeight:    t.weight,
              color:         t.muted ? 'var(--fg-subtle)' : 'var(--fg)',
              lineHeight:    1.2,
              letterSpacing: '-0.01em',
            }}>
              {t.text}
            </div>
          ))}
        </div>
      </FragCard>

    </div>
  )
}
