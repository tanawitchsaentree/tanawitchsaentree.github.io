'use client'

import { useEffect, useRef } from 'react'
import { P } from './tokens'
import { ProfitaPhoneScreen, PROFITA_PHONE_W, PROFITA_PHONE_H } from './ProfitaPhoneScreen'
import { useContainerWidth } from './useContainerWidth'

function usePhoneSizes(vw: number) {
  if (vw === 0) return { centerW: 240, sideW: 194 }
  if (vw < 400)  return { centerW: Math.round(vw * 0.62), sideW: Math.round(vw * 0.46) }
  if (vw < 560)  return { centerW: Math.round(vw * 0.55), sideW: Math.round(vw * 0.42) }
  if (vw < 768)  return { centerW: Math.round(vw * 0.42), sideW: Math.round(vw * 0.33) }
  return { centerW: 240, sideW: 194 }
}

type Tilt = 'left' | 'center' | 'right'

function HeroPhone({ screen, scale, tilt }: {
  screen: import('./ProfitaPhoneScreen').ScreenName
  scale: number
  tilt: Tilt
}) {
  const w = Math.round(PROFITA_PHONE_W * scale)
  const h = Math.round(PROFITA_PHONE_H * scale)

  return (
    <div style={{
      position:  'relative',
      width:     w,
      height:    h,
      flexShrink:0,
      opacity:   tilt === 'center' ? 1 : 0.82,
      zIndex:    tilt === 'center' ? 2 : 1,
    }}>
      <div style={{
        position:        'absolute',
        top:             0,
        left:            0,
        transform:       `scale(${scale})`,
        transformOrigin: 'top left',
        width:           PROFITA_PHONE_W,
        height:          PROFITA_PHONE_H,
      }}>
        <ProfitaPhoneScreen screen={screen} />
      </div>
    </div>
  )
}

const STATS = [
  { label: 'Award',  value: 'Best App for CX 2023' },
  { label: 'Role',   value: 'Senior UX / UI Designer' },
  { label: 'Client', value: 'Robowealth × LH Bank' },
  { label: 'Year',   value: '2020' },
] as const

export function ProfitaHero() {
  const containerRef = useRef<HTMLElement>(null)
  const vw = useContainerWidth()
  const { centerW, sideW } = usePhoneSizes(vw)
  const centerSC = centerW / PROFITA_PHONE_W
  const sideSC   = sideW   / PROFITA_PHONE_W

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width  / 2
      const cy = rect.top  + rect.height / 2
      const dx = (e.clientX - cx) / rect.width   // -0.5 → +0.5
      const dy = (e.clientY - cy) / rect.height

      const phones = el.querySelectorAll<HTMLDivElement>('[data-parallax]')
      phones.forEach((ph, i) => {
        const depth = i === 1 ? 1.4 : 0.8
        const x = dx * 18 * depth
        const y = dy * 10 * depth
        ph.style.transform = `${ph.dataset.baseTransform ?? ''} translate(${x}px,${y}px)`
      })
    }

    const onLeave = () => {
      const el = containerRef.current
      if (!el) return
      el.querySelectorAll<HTMLDivElement>('[data-parallax]').forEach(ph => {
        ph.style.transform = ph.dataset.baseTransform ?? ''
      })
    }

    window.addEventListener('mousemove', onMove)
    containerRef.current?.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <>
      {/* Float keyframe injected once */}
      <style>{`
        @keyframes profita-float {
          from { translate: 0 0px;   }
          to   { translate: 0 -14px; }
        }
      `}</style>

      <header
        ref={containerRef}
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
        <div aria-hidden="true" style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}>
          <div style={{
            position:     'absolute', top:'-10%', right:'-5%',
            width:        '55vw',     height:'55vw',
            borderRadius: '50%',
            background:   `radial-gradient(circle, ${P.alpha.gold14} 0%, transparent 70%)`,
          }} />
          <div style={{
            position:     'absolute', bottom:'5%', left:'-8%',
            width:        '40vw',     height:'40vw',
            borderRadius: '50%',
            background:   `radial-gradient(circle, ${P.alpha.navy700_70} 0%, transparent 70%)`,
          }} />
        </div>

        <div className="prof-wrap" style={{ position:'relative', zIndex:1 }}>

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
            <em style={{ fontStyle:'italic', color:P.color.gold }}>
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
            <strong style={{ color:P.color.gold, fontWeight:600 }}>
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
            display:        'flex',
            gap:            'clamp(.75rem,2.5vw,1.5rem)',
            alignItems:     'flex-end',
            justifyContent: 'center',
            marginBottom:   '3.5rem',
            perspective:    '1200px',
          }}>
            {/* Left — float offset 0.4s */}
            <div
              data-parallax="true"
              data-base-transform="rotateY(16deg) rotateX(2deg)"
              style={{
                transform:  'rotateY(16deg) rotateX(2deg)',
                transition: 'transform .12s cubic-bezier(0.22,1,0.36,1)',
                animation:  'profita-float 5.2s cubic-bezier(0.45,0,0.55,1) 0.4s infinite alternate',
              }}
            >
              <HeroPhone screen="feed"      scale={sideSC}   tilt="left"   />
            </div>

            {/* Center — no delay, raised */}
            <div
              data-parallax="true"
              data-base-transform="rotateX(1deg) translateY(-16px)"
              style={{
                transform:  'rotateX(1deg) translateY(-16px)',
                transition: 'transform .1s cubic-bezier(0.22,1,0.36,1)',
                animation:  'profita-float 4.8s cubic-bezier(0.45,0,0.55,1) 0s infinite alternate',
              }}
            >
              <HeroPhone screen="robo"      scale={centerSC} tilt="center" />
            </div>

            {/* Right — float offset 0.8s */}
            <div
              data-parallax="true"
              data-base-transform="rotateY(-16deg) rotateX(2deg)"
              style={{
                transform:  'rotateY(-16deg) rotateX(2deg)',
                transition: 'transform .12s cubic-bezier(0.22,1,0.36,1)',
                animation:  'profita-float 5.6s cubic-bezier(0.45,0,0.55,1) 0.8s infinite alternate',
              }}
            >
              <HeroPhone screen="portfolio" scale={sideSC}   tilt="right"  />
            </div>
          </div>

          {/* Stats grid */}
          <div className="prof-grid-4" style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap:                 '1px',
            background:          P.alpha.line,
            border:              `1px solid ${P.alpha.line}`,
            borderRadius:        14,
            overflow:            'hidden',
            maxWidth:            640,
            margin:              '0 auto',
          }}>
            {STATS.map(({ label, value }) => (
              <div key={label} style={{ background:P.alpha.white06, padding:'1.1rem 1.2rem' }}>
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
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginTop:'3rem' }}>
            <div className="prof-scrollcue" style={{ width:6, height:6, borderRadius:'50%', background:P.color.gold }} />
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
    </>
  )
}
