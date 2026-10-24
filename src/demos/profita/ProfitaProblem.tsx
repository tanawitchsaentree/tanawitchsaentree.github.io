'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  { t: 'lead', x: 'LH Bank wanted more people in Thailand to invest in mutual funds. There were millions of potential investors, but every fund app was written for people who already knew what an NAV was. Everyone else felt locked out.' },
  { t: 'p',    x: 'We set out to design an app where someone who had never invested could make their first investment in under five minutes and feel confident doing it.' },
  { t: 'rule' },
  { t: 'drop', x: `So we started where the money wasn't. We started with the people who never opened the app twice.` },
  { t: 'p',    x: `Before designing anything, we sat with real customers and watched them try to invest. There was no lab and no script. We handed them a phone and asked them to put in their first 1,000 baht. It was uncomfortable to watch.` },
  { t: 'p',    x: `They didn't fail because the buttons were in the wrong place. They failed earlier than that. A woman in her thirties opened the fund list, scrolled for a while, and quietly said, "I don't think this is for me." Then she handed the phone back. She hadn't tapped anything wrong. She just didn't believe she belonged there.` },
  { t: 'callout', x: `Confidence was the barrier. The app let people rule themselves out before they tapped a single button.` },
  { t: 'p',    x: 'Terms like "NAV," "risk level 5," and "front-end fee" went unexplained. Each one quietly confirmed the assumption that investing was for someone smarter or richer than them.' },
  { t: 'h',    x: 'What the interviews actually told us' },
  { t: 'p',    x: 'We talked to two kinds of people, and they wanted opposite things. Newcomers wanted fewer choices in plain words, and a clear place to start. Experienced investors wanted speed and control, with nobody slowing them down. The old app tried to serve both groups. Beginners found it too technical and experts found it too slow.' },
  { t: 'list', items: [
    'Newcomers → reduce choices, explain in plain language, default the scary decisions',
    'Experts → surface search, recent funds, and one-tap repeat orders',
  ]},
  { t: 'p',    x: `That changed what we were designing. The app had to make someone feel capable of investing, and good usability alone would not do that. Our job was to get a person from "this isn't for me" to "okay, I can do this."` },
  { t: 'h',    x: 'How we redefined the problem' },
  { t: 'p',    x: 'We stopped counting features and tracked two behaviours instead. One was how long a first-timer took to place their first investment. The other was how many people dropped out right before confirming. Those two numbers showed us where people were getting stuck.' },
  { t: 'quote', x: `Help someone who has never invested reach their first confident "confirm" in under five minutes, without needing to understand a single piece of jargon to get there.`, by: 'The brief we actually designed against' },
  { t: 'p',    x: 'Everything we built after that had to earn its place against that one sentence.' },
  { t: 'ev',   items: [['Time to first invest', '< 5 min'], ['Audiences, one screen', '2'], ['Jargon required', '0']] },
]

// ── block renderer ────────────────────────────────────────────────────
function renderBlock(b: Block, i: number) {
  const s = {
    lead:    { fontSize: '1.18rem', lineHeight: 1.65, color: P.color.paperInk, margin: 0 },
    drop:    { fontFamily: P.font.disp, fontSize: '1.5rem', lineHeight: 1.35, color: P.color.navy900, margin: 0 },
    p:       { fontSize: '1rem', color: P.color.paperInk, lineHeight: 1.8, margin: '14px 0 0' },
    callout: { margin: '24px 0', padding: '18px 22px', borderRadius: 12, background: P.color.paperSurface, border: `1px solid ${P.color.paperLine}`, fontFamily: P.font.disp, fontStyle: 'italic' as const, fontSize: '1.2rem', lineHeight: 1.5, color: P.color.navy900 },
  }

  switch (b.t) {
    case 'lead':    return <p key={i} style={s.lead}>{b.x}</p>
    case 'drop':    return <p key={i} style={s.drop}>{b.x}</p>
    case 'p':       return <p key={i} style={s.p}>{b.x}</p>
    case 'callout': return <p key={i} style={s.callout}>{b.x}</p>
    case 'rule':    return <hr key={i} style={{ border: 'none', borderTop: `1px solid ${P.color.paperLine}`, margin: '30px 0 4px' }} />
    case 'h':       return <h4 key={i} style={{ fontFamily: P.font.mono, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: P.color.paperGold, margin: '34px 0 6px' }}>{b.x}</h4>
    case 'quote':   return (
      <blockquote key={i} style={{ margin: '28px 0', padding: '4px 0 4px 22px', borderLeft: `3px solid ${P.color.gold}`, fontFamily: P.font.disp, fontStyle: 'italic', fontSize: '1.35rem', lineHeight: 1.45, color: P.color.navy900 }}>
        <span>{b.x}</span>
        {b.by && <span style={{ display: 'block', fontFamily: P.font.mono, fontStyle: 'normal', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: P.color.paperMuted, marginTop: 12 }}>{b.by}</span>}
      </blockquote>
    )
    case 'list': return (
      <ul key={i} style={{ margin: '14px 0', listStyle: 'none', padding: 0 }}>
        {b.items.map((item, j) => (
          <li key={j} style={{ position: 'relative', paddingLeft: 22, color: P.color.paperInk, lineHeight: 1.7, marginTop: 9 }}>
            <span aria-hidden="true" style={{ position: 'absolute', left: 0, color: P.color.paperGold }}>&mdash;</span>
            {item}
          </li>
        ))}
      </ul>
    )
    case 'ev': return (
      <div key={i} style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 30, margin: '28px 0 6px', padding: '22px 24px', border: `1px solid ${P.color.paperLine}`, borderRadius: 12, background: P.color.paperSurface }}>
        {b.items.map(([label, value], j) => (
          <div key={j}>
            <div style={{ fontFamily: P.font.disp, fontSize: '2rem', color: P.color.paperGold, lineHeight: 1 }}>{value}</div>
            <div style={{ fontFamily: P.font.mono, fontSize: 10, letterSpacing: '.07em', textTransform: 'uppercase' as const, color: P.color.paperMuted, marginTop: 5 }}>{label}</div>
          </div>
        ))}
      </div>
    )
    default: return null
  }
}

// ── modal ─────────────────────────────────────────────────────────────
function ProcessModal({ onClose }: { onClose: () => void }) {
  const ease = P.ease.expo
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeRef   = useRef<HTMLButtonElement>(null)

  // Focus moves into the dialog on open and returns to the trigger on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = ''
      opener?.focus?.()
    }
  }, [])

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key !== 'Tab' || !overlayRef.current) return
    // Focus trap: keep Tab and Shift+Tab inside the dialog.
    const items = Array.from(overlayRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
    if (!items.length) return
    const first = items[0], last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  // Backdrop click via ref — avoids jsx-a11y/no-static-element-interactions
  useEffect(() => {
    const el = overlayRef.current
    if (!el) return
    const handler = (e: MouseEvent) => { if (e.target === el) onClose() }
    el.addEventListener('click', handler)
    return () => el.removeEventListener('click', handler)
  }, [onClose])

  return createPortal(
    <div
      ref={overlayRef}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         400,
        display:        'flex',
        alignItems:     'flex-start',
        justifyContent: 'center',
        padding:        '5vh 16px',
        background:     P.alpha.navyScrim82,
        animation:      `pmFadeIn .35s ${ease} forwards`,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profita-problem-title"
    >
      <style>{`
        @keyframes pmFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes pmSlideUp { from{transform:translateY(28px) scale(.985);opacity:0} to{transform:none;opacity:1} }
        .pm-dialog-inner::-webkit-scrollbar{width:8px}
        .pm-dialog-inner::-webkit-scrollbar-track{background:${P.color.white};border-radius:0 16px 16px 0}
        .pm-dialog-inner::-webkit-scrollbar-thumb{background:${P.color.paperLineHi};border-radius:4px}
      `}</style>

      <div
        className="pm-dialog-inner"
        style={{
          position:   'relative',
          background: P.color.white,
          color:      P.color.paperInk,
          borderRadius: 16,
          maxWidth:   640,
          width:      '100%',
          maxHeight:  '90vh',
          overflowY:  'auto',
          boxShadow:  `0 44px 110px -30px ${P.alpha.dark55}`,
          animation:  `pmSlideUp .5s ${ease} forwards`,
        }}
      >
        {/* Close */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position:   'absolute',
            top:        22,
            right:      24,
            width:      36,
            height:     36,
            borderRadius: '50%',
            border:     `1px solid ${P.color.paperLine}`,
            background: P.color.white,
            color:      P.color.paperIcon,
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
          background:   P.alpha.white94,
          padding:      'clamp(24px,5vw,32px) 42px 18px',
          borderBottom: `1px solid ${P.color.paperLine}`,
          zIndex:       2,
        }}>
          <div style={{ fontFamily: P.font.mono, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: P.color.paperGold }}>
            01 · The problem
          </div>
          <h2 id="profita-problem-title" style={{ fontFamily: P.font.disp, fontWeight: 400, fontSize: 'clamp(1.7rem,4.5vw,2.5rem)', lineHeight: 1.12, color: P.color.navy900, margin: '8px 0 0', maxWidth: '26ch' }}>
            Most people who needed to invest <em>didn&apos;t believe they could</em>
          </h2>
          <div style={{ fontFamily: P.font.mono, fontSize: 11, letterSpacing: '.05em', color: P.color.paperMuted, marginTop: 14 }}>
            Senior UX/UI Designer · Discovery · 4 min read
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
          <span style={{ color: P.color.gold }}>
            didn&rsquo;t believe they could.
          </span>
        </h2>

        <div style={{ maxWidth: '58ch' }}>
          <p style={{ color: P.color.onMut, lineHeight: 1.72, marginBottom: '1rem' }}>
            LH Bank wanted more people in Thailand to invest in mutual funds. There were millions
            of potential investors, but every fund app was written for people who already knew
            what an NAV was. Everyone else felt locked out.
          </p>
          <p style={{ color: P.color.onMut, lineHeight: 1.72, marginBottom: '2rem' }}>
            We set out to design an app where{' '}
            <strong style={{ color: P.color.on }}>someone who had never invested</strong>{' '}
            could make their first investment in under five minutes and feel confident doing it.
          </p>

          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
            style={{
              fontFamily:    P.font.mono,
              fontSize:      '.72rem',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color:         P.color.gold,
              background:    'transparent',
              border:        `1px solid ${P.alpha.lineHi}`,
              borderRadius:  8,
              padding:       '.5rem 1rem',
              cursor:        'pointer',
              display:       'inline-flex',
              alignItems:    'center',
              gap:           '.5em',
              transition:    `background .25s ${P.ease.expo}`,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = P.alpha.white07)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span>+</span> Behind this
          </button>
        </div>
      </div>

      {open && <ProcessModal onClose={() => setOpen(false)} />}
    </section>
  )
}
