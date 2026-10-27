'use client'

import { T } from './tokens'

export function TimsIdea() {
  return (
    <section
      id="idea"
      style={{ padding: 'clamp(5rem,13vw,11rem) 0', fontFamily: T.font.sans }}
    >
      <div className="tims-wrap tims-animate">
        <div style={{ marginBottom: 'clamp(2.4rem,6vw,4rem)' }}>
          <span className="tims-label-section">The one decision everything hangs on</span>
          <h2 style={{ fontFamily: T.font.display, fontWeight: 600, fontSize: T.size.display, letterSpacing: '-.015em', lineHeight: 1.03, margin: '.7rem 0 1.1rem', color: T.color.ink }}>
            Every order is possible. The usual one takes a single tap.
          </h2>
        </div>

        <blockquote style={{ fontFamily: T.font.display, fontWeight: 500, fontSize: 'clamp(1.4rem,3vw,2.1rem)', lineHeight: 1.28, color: T.color.ink, borderLeft: `3px solid ${T.color.red}`, paddingLeft: '1.5rem', margin: '2rem 0', maxWidth: '24ch' }}>
          I had the same fight every morning.{' '}
          <em style={{ fontStyle: 'normal', color: T.color.red }}>Everyone wanted their order exactly their way, and they wanted it now.</em>
        </blockquote>

        <p style={{ color: T.color.inkSoft, maxWidth: '56ch', marginBottom: '1.2rem', lineHeight: 1.65 }}>
          I tried three layouts and judged each against the forty-second test in my head. I knew exactly what forty seconds felt like. What won came down to <strong style={{ color: T.color.ink, fontWeight: 600 }}>distribution</strong>. All day I rang the same handful of orders, like a large double-double, a medium steeped tea or a French Vanilla. The weird blends were real, but rare, maybe one in fifty.
        </p>
        <p style={{ color: T.color.inkSoft, maxWidth: '56ch', marginBottom: '1.2rem', lineHeight: 1.65 }}>
          The design depends on one decision.{' '}
          <strong style={{ color: T.color.ink, fontWeight: 600 }}>The common order gets one button, and the strange one is fully supported but allowed to be slow</strong>, because it almost never happens and won&apos;t drag the average down. Presets sit up front, with a &ldquo;custom&rdquo; door for the rare orders.
        </p>
        <p style={{ color: T.color.inkSoft, maxWidth: '56ch', marginBottom: '1.2rem', lineHeight: 1.65 }}>
          That decision led to two more. The layout keeps the{' '}
          <strong style={{ color: T.color.ink, fontWeight: 600 }}>order ticket on screen the whole time</strong>. A customer can change their mind four times and I never lose my place. And I set myself a rule to{' '}
          <strong style={{ color: T.color.ink, fontWeight: 600 }}>fix the three things that hurt most, then stop and ship.</strong>
        </p>
      </div>
    </section>
  )
}
