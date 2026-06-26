'use client'

import { T } from './tokens'

const FIXES = [
  {
    tag: 'FIX 1',
    title: 'Put the clock on screen',
    body: "I'd been judging “fast” by feel. So I added the thing the back wall had: a live order timer in seconds against the real 40s mark, plus a tap counter.",
    why: 'Now every later change could be measured against the clock I used to live under — not guessed at.',
  },
  {
    tag: 'FIX 2',
    title: 'Make the weird orders possible — without slowing the normal ones',
    body: 'Half-step cream and sugar, one-tap blend presets (½ coffee · ½ FV, mocha, ¾ · ¼), and a "custom blend" door for the rare full recipe.',
    why: 'The double-double stayed one tap; the triple-triple-half-steeped-tea finally became sane — exactly the bet, proven on the timer.',
  },
  {
    tag: 'FIX 3',
    title: 'Make changing your mind harmless',
    body: 'A live preview that updates before anything\'s committed, undo on edits, and the big catering orders (Box of Joe, dozens) that I always fumbled.',
    why: 'The 8 a.m. waffler stopped being a problem, and the highest-value orders finally fit.',
  },
] as const

export function TimsFixed() {
  return (
    <section
      id="fixed"
      style={{ padding: 'clamp(5rem,13vw,11rem) 0', fontFamily: T.font.sans }}
    >
      <div className="tims-wrap tims-animate">
        <div style={{ marginBottom: 'clamp(2.4rem,6vw,4rem)' }}>
          <span className="tims-label-section">The gaps were obvious — so I went back</span>
          <h2 style={{ fontFamily: T.font.display, fontWeight: 600, fontSize: T.size.display, letterSpacing: '-.015em', lineHeight: 1.03, margin: '.7rem 0 1.1rem', color: T.color.ink }}>
            Three things the first build got wrong.
          </h2>
          <p style={{ color: T.color.inkSoft, fontSize: '1.1rem', lineHeight: 1.65, maxWidth: '56ch' }}>
            The walkthrough exposed exactly what a rushed first version quietly fails. I gave myself three passes — no more — and each one closed a real gap, not a cosmetic one.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '1rem', marginTop: '1.6rem' }}>
          {FIXES.map(f => (
            <div
              key={f.tag}
              style={{
                display:             'grid',
                gridTemplateColumns: 'auto 1fr',
                gap:                 '1.3rem',
                background:          T.color.paper,
                border:              `1px solid ${T.alpha.line}`,
                borderRadius:        18,
                padding:             '1.4rem 1.6rem',
                boxShadow:           T.alpha.shadow,
              }}
            >
              <span style={{ fontFamily: T.font.mono, fontSize: '.75rem', fontWeight: 700, letterSpacing: '.04em', background: T.color.red, color: T.color.onAccent, padding: '.45rem .7rem', borderRadius: 9, height: 'fit-content', whiteSpace: 'nowrap' }}>
                {f.tag}
              </span>
              <div>
                <h4 style={{ fontFamily: T.font.display, fontWeight: 600, fontSize: '1.12rem', letterSpacing: '-.015em', marginBottom: '.3rem', color: T.color.ink }}>
                  {f.title}
                </h4>
                <p style={{ fontSize: '1rem', color: T.color.inkSoft, lineHeight: 1.65 }}>
                  {f.body}{' '}
                  <span style={{ color: T.color.ink, fontWeight: 600 }}>{f.why}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.2rem', fontFamily: T.font.mono, fontSize: '1rem', color: T.color.gold, display: 'flex', alignItems: 'center', gap: '.6rem' }}>
          <span aria-hidden>⟳</span>
          Three passes, done. The leftovers — &ldquo;the usual&rdquo; recall, mobile pickup, steeped-vs-bag, French labels — I wrote down for a clean next start, not a fourth round of tinkering.
        </div>
      </div>
    </section>
  )
}
