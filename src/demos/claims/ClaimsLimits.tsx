import { C } from './tokens'

const LIMITS = [
  { title: 'slower for early exploration',   body: 'Three sketches deep and unsure, code is too literal. Paper and Figma win that phase. Code earns its keep once the design is converging and needs real data.' },
  { title: 'verification is on me',           body: 'The agent builds what I describe; it can\'t tell me a hierarchy is wrong. Describe poorly, build poorly — a different skill, still mapping its failure modes.' },
  { title: '"autonomous" oversells it',       body: 'What I run is a manual loop — draft prompts, paste outputs, verify, repeat. It beats the old hand-off, but it isn\'t walk-away. The trust calibration isn\'t there yet.' },
  { title: 'a prototype looks like a product',body: 'Great for demos, risky for expectations. The data is fake, routes are placeholders, persistence is throwaway. I say that out loud in every demo now.' },
]

export function ClaimsLimits() {
  return (
    <section id="limits" style={{ padding: 'clamp(3.4rem,8vw,6.5rem) 0', borderTop: `1px solid ${C.color.line}` }}>
      <div className="claims-wrap">
        <div className="claims-animate" style={{ marginBottom: '2.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.1rem' }}>
            <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.live }}>06</span>
            <span style={{ color: C.color.txFaint }}>/</span>
            <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', letterSpacing: '.2em', textTransform: 'uppercase', color: C.color.txDim, marginLeft: '.4rem' }}>Known limitations</span>
          </div>
          <h2 style={{ fontFamily: C.font.display, fontWeight: 700, fontSize: 'clamp(1.7rem,3.8vw,2.8rem)', lineHeight: 1.08, letterSpacing: '-.02em', color: C.color.txHi, maxWidth: '20ch', margin: 0 }}>
            Not a religion.{' '}
            <span style={{ color: C.color.live }}>Here&apos;s where it breaks.</span>
          </h2>
        </div>

        <div className="claims-animate claims-d1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${C.color.line}`, borderRadius: 8, overflow: 'hidden' }}>
          {LIMITS.map((l, i) => (
            <div
              key={l.title}
              style={{
                padding: '1.2rem 1.3rem',
                borderBottom: i < 2 ? `1px solid ${C.color.line}` : 'none',
                borderRight: i % 2 === 0 ? `1px solid ${C.color.line}` : 'none',
              }}
            >
              <h4 style={{ fontFamily: C.font.mono, fontSize: '.8rem', color: C.color.warn, marginBottom: '.5rem', letterSpacing: '.02em' }}>
                ! {l.title}
              </h4>
              <p style={{ fontSize: '1rem', color: C.color.tx, lineHeight: 1.55, margin: 0 }}>{l.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
