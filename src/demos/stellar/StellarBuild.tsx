'use client'

import { S } from './tokens'
import { StellarScreen1 } from './ui/StellarScreen1'

const KICKER_LINE: React.CSSProperties = {
  content: '""', display: 'inline-block', width: 24, height: 1.5,
  background: S.color.greenDeep, marginRight: '.6em', verticalAlign: 'middle',
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: S.font.mono, fontSize: '.7rem', letterSpacing: '.2em', textTransform: 'uppercase', color: S.color.greenDeep, display: 'inline-flex', alignItems: 'center', gap: '.6em', marginBottom: '1.2rem' }}>
      <span style={{ display: 'inline-block', width: 24, height: 1.5, background: S.color.greenDeep, flexShrink: 0 }} />
      {children}
    </div>
  )
}

function FeaturePoints({ points }: { points: string[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '1.6rem 0 0', display: 'grid', gap: '.7rem' }}>
      {points.map(p => (
        <li key={p} style={{ position: 'relative', paddingLeft: '1.6rem', color: S.color.inkSoft, fontSize: '.98rem', fontFamily: S.font.body }}>
          <span style={{ position: 'absolute', left: 0, top: '.55em', width: 8, height: 8, borderRadius: '50%', background: S.color.green, display: 'block' }} />
          {p}
        </li>
      ))}
    </ul>
  )
}

/* ── Screen 1 row ─────────────────────────────────────────── */
function Screen1Row() {
  return (
    <div
      className="stellar-feature-row stellar-animate"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(2rem,6vw,5rem)',
        alignItems: 'center',
      }}
    >
      {/* copy — left */}
      <div>
        <Kicker>Home Screen</Kicker>
        <h3 style={{ fontFamily: S.font.display, fontWeight: 700, fontSize: 'clamp(2.2rem,5vw,3.6rem)', letterSpacing: '-.025em', lineHeight: 1.05, margin: '0 0 1.1rem', color: S.color.ink }}>
          Your cooking{' '}
          <em style={{ fontFamily: S.font.italic, fontStyle: 'italic', fontWeight: 500, color: S.color.greenDeep }}>command center</em>
        </h3>
        <p style={{ color: S.color.inkSoft, fontSize: 'clamp(1rem,1.4vw,1.15rem)', maxWidth: '46ch', lineHeight: 1.65, fontFamily: S.font.body }}>
          Open Stellar and the day&apos;s already handled — a hero dish to inspire, quick prompts when you&apos;re stuck, and today&apos;s plan laid out.{' '}
          <strong style={{ color: S.color.ink, fontWeight: 600 }}>Cooking starts with momentum, not a blank screen.</strong>
        </p>
        <FeaturePoints points={[
          'A greeting and hero recipe set the tone instantly',
          'One-tap prompts for the four things people ask most',
          'Today\'s meals, grouped — breakfast through dinner',
        ]} />
      </div>

      {/* device — right */}
      <div style={{ justifySelf: 'center' }}>
        <StellarScreen1 />
      </div>
    </div>
  )
}

/* ── Main section ─────────────────────────────────────────── */
export function StellarBuild() {
  return (
    <section
      id="build"
      style={{ padding: 'clamp(5rem,13vw,11rem) 0', background: S.color.paper2, borderRadius: 40 }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .stellar-feature-row { max-width: var(--stellar-feature-max, 1180px); margin: 0 auto; padding: 0 clamp(1.2rem,5vw,3rem); }
        @media (max-width: 860px) {
          .stellar-feature-row { grid-template-columns: 1fr !important; }
          .stellar-feature-row > :nth-child(2) { justify-self: center !important; order: -1; }
        }
        @media (max-width: 520px) {
          .stellar-feature-row > :nth-child(2) { transform: scale(.72); transform-origin: top center; }
        }
      ` }} />

      {/* section header */}
      <div className="stellar-wrap stellar-animate" style={{ marginBottom: 'clamp(3rem,8vw,6rem)' }}>
        <span style={{ fontFamily: S.font.mono, fontSize: '.78rem', color: S.color.greenDeep, letterSpacing: '.12em', textTransform: 'uppercase', display: 'block', marginBottom: '.6rem' }}>
          The build
        </span>
        <h2 style={{ fontFamily: S.font.display, fontWeight: 700, fontSize: S.size.display, letterSpacing: '-.015em', lineHeight: 1.02, margin: '.7rem 0 1.1rem', color: S.color.ink }}>
          From insight to{' '}
          <em style={{ fontFamily: S.font.italic, fontStyle: 'italic', fontWeight: 500, color: S.color.greenDeep }}>screens.</em>
        </h2>
        <p style={{ color: S.color.inkSoft, fontSize: '1.1rem', lineHeight: 1.65, maxWidth: '56ch', fontFamily: S.font.body }}>
          Each screen shipped from a specific user problem. The bot demos the flow live — watch it tap through the app.
        </p>
      </div>

      {/* screen rows — more will be added here */}
      <Screen1Row />

      {/* closing note */}
      <div className="stellar-wrap" style={{ marginTop: 'clamp(3rem,8vw,6rem)' }}>
        <p style={{ color: S.color.inkSoft, maxWidth: '56ch', fontSize: '1.1rem', lineHeight: 1.65, fontFamily: S.font.body }}>
          The interface stayed dark and photo-forward on purpose —{' '}
          <strong style={{ color: S.color.ink, fontWeight: 600 }}>65% said visuals drive whether they&apos;ll cook a dish</strong>,
          {' '}so food imagery leads and chrome gets out of the way.
        </p>
      </div>
    </section>
  )
}
