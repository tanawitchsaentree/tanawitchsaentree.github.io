'use client'

import { V } from './tokens'

const VOICES = [
  {
    who:   'Product',
    said:  '"If they don\'t open it daily, nothing else we do matters."',
    pull:  <>Pulls toward <b style={{ color: V.color.ink }}>engagement</b> — a reason to come back every morning.</>,
    me:    false,
  },
  {
    who:   'Clinical advisor · MD',
    said:  '"A green score on the day someone\'s getting sick is the one thing we can never ship."',
    pull:  <>Pulls toward <b style={{ color: V.color.ink }}>safety</b> — never falsely reassure.</>,
    me:    false,
  },
  {
    who:   'Engineering',
    said:  '"Assume only the sensors already on the wrist. No new hardware, no cloud round-trip."',
    pull:  <>Pulls toward <b style={{ color: V.color.ink }}>constraint</b> — ship inside what exists.</>,
    me:    false,
  },
  {
    who:   'Privacy',
    said:  '"This is the most sensitive data we hold. It does not leave the device."',
    pull:  <>Pulls toward <b style={{ color: V.color.ink }}>trust</b> — on-device or not at all.</>,
    me:    false,
  },
  {
    who:   'Design · me',
    said:  '"If the first glance needs a tutorial, the glance has already failed."',
    pull:  <>Pulls toward <b style={{ color: V.color.ink }}>clarity</b> — one reading, understood instantly.</>,
    me:    true,
  },
] as const

export function VitaeRoom() {
  return (
    <section id="room" style={{ padding: 'clamp(4.5rem,10vw,8rem) 0' }}>
      <div className="vitae-wrap">

        <div className="vitae-animate">
          <span style={{ fontFamily: V.font.mono, fontSize: V.size.eyebrow, letterSpacing: '.26em', textTransform: 'uppercase', color: V.color.limeDeep, display: 'inline-flex', alignItems: 'center', gap: '.7em' }}>
            <span style={{ display: 'inline-block', width: 26, height: 1.5, background: V.color.limeDeep }} />
            The room
          </span>
          <h2
            style={{
              fontFamily:    V.font.serif,
              fontWeight:    300,
              fontSize:      V.size.display,
              letterSpacing: '-.02em',
              lineHeight:    1.06,
              margin:        '1.1rem 0 1.4rem',
              maxWidth:      '20ch',
              color:         V.color.ink,
            }}
          >
            Before a single screen,{' '}
            <em style={{ fontStyle: 'italic', color: V.color.limeDeep }}>five people</em>{' '}
            had to agree.
          </h2>
          <p style={{ color: V.color.inkSoft, fontSize: '1.1rem', maxWidth: '56ch', fontFamily: V.font.sans, lineHeight: 1.65 }}>
            None of them wanted the same app. The project wasn&apos;t drawing the UI — it was
            finding the one design that didn&apos;t force any of them to back down on what they couldn&apos;t.
          </p>
        </div>

        {/* voice grid */}
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(2,1fr)',
            gap:                 '1.1rem',
            marginTop:           '2.6rem',
          }}
          className="vitae-voices-grid"
        >
          {VOICES.map((v, i) => (
            <div
              key={v.who}
              className="vitae-animate"
              style={{
                background:   v.me ? 'transparent' : V.color.white,
                border:       v.me ? `1px dashed ${V.color.line}` : `1px solid ${V.color.line}`,
                borderRadius: 18,
                padding:      '1.5rem 1.6rem',
                boxShadow:    v.me ? 'none' : V.shadow.voiceCard,
                position:     'relative',
                overflow:     'hidden',
                transitionDelay: `calc(${i} * ${V.motion.durationStagger})`,
              }}
            >
              {/* left accent stripe */}
              {!v.me && (
                <div
                  style={{
                    position:     'absolute',
                    left:         0,
                    top:          0,
                    bottom:       0,
                    width:        3,
                    background:   v.me ? V.color.ink : V.color.limeDeep,
                    borderRadius: '18px 0 0 18px',
                  }}
                />
              )}

              {v.me ? (
                /* "Every pair of these fights." note card */
                <div
                  style={{
                    fontFamily:  V.font.serif,
                    fontStyle:   'italic',
                    fontSize:    'clamp(1.2rem,2.4vw,1.7rem)',
                    lineHeight:  1.35,
                    maxWidth:    '26ch',
                    color:       V.color.ink,
                    display:     'flex',
                    flexDirection: 'column',
                    height:      '100%',
                    justifyContent: 'center',
                  }}
                >
                  Every pair of these{' '}
                  <b style={{ fontStyle: 'normal', fontFamily: V.font.heading, fontWeight: 700, color: V.color.limeDeep }}>fights.</b>{' '}
                  The design was the treaty.
                  <span
                    style={{
                      display:       'block',
                      fontFamily:    V.font.mono,
                      fontSize:      V.size.micro,
                      letterSpacing: '.14em',
                      textTransform: 'uppercase',
                      color:         V.color.limeDeep,
                      fontStyle:     'normal',
                      marginTop:     '1.2rem',
                    }}
                  >
                    Design · me
                  </span>
                  <span
                    style={{
                      display:    'block',
                      fontFamily: V.font.sans,
                      fontStyle:  'normal',
                      fontSize:   '1rem',
                      color:      V.color.inkSoft,
                      marginTop:  '.4rem',
                    }}
                  >
                    &ldquo;If the first glance needs a tutorial, the glance has already failed.&rdquo;
                  </span>
                </div>
              ) : (
                <>
                  <div style={{ fontFamily: V.font.mono, fontSize: V.size.micro, letterSpacing: '.14em', textTransform: 'uppercase', color: V.color.limeDeep, marginBottom: '.7rem' }}>{v.who}</div>
                  <div style={{ fontFamily: V.font.serif, fontStyle: 'italic', fontWeight: 400, fontSize: '1.18rem', lineHeight: 1.3, color: V.color.ink, marginBottom: '.9rem' }}>{v.said}</div>
                  <div style={{ fontSize: '1rem', color: V.color.inkSoft, fontFamily: V.font.sans }}>{v.pull}</div>
                </>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
