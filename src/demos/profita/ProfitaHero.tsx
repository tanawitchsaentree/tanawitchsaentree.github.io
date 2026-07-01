'use client'

import { P } from './tokens'
import { PhoneFrame } from './PhoneFrame'

const STATS = [
  { label: 'Award',  value: 'Best App for CX 2023' },
  { label: 'Role',   value: 'Senior UX / UI Designer' },
  { label: 'Client', value: 'Robowealth × LH Bank' },
  { label: 'Year',   value: '2020' },
] as const

export function ProfitaHero() {
  return (
    <header
      id="hero"
      className="prof-animate"
      style={{
        position:   'relative',
        padding:    'clamp(9rem,18vw,14rem) 0 clamp(5rem,10vw,8rem)',
        overflow:   'hidden',
        fontFamily: P.font.body,
      }}
    >
      {/* Glow blobs */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position:  'absolute', top: '-10%', right: '-5%',
          width:     '55vw', height: '55vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${P.alpha.gold14} 0%, transparent 70%)`,
        }} />
        <div style={{
          position:  'absolute', bottom: '5%', left: '-8%',
          width:     '40vw', height: '40vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(24,47,82,.7) 0%, transparent 70%)`,
        }} />
      </div>

      <div className="prof-wrap" style={{ position: 'relative', zIndex: 1 }}>

        {/* Eyebrow */}
        <p className="prof-kick">The result</p>

        {/* Headline */}
        <h1 style={{
          fontFamily:    P.font.disp,
          fontWeight:    400,
          fontSize:      'clamp(2.4rem,6vw,5rem)',
          lineHeight:    1.07,
          letterSpacing: '-.02em',
          color:         P.color.on,
          maxWidth:      '18ch',
          marginBottom:  '1.5rem',
        }}>
          Investing,{' '}
          <em style={{ fontStyle: 'italic', color: P.color.gold }}>
            for people who&rsquo;d never invested.
          </em>
        </h1>

        {/* Award line */}
        <p style={{
          fontFamily:    P.font.mono,
          fontSize:      '.78rem',
          letterSpacing: '.08em',
          color:         P.color.goldSoft,
          maxWidth:      '54ch',
          lineHeight:    1.6,
          marginBottom:  '1.4rem',
        }}>
          Recognised as{' '}
          <strong style={{ color: P.color.gold, fontWeight: 600 }}>
            Best App for Customer Experience
          </strong>
          {' '}— Retail Banker International Asia Trailblazer Awards, 2023.
        </p>

        {/* Lead */}
        <p style={{
          fontSize:     '1.08rem',
          color:        P.color.onMut,
          maxWidth:     '52ch',
          lineHeight:   1.7,
          marginBottom: '3rem',
        }}>
          Profita is the mutual fund investment app I designed for Robowealth and LH Bank.
          Starting with 0 → 1, we built a product that made first-time investing feel safe,
          clear, and — eventually — natural.
        </p>

        {/* Phone trio */}
        <div style={{
          display:       'flex',
          gap:           'clamp(1rem,3vw,2rem)',
          alignItems:    'flex-end',
          justifyContent:'center',
          marginBottom:  '3.5rem',
          '--pw':        'clamp(120px,18vw,180px)',
        } as React.CSSProperties}>
          {/* Left phone — 3D tilt left */}
          <div style={{
            transform:       'rotateY(18deg) rotateX(3deg) translateY(12px)',
            transformOrigin: 'center bottom',
            opacity:         .85,
          }}>
            <PhoneFrame label="Feed" />
          </div>

          {/* Center phone — upright, slightly larger */}
          <div style={{
            '--pw':      'clamp(140px,20vw,200px)',
            transform:   'translateY(-8px)',
            zIndex:      2,
          } as React.CSSProperties}>
            <PhoneFrame label="Robo Advisor" />
          </div>

          {/* Right phone — 3D tilt right */}
          <div style={{
            transform:       'rotateY(-18deg) rotateX(3deg) translateY(12px)',
            transformOrigin: 'center bottom',
            opacity:         .85,
          }}>
            <PhoneFrame label="Portfolio" />
          </div>
        </div>

        {/* Stats grid */}
        <div style={{
          display:          'grid',
          gridTemplateColumns:'repeat(4,1fr)',
          gap:              '1px',
          background:       P.alpha.line,
          border:           `1px solid ${P.alpha.line}`,
          borderRadius:     14,
          overflow:         'hidden',
          maxWidth:         640,
        }}>
          {STATS.map(({ label, value }) => (
            <div key={label} style={{
              background: P.alpha.white06,
              padding:    '1.1rem 1.2rem',
            }}>
              <p style={{
                fontFamily:    P.font.mono,
                fontSize:      '.65rem',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color:         P.color.onFaint,
                margin:        '0 0 .4rem',
              }}>{label}</p>
              <p style={{
                fontFamily: P.font.body,
                fontWeight: 600,
                fontSize:   '.88rem',
                color:      P.color.on,
                margin:     0,
                lineHeight: 1.3,
              }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Scroll cue */}
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '.75rem',
          marginTop:  '3rem',
        }}>
          <div className="prof-scrollcue" style={{
            width:        6,
            height:       6,
            borderRadius: '50%',
            background:   P.color.gold,
          }} />
          <span style={{
            fontFamily:    P.font.mono,
            fontSize:      '.72rem',
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            color:         P.color.onFaint,
          }}>
            How we got there
          </span>
        </div>

      </div>
    </header>
  )
}
