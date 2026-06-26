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
            Let people order anything — but make the usual nearly free.
          </h2>
        </div>

        <blockquote style={{ fontFamily: T.font.display, fontWeight: 500, fontSize: 'clamp(1.4rem,3vw,2.1rem)', lineHeight: 1.28, color: T.color.ink, borderLeft: `3px solid ${T.color.red}`, paddingLeft: '1.5rem', margin: '2rem 0', maxWidth: '24ch' }}>
          It&apos;s a fight I had every morning:{' '}
          <em style={{ fontStyle: 'normal', color: T.color.red }}>everyone wants it their exact way, and everyone wants it now.</em>
        </blockquote>

        <p style={{ color: T.color.inkSoft, maxWidth: '56ch', marginBottom: '1.2rem', lineHeight: 1.65 }}>
          I tried three layouts and judged each against the forty-second test in my head — because I knew exactly what forty seconds felt like. What won wasn&apos;t about pixels, it was about <strong style={{ color: T.color.ink, fontWeight: 600 }}>distribution</strong>. I rang the same handful of orders all day: large double-double, medium steeped tea, French Vanilla. The weird blends were real, but rare — maybe one in fifty.
        </p>
        <p style={{ color: T.color.inkSoft, maxWidth: '56ch', marginBottom: '1.2rem', lineHeight: 1.65 }}>
          So the whole thing rests on one move:{' '}
          <strong style={{ color: T.color.ink, fontWeight: 600 }}>the common order collapses to a single tap; the strange one is fully supported and allowed to be slow</strong>, because it almost never happens and won&apos;t drag the average. Presets up front. A &ldquo;custom&rdquo; door for the long tail.
        </p>
        <p style={{ color: T.color.inkSoft, maxWidth: '56ch', marginBottom: '1.2rem', lineHeight: 1.65 }}>
          Two things followed. The layout puts the{' '}
          <strong style={{ color: T.color.ink, fontWeight: 600 }}>order ticket where it never disappears</strong> — so a customer changing their mind four times never costs me my place. And I gave myself a rule I&apos;d have killed for behind the counter:{' '}
          <strong style={{ color: T.color.ink, fontWeight: 600 }}>fix the three things that actually hurt, then stop fiddling and ship.</strong>
        </p>
      </div>
    </section>
  )
}
