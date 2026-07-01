'use client'

/*
 * InvitraceCover — chrome manifesto card.
 * Designed at 900×700px native, zoomed to 0.42 in the grid card.
 * Top ~619px of 700px is visible in the preview zone.
 */

export function InvitraceCover({ shimmerTick = 0 }: { shimmerTick?: number }) {
  return (
    <div style={{ position: 'relative', width: 900, height: 700, overflow: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,500;1,9..144,600&family=IBM+Plex+Mono:wght@400;500&display=swap');

        @keyframes inv-chrome-drift {
          0%,100% { background-position: 20% 30% }
          50%      { background-position: 80% 70% }
        }
        @keyframes inv-chrome-shine {
          0%   { background-position: 0% 50% }
          100% { background-position: 150% 50% }
        }
        @keyframes inv-card-shimmer {
          from { transform: translateX(-150%) }
          to   { transform: translateX(150%) }
        }

        .inv-cbase {
          display: block;
          background: linear-gradient(125deg,
            #fdfcff 0%, #cfc9dc 14%, #8b84a3 30%,
            #5b5470 42%, #fdfcff 54%, #8b84a3 68%,
            #c9c3da 82%, #fdfcff 100%);
          background-size: 220% 220%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: inv-chrome-drift 11s ease-in-out infinite;
        }
        .inv-cshine {
          position: absolute;
          inset: 0;
          display: block;
          background: linear-gradient(115deg,
            transparent 38%, rgba(255,255,255,.95) 50%, transparent 62%);
          background-size: 260% 260%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          mix-blend-mode: overlay;
          animation: inv-chrome-shine 4.2s ease-in-out infinite;
          pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .inv-cbase, .inv-cshine { animation: none !important; }
        }
      `}</style>

      {/* ── Background ── */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        inset:    0,
        background: `
          radial-gradient(90% 70% at 14% -6%, rgba(255,255,255,.88), transparent 58%),
          radial-gradient(65% 55% at 102% 108%, rgba(140,120,185,.38), transparent 58%),
          linear-gradient(160deg, #f6f4fa 0%, #e6e1f0 55%, #ede8f5 100%)
        `,
      }} />

      {/* Noise texture */}
      <div aria-hidden="true" style={{
        position:            'absolute',
        inset:               0,
        opacity:             0.042,
        mixBlendMode:        'multiply' as const,
        backgroundImage:     `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        pointerEvents:       'none',
      }} />

      {/* ── Main content ── */}
      <div style={{
        position:       'relative',
        zIndex:         1,
        height:         '100%',
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
        padding:        '0 88px',
        gap:            '1.4rem',
      }}>

        {/* Overline */}
        <span style={{
          fontFamily:    "'IBM Plex Mono', monospace",
          fontSize:      '0.88rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase' as const,
          color:         '#7b7488',
          marginBottom:  '-0.2rem',
        }}>
          Federated design system
        </span>

        {/* Chrome headline */}
        <div style={{
          position:  'relative',
          display:   'block',
          lineHeight: 1.0,
        }}>
          <span style={{
            fontFamily:    "'Fraunces', serif",
            fontWeight:    700,
            fontSize:      '5.4rem',
            letterSpacing: '-0.02em',
            lineHeight:    1.0,
            position:      'relative',
            display:       'block',
            userSelect:    'none' as const,
          }}>
            <span className="inv-cbase">Same system.</span>
            <span className="inv-cshine" aria-hidden="true">Same system.</span>
          </span>
        </div>

        {/* Italic subtitle */}
        <div style={{
          fontFamily:    "'Fraunces', serif",
          fontStyle:     'italic',
          fontWeight:    500,
          fontSize:      '3.2rem',
          letterSpacing: '-0.01em',
          lineHeight:    1.1,
          color:         '#9b93b0',
          marginTop:     '-0.5rem',
        }}>
          Different{' '}
          <b style={{ fontStyle: 'normal', fontWeight: 600, color: '#6a5f8c' }}>skin.</b>
        </div>

        {/* Arch swatch row — data markers, not decoration */}
        <div style={{
          display:    'flex',
          gap:        '10px',
          marginTop:  '2.4rem',
          alignItems: 'center',
        }}>
          {[
            { token: 'var(--arch-medium)',    name: 'District'  },
            { token: 'var(--arch-large)',     name: 'Teaching'  },
            { token: 'var(--arch-specialty)', name: 'Specialty' },
            { token: 'var(--arch-root)',      name: 'Root'      },
          ].map((a, i) => (
            <div key={a.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{
                width:        52,
                height:       10,
                borderRadius: 99,
                background:   a.token,
                opacity:      0.72,
                position:     'relative',
                overflow:     'hidden',
              }}>
                {/* per-swatch shimmer on hover */}
                {shimmerTick > 0 && (
                  <div
                    key={shimmerTick}
                    aria-hidden="true"
                    style={{
                      position:   'absolute',
                      inset:      0,
                      transform:  'translateX(-150%)',
                      background: 'linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.65) 50%, transparent 80%)',
                      animation:  `swatch-shimmer 0.38s cubic-bezier(0.16, 1, 0.3, 1) ${i * 60}ms forwards`,
                    }}
                  />
                )}
              </div>
              <span style={{
                fontFamily:    "'IBM Plex Mono', monospace",
                fontSize:      '0.58rem',
                letterSpacing: '0.04em',
                color:         '#9d95b2',
                whiteSpace:    'nowrap' as const,
              }}>
                {a.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Full-card shimmer on hover — sweeps once across the whole surface ── */}
      {shimmerTick > 0 && (
        <div
          key={`shimmer-${shimmerTick}`}
          aria-hidden="true"
          style={{
            position:      'absolute',
            inset:         0,
            zIndex:        3,
            pointerEvents: 'none',
            overflow:      'hidden',
          }}
        >
          <div style={{
            position:   'absolute',
            inset:      0,
            transform:  'translateX(-150%)',
            background: 'linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0.14) 55%, transparent 75%)',
            animation:  'inv-card-shimmer 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }} />
        </div>
      )}

    </div>
  )
}
