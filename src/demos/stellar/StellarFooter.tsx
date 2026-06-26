'use client'

import { S } from './tokens'

export function StellarFooter() {
  return (
    <footer style={{
      background:   S.color.ink,
      color:        S.color.paper,
      padding:      'clamp(4rem,8vw,6.5rem) 0 3rem',
      borderRadius: '40px 40px 0 0',
    }}>
      <div className="stellar-wrap stellar-animate">
        <h2 style={{ fontFamily: S.font.display, fontWeight: 700, color: S.color.paper, fontSize: S.size.display, maxWidth: '16ch', lineHeight: 1.02, letterSpacing: '-.015em' }}>
          Less waste. More <em style={{ fontFamily: S.font.italic, fontStyle: 'italic', color: S.color.lime }}>&ldquo;oh, I&apos;ll make that.&rdquo;</em>
        </h2>
        <p style={{ color: S.alpha.paper60, maxWidth: '52ch', marginTop: '1rem', lineHeight: 1.65 }}>
          A mobile cooking companion designed end-to-end around one human truth — cook what you already have — and grounded in what real home cooks actually told me.
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginTop: '3rem', paddingTop: '2rem', borderTop: `1px solid ${S.alpha.paper14}` }}>
          <small style={{ fontFamily: S.font.mono, fontSize: '.75rem', letterSpacing: '.1em', textTransform: 'uppercase' as const, color: S.alpha.paper45, lineHeight: 1.7, display: 'block', fontStyle: 'normal' }}>
            STELLAR · AI COOKING APP<br />
            PRODUCT DESIGN · SOLE DESIGNER · 2024
          </small>
          <small style={{ fontFamily: S.font.mono, fontSize: '.75rem', letterSpacing: '.1em', textTransform: 'uppercase' as const, color: S.alpha.paper45, lineHeight: 1.7, display: 'block', fontStyle: 'normal' }}>
            PORTFOLIO · CASE STUDY<br />
            UX RESEARCH → CONCEPT → HI-FI UI
          </small>
        </div>

        <small style={{ display: 'block', marginTop: '1.4rem', fontSize: '.75rem', letterSpacing: '.06em', textTransform: 'uppercase', color: S.alpha.paper38, maxWidth: '56ch', lineHeight: 1.6, fontStyle: 'normal' }}>
          Case study presentation. Research figures (70/85/65/60%) and user quotes reflect the project&apos;s own user-research summary; participant names are illustrative composites. App screens are reserved as placeholders in this draft.
        </small>
      </div>
    </footer>
  )
}
