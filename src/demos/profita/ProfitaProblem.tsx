'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { P } from './tokens'

// ── content ──────────────────────────────────────────────────────────
type Block =
  | { t: 'lead' | 'drop' | 'p' | 'callout'; x: string }
  | { t: 'rule' }
  | { t: 'h'; x: string }
  | { t: 'quote'; x: string; by?: string }
  | { t: 'list'; items: string[] }
  | { t: 'ev'; items: [string, string][] }

const BLOCKS: Block[] = [
  { t: 'lead', x: 'LH Bank wanted to democratise mutual fund investment in Thailand. The opportunity was real -- millions of potential investors existed, but the category spoke entirely to people who already knew what an NAV was. Everyone else felt locked out.' },
  { t: 'p',    x: 'Our challenge: design an experience where someone who has never invested can take their first step in under five minutes -- and feel confident doing it.' },
  { t: 'rule' },
  { t: 'drop', x: `So we started where the money wasn't -- with the people who never opened the app twice.` },
  { t: 'p',    x: `The first thing we did wasn't design anything. We sat with real customers and watched them try to invest. Not in a lab, not with a script -- we handed them a phone and asked them to put in their first 1,000 baht. What we saw was uncomfortable.` },
  { t: 'p',    x: `They didn't fail because the buttons were in the wrong place. They failed earlier than that. A woman in her thirties opened the fund list, scrolled for a while, and quietly said, "I don't think this is for me." Then she handed the phone back. She hadn't tapped anything wrong. She just didn't believe she belonged there.` },
  { t: 'callout', x: `The barrier wasn't the interface -- it was confidence. The app wasn't rejecting people. It was letting them reject themselves.` },
  { t: 'p',    x: 'Every unexplained term -- "NAV," "risk level 5," "front-end fee" -- quietly confirmed the assumption that investing was for someone smarter or richer than them.' },
  { t: 'h',    x: 'What the interviews actually told us' },
  { t: 'p',    x: 'We talked to two kinds of people, and they wanted opposite things. Newcomers needed permission and a hand to hold: fewer choices, plain words, a clear "just start here." Experienced investors needed the exact opposite: speed, control, and no one slowing them down. The old app tried to serve both by serving neither -- too technical for beginners, too clumsy for pros.' },
  { t: 'list', items: [
    'Newcomers → reduce choices, explain in plain language, default the scary decisions',
    'Experts → surface search, recent funds, and one-tap repeat orders',
  ]},
  { t: 'p',    x: `The insight that reframed everything was simple. We weren't designing a tool for investing. We were designing a way for someone to feel capable of it. Usability was table stakes; the real job was emotional -- turning "this isn't for me" into "okay, I can do this."` },
  { t: 'h',    x: 'How we redefined the problem' },
  { t: 'p',    x: 'We stopped measuring ourselves by features and started measuring two behaviours instead: how long it took a first-timer to place their first investment, and how many people dropped out right before confirming. Those two numbers told the truth in a way a feature list never could.' },
  { t: 'quote', x: `Help someone who has never invested reach their first confident "confirm" -- in under five minutes, without needing to understand a single piece of jargon to get there.`, by: 'The brief we actually designed against' },
  { t: 'p',    x: 'Everything we built after that had to earn its place against that one sentence.' },
  { t: 'ev',   items: [['Time to first invest', '< 5 min'], ['Audiences, one screen', '2'], ['Jargon required', '0']] },
]

// ── block renderer ────────────────────────────────────────────────────
function renderBlock(b: Block, i: number) {
  const s = {
    lead:    { fontSize: '1.18rem', lineHeight: 1.65, color: '#2b3542', margin: 0 },
    drop:    { fontFamily: "'Instrument Serif',Georgia,serif", fontSize: '1.5rem', lineHeight: 1.35, color: '#12233f', margin: 0 },
    p:       { fontSize: '1rem', color: '#333b47', lineHeight: 1.8, margin: '14px 0 0' },
    callout: { margin: '24px 0', padding: '18px 22px', borderRadius: 12, background: '#faf9f6', border: '1px solid #efe9db', fontFamily: "'Instrument Serif',Georgia,serif", fontStyle: 'italic' as const, fontSize: '1.2rem', lineHeight: 1.5, color: '#12233f' },
  }

  switch (b.t) {
    case 'lead':    return <p key={i} style={s.lead} dangerouslySetInnerHTML={{ __html: b.x.replace(/--/g, '—') }} />
    case 'drop':    return <p key={i} style={s.drop} dangerouslySetInnerHTML={{ __html: b.x.replace(/--/g, '—') }} />
    case 'p':       return <p key={i} style={s.p}    dangerouslySetInnerHTML={{ __html: b.x.replace(/--/g, '—') }} />
    case 'callout': return <p key={i} style={s.callout} dangerouslySetInnerHTML={{ __html: b.x.replace(/--/g, '—') }} />
    case 'rule':    return <hr key={i} style={{ border: 'none', borderTop: '1px solid #eef0f3', margin: '30px 0 4px' }} />
    case 'h':       return <h4 key={i} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: '#b98f3c', margin: '34px 0 6px' }}>{b.x}</h4>
    case 'quote':   return (
      <blockquote key={i} style={{ margin: '28px 0', padding: '4px 0 4px 22px', borderLeft: '3px solid #d3ac57', fontFamily: "'Instrument Serif',Georgia,serif", fontStyle: 'italic', fontSize: '1.35rem', lineHeight: 1.45, color: '#12233f' }}>
        <span dangerouslySetInnerHTML={{ __html: b.x.replace(/--/g, '—') }} />
        {b.by && <span style={{ display: 'block', fontFamily: "'IBM Plex Mono',monospace", fontStyle: 'normal', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: '#8a93a0', marginTop: 12 }}>{b.by}</span>}
      </blockquote>
    )
    case 'list': return (
      <ul key={i} style={{ margin: '14px 0', listStyle: 'none', padding: 0 }}>
        {b.items.map((item, j) => (
          <li key={j} style={{ position: 'relative', paddingLeft: 22, color: '#333b47', lineHeight: 1.7, marginTop: 9 }}>
            <span style={{ position: 'absolute', left: 0, color: '#b98f3c' }}>&mdash;</span>
            {item}
          </li>
        ))}
      </ul>
    )
    case 'ev': return (
      <div key={i} style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 30, margin: '28px 0 6px', padding: '22px 24px', border: '1px solid #ececec', borderRadius: 12, background: '#faf9f6' }}>
        {b.items.map(([label, value], j) => (
          <div key={j}>
            <div style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: '2rem', color: '#b98f3c', lineHeight: 1 }}>{value}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '.07em', textTransform: 'uppercase' as const, color: '#8a93a0', marginTop: 5 }}>{label}</div>
          </div>
        ))}
      </div>
    )
    default: return null
  }
}

// ── modal ─────────────────────────────────────────────────────────────
function ProcessModal({ onClose }: { onClose: () => void }) {
  const ease = 'cubic-bezier(.16,1,.3,1)'

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         400,
        display:        'flex',
        alignItems:     'flex-start',
        justifyContent: 'center',
        padding:        '5vh 16px',
        background:     'rgba(6,13,26,.82)',
        backdropFilter: 'blur(6px)',
        animation:      `pmFadeIn .35s ${ease} forwards`,
      }}
      role="dialog"
      aria-modal="true"
    >
      <style>{`
        @keyframes pmFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes pmSlideUp { from{transform:translateY(28px) scale(.985);opacity:0} to{transform:none;opacity:1} }
        .pm-dialog-inner::-webkit-scrollbar{width:8px}
        .pm-dialog-inner::-webkit-scrollbar-track{background:#fff;border-radius:0 16px 16px 0}
        .pm-dialog-inner::-webkit-scrollbar-thumb{background:#d7dbe0;border-radius:4px}
      `}</style>

      <div
        className="pm-dialog-inner"
        style={{
          position:   'relative',
          background: '#fff',
          color:      '#1f2733',
          borderRadius: 16,
          maxWidth:   640,
          width:      '100%',
          maxHeight:  '90vh',
          overflowY:  'auto',
          boxShadow:  '0 44px 110px -30px rgba(0,0,0,.55)',
          animation:  `pmSlideUp .5s ${ease} forwards`,
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position:   'absolute',
            top:        22,
            right:      24,
            width:      36,
            height:     36,
            borderRadius: '50%',
            border:     '1px solid #e2e5ea',
            background: '#fff',
            color:      '#55606e',
            fontSize:   15,
            cursor:     'pointer',
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex:     3,
          }}
        >✕</button>

        {/* Sticky header */}
        <div style={{
          position:     'sticky',
          top:          0,
          background:   'rgba(255,255,255,.94)',
          backdropFilter: 'blur(6px)',
          padding:      'clamp(24px,5vw,32px) 42px 18px',
          borderBottom: '1px solid #eef0f3',
          zIndex:       2,
        }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#b98f3c' }}>
            01 · The problem
          </div>
          <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontWeight: 400, fontSize: 'clamp(1.7rem,4.5vw,2.5rem)', lineHeight: 1.12, color: '#12233f', margin: '8px 0 0', maxWidth: '26ch' }}>
            Most people who needed to invest <em>didn't believe they could</em>
          </h2>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '.05em', color: '#8a93a0', marginTop: 14 }}>
            Lead Product Designer · Discovery · 4 min read
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 'clamp(20px,5vw,24px) 42px 46px' }}>
          <div style={{ maxWidth: '60ch' }}>
            {BLOCKS.map((b, i) => renderBlock(b, i))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── section ───────────────────────────────────────────────────────────
export function ProfitaProblem() {
  const [open, setOpen] = useState(false)

  return (
    <section
      id="problem"
      className="prof-animate"
      style={{ padding: 'clamp(4rem,9vw,7rem) 0', fontFamily: P.font.body }}
    >
      <div className="prof-wrap">
        <p className="prof-kick">01 · The problem</p>

        <h2 style={{
          fontFamily:    P.font.disp,
          fontWeight:    400,
          fontSize:      'clamp(1.8rem,4vw,3.2rem)',
          lineHeight:    1.12,
          letterSpacing: '-.02em',
          color:         P.color.on,
          maxWidth:      '22ch',
          marginBottom:  '1.4rem',
        }}>
          Most people who needed to invest{' '}
          <em style={{ fontStyle: 'italic', color: P.color.gold }}>
            didn&rsquo;t believe they could.
          </em>
        </h2>

        <div style={{ maxWidth: '58ch' }}>
          <p style={{ color: P.color.onMut, lineHeight: 1.72, marginBottom: '1rem' }}>
            LH Bank wanted to democratise mutual fund investment in Thailand. The opportunity
            was real -- millions of potential investors existed, but the category spoke entirely
            to people who already knew what an NAV was. Everyone else felt locked out.
          </p>
          <p style={{ color: P.color.onMut, lineHeight: 1.72, marginBottom: '2rem' }}>
            Our challenge: design an experience where{' '}
            <strong style={{ color: P.color.on }}>someone who has never invested</strong>{' '}
            can take their first step in under five minutes -- and feel confident doing it.
          </p>

          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              fontFamily:    P.font.mono,
              fontSize:      '.72rem',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color:         P.color.gold,
              background:    P.alpha.gold10,
              border:        `1px solid ${P.alpha.gold35}`,
              borderRadius:  8,
              padding:       '.5rem 1rem',
              cursor:        'pointer',
              display:       'inline-flex',
              alignItems:    'center',
              gap:           '.5em',
              transition:    `background .25s ${P.ease.expo}`,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = P.alpha.gold20)}
            onMouseLeave={e => (e.currentTarget.style.background = P.alpha.gold10)}
          >
            <span>+</span> Behind this
          </button>
        </div>
      </div>

      {open && <ProcessModal onClose={() => setOpen(false)} />}
    </section>
  )
}
