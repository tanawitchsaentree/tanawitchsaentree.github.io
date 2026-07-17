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
              I don&apos;t design screens.{' '}
              I design <span style={{ color: C.color.live }}>behavior</span>{' '}
              — and then decide what medium makes it testable.
            </blockquote>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginTop: '2.2rem', maxWidth: '62ch' }}>
              {[
                { q: 'Figma isn\'t the output.', a: 'It\'s a tool. A good one for early exploration, for communication, for surfaces that don\'t involve reactive state. But one option in a larger decision about what form a design should take.' },
                { q: 'Code surfaces what Figma hides.', a: 'In Figma, the Close Section button looks enabled because you drew it that way. In a running app, computed(() => form.control.invalid) stays disabled regardless. The bug has nowhere to hide — and it lands on the designer\'s desk, not the engineer\'s.' },
                { q: 'Nobody asked me to work this way.', a: 'I decided the deliverable needed to change. The loop, the skill library, the verify-separate-from-build constraint — all personal initiative. That\'s not a credential. It\'s a choice I\'ll keep making.' },
              ].map(({ q, a }) => (
                <div key={q} style={{ borderLeft: `2px solid ${C.color.lineBri}`, paddingLeft: '1rem' }}>
                  <p style={{ fontFamily: C.font.display, fontWeight: 600, fontSize: '.96rem', color: C.color.txHi, margin: '0 0 .35rem' }}>{q}</p>
                  <p style={{ fontSize: '.9rem', color: C.color.tx, lineHeight: 1.6, margin: 0 }}>{a}</p>
                </div>
              ))}
            </div>

            <p style={{ fontFamily: C.font.mono, fontSize: '.76rem', color: C.color.txDim, lineHeight: 1.65, maxWidth: '68ch', marginTop: '2rem', borderTop: `1px solid ${C.color.line}`, paddingTop: '1.3rem' }}>
              {'// enterprise claims case study. the platform, the features, the audit-build-verify loop and the skill library reflect real work at a leading european commercial insurer. ticket IDs and reserve figures are illustrative; the panels here are an interactive demonstration — mock data, placeholder routes — not the production system.'}
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
