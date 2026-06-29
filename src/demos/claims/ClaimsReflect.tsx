import { C } from './tokens'

export function ClaimsReflect() {
  return (
    <>
      <section id="reflect" style={{ padding: 'clamp(3.4rem,8vw,6.5rem) 0', borderTop: `1px solid ${C.color.line}` }}>
        <div className="claims-wrap">
          <div className="claims-animate">
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.4rem' }}>
              <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.live }}>08</span>
              <span style={{ color: C.color.txFaint }}>/</span>
              <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', letterSpacing: '.2em', textTransform: 'uppercase', color: C.color.txDim, marginLeft: '.4rem' }}>What it taught me</span>
            </div>
            <blockquote style={{
              fontFamily: C.font.display, fontWeight: 700,
              fontSize: 'clamp(1.5rem,4vw,2.6rem)',
              lineHeight: 1.15, letterSpacing: '-.025em',
              color: C.color.txHi, maxWidth: '22ch', margin: 0,
            }}>
              I came in expecting to ship more Figma. I left shipping{' '}
              <span style={{ color: C.color.live }}>working software</span>{' '}
              — and still calling it design.
            </blockquote>

            <p style={{ fontFamily: C.font.mono, fontSize: '.76rem', color: C.color.txDim, lineHeight: 1.65, maxWidth: '68ch', marginTop: '2rem', borderTop: `1px solid ${C.color.line}`, paddingTop: '1.3rem' }}>
              {'// enterprise claims case study. the platform, the conversion flow, the audit-build-verify workflow and the skill library reflect real work. client and colleague names are stand-ins; ticket IDs and internal figures are omitted; the panels here are an interactive demonstration — mock data, placeholder routes — not the production system.'}
            </p>
          </div>
        </div>
      </section>

      <div style={{ textAlign: 'center', padding: 'clamp(4rem,9vw,7rem) 0', borderTop: `1px solid ${C.color.line}` }}>
        <div className="claims-wrap">
          <p className="claims-animate" style={{ fontFamily: C.font.display, fontWeight: 700, fontSize: 'clamp(1.8rem,5vw,3.2rem)', letterSpacing: '-.03em', color: C.color.txHi, lineHeight: 1.08 }}>
            The title didn&apos;t change.<br />
            <span style={{ color: C.color.live }}>The output did.</span>
          </p>
          <p className="claims-animate claims-d1" style={{ fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.txDim, marginTop: '1.6rem' }}>
            designer-as-builder.spec · end of record
          </p>
        </div>
      </div>
    </>
  )
}
