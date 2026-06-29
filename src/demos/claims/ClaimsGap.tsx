import { C } from './tokens'

export function ClaimsGap() {
  return (
    <section id="gap" style={{ padding: 'clamp(3.4rem,8vw,6.5rem) 0', borderTop: `1px solid ${C.color.line}` }}>
      <div className="claims-wrap">
        <div className="claims-animate">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.1rem' }}>
            <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.live }}>00</span>
            <span style={{ color: C.color.txFaint }}>/</span>
            <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', letterSpacing: '.2em', textTransform: 'uppercase', color: C.color.txDim, marginLeft: '.4rem' }}>The gap</span>
          </div>
          <h2 style={{ fontFamily: C.font.display, fontWeight: 700, fontSize: 'clamp(1.7rem,3.8vw,2.8rem)', lineHeight: 1.08, letterSpacing: '-.02em', color: C.color.txHi, maxWidth: '18ch', margin: 0 }}>
            Between &ldquo;designed&rdquo; and &ldquo;shipped&rdquo; is where features{' '}
            <span style={{ color: C.color.live }}>quietly die.</span>
          </h2>
          <p style={{ fontSize: 'clamp(1rem,1.5vw,1.12rem)', color: C.color.tx, maxWidth: '60ch', marginTop: '1.1rem', lineHeight: 1.66 }}>
            Designers ship Figma, engineers ship code, and the space between is a lossy re-implementation — intent re-derived from a picture. On a regulated claims product, the flows are dense and the edge cases <b style={{ fontWeight: 600, color: C.color.txHi }}>are</b> the work, so &ldquo;handle that case later&rdquo; means a handler stuck on a million-euro claim with nowhere to go.
          </p>
        </div>
      </div>
    </section>
  )
}
