'use client'

import { V } from './tokens'

function Label({ children }: { children: string }) {
  return (
    <span
      style={{
        fontFamily:    V.font.mono,
        fontSize:      V.size.micro,
        letterSpacing: '.22em',
        textTransform: 'uppercase',
        color:         V.color.limeDeep,
        display:       'inline-flex',
        alignItems:    'center',
        gap:           '.6em',
      }}
    >
      <span style={{ display: 'inline-block', width: 26, height: 1.5, background: V.color.limeDeep }} />
      {children}
    </span>
  )
}

function PhaseNum({ n }: { n: string }) {
  return (
    <div
      style={{
        fontFamily:  V.font.serif,
        fontWeight:  300,
        fontSize:    'clamp(2.6rem,5vw,3.6rem)',
        color:       V.color.limeDeep,
        lineHeight:  1,
        paddingTop:  2,
      }}
    >
      {n}
    </div>
  )
}

function Kicker({ children }: { children: string }) {
  return (
    <div
      style={{
        fontFamily:    V.font.mono,
        fontSize:      V.size.micro,
        letterSpacing: '.2em',
        textTransform: 'uppercase',
        color:         V.color.muted,
        marginBottom:  '.9rem',
      }}
    >
      {children}
    </div>
  )
}

function PhaseH3({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontFamily:    V.font.serif,
        fontWeight:    500,
        fontSize:      'clamp(1.35rem,3vw,2rem)',
        letterSpacing: '-.02em',
        lineHeight:    1.04,
        color:         V.color.ink,
        marginBottom:  '.4rem',
      }}
    >
      {children}
    </h3>
  )
}

function Chip({ children }: { children: string }) {
  return (
    <span
      style={{
        fontFamily:    V.font.mono,
        fontSize:      V.size.micro,
        letterSpacing: '.04em',
        background:    V.color.white,
        border:        `1px solid ${V.color.line}`,
        padding:       '.42rem .8rem',
        borderRadius:  999,
        color:         V.color.inkSoft,
      }}
    >
      {children}
    </span>
  )
}

function MiniCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div
      style={{
        background:   V.color.white,
        border:       `1px solid ${V.color.line}`,
        borderRadius: 18,
        padding:      '1.2rem 1.3rem',
        boxShadow:    V.shadow.sm,
      }}
    >
      <h4
        style={{
          fontFamily:   V.font.sans,
          fontWeight:   700,
          fontSize:     '1rem',
          marginBottom: '.35rem',
          display:      'flex',
          alignItems:   'center',
          gap:          '.5rem',
          color:        V.color.ink,
        }}
      >
        <span
          style={{
            width:        22,
            height:       22,
            borderRadius: 7,
            background:   V.color.limeSoft,
            display:      'grid',
            placeContent: 'center',
            color:        V.color.limeDeep,
            fontSize:     13,
            flexShrink:   0,
          }}
        >
          {icon}
        </span>
        {title}
      </h4>
      <p style={{ fontSize: '1rem', color: V.color.inkSoft, lineHeight: 1.55 }}>{body}</p>
    </div>
  )
}

function Quote({ children }: { children: string }) {
  return (
    <blockquote
      style={{
        fontFamily:   V.font.serif,
        fontStyle:    'italic',
        fontSize:     'clamp(1.2rem,2.4vw,1.6rem)',
        lineHeight:   1.4,
        color:        V.color.ink,
        borderLeft:   `3px solid ${V.color.lime}`,
        paddingLeft:  '1.4rem',
        margin:       '1.6rem 0',
      }}
    >
      {children}
    </blockquote>
  )
}

function Phase({ id, n, kicker, title, children }: {
  id?: string
  n: string
  kicker: string
  title: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      id={id}
      className="vitae-animate"
      style={{
        display:             'grid',
        gridTemplateColumns: '96px 1fr',
        gap:                 'clamp(1.5rem,4vw,3rem)',
        padding:             'clamp(2.2rem,5vw,3.4rem) 0',
        borderTop:           `1px solid ${V.color.line}`,
      }}
    >
      <PhaseNum n={n} />
      <div style={{ fontFamily: V.font.sans }}>
        <Kicker>{kicker}</Kicker>
        <PhaseH3>{title}</PhaseH3>
        {children}
      </div>
    </div>
  )
}

export function VitaePhases() {
  return (
    <section id="phases" style={{ paddingTop: 0, fontFamily: V.font.sans }}>
      <div className="vitae-wrap">
        {/* section intro */}
        <div className="vitae-animate" style={{ maxWidth: 680, marginBottom: 'clamp(2.5rem,6vw,4rem)' }}>
          <Label>Walkthrough</Label>
          <h2
            style={{
              fontFamily:    V.font.serif,
              fontWeight:    500,
              fontSize:      V.size.display,
              letterSpacing: '-.02em',
              lineHeight:    1.04,
              color:         V.color.ink,
              margin:        '1rem 0 1.1rem',
            }}
          >
            From a vague goal to a shipped screen.
          </h2>
          <p style={{ color: V.color.inkSoft, fontSize: '1.08rem', lineHeight: 1.65 }}>
            Each stage below carries its real decisions — what we asked, what we tried, what we cut.
          </p>
        </div>

        {/* 01 Discover */}
        <Phase id="discover" n="01" kicker="Discover · set the goal" title="Why do people quit health apps?">
          <p style={{ color: V.color.inkSoft, maxWidth: '56ch', marginBottom: '1.4rem', lineHeight: 1.65 }}>
            Five user interviews and a teardown of six competitors pointed at one pattern: data was everywhere,
            meaning was nowhere. People opened the app, saw numbers, and felt <em>audited</em> rather than
            encouraged. So the goal got sharp and measurable.
          </p>
          <Quote>
            &ldquo;Make today&apos;s health legible in under five seconds — and make it feel like momentum, not a report card.&rdquo;
          </Quote>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '1.3rem' }}>
            {['5 interviews', '6-app teardown', 'Goal: time-to-insight <5s', 'Tone: encouraging'].map(c => (
              <Chip key={c}>{c}</Chip>
            ))}
          </div>
        </Phase>

        {/* 02 Ideate */}
        <Phase n="02" kicker="Ideate · widen the options" title={'Many shapes for “momentum”'}>
          <p style={{ color: V.color.inkSoft, maxWidth: '56ch', marginBottom: '1.4rem', lineHeight: 1.65 }}>
            Crazy-eights and How-Might-We rounds produced a dozen directions. We pressure-tested each against
            the five-second goal and kept the three that read fastest at a glance.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <MiniCard icon="◐" title="Weekly progress ring"    body={'One streak number (“6 days”) wrapped in a fill ring — progress without a paragraph.'} />
            <MiniCard icon="▤" title="Glanceable metric tiles" body="Steps & water as big numbers, one icon each. No charts on home." />
            <MiniCard icon="▦" title="Meals as ranges"         body="Calorie ranges (456–512) instead of false precision — lowers logging anxiety." />
            <MiniCard icon="▥" title="One stats deep-dive"     body="Push detail to a second screen so home stays calm." />
          </div>
        </Phase>

        {/* 03 Planning */}
        <Phase n="03" kicker="Planning · make it buildable" title="Architecture & a token kit">
          <p style={{ color: V.color.inkSoft, maxWidth: '56ch', marginBottom: '1.4rem', lineHeight: 1.65 }}>
            Before any pixels, we locked the information architecture and a small design-token set so the two
            screens would feel like one product. Lime became the single energy accent; everything else stayed quiet.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '1.3rem' }}>
            {['Nav: Home · Progress · Rewards · Menu', 'Center scan action', '8-pt spacing scale', '1 accent · lime', 'Radius 18–22px', 'Component library: 7'].map(c => (
              <Chip key={c}>{c}</Chip>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <MiniCard icon="⊞" title="Component inventory" body="Progress ring, metric tile, calendar strip, meal card, bar chart, stat tile, tab bar." />
            <MiniCard icon="⏱" title="Build order"         body="Home first (the daily habit), then the statistics screen as the weekly check-in." />
          </div>
        </Phase>

        {/* 04 Execute */}
        <Phase n="04" kicker="Execute · ship the pixels" title="The two screens, built">
          <p style={{ color: V.color.inkSoft, maxWidth: '56ch', marginBottom: '1rem', lineHeight: 1.65 }}>
            Below is the actual output of this stage — both screens, rebuilt in live HTML/CSS. The home view
            answers &ldquo;how am I doing today?&rdquo;; the statistics view answers &ldquo;how was my week?&rdquo;.
          </p>
        </Phase>
      </div>

      {/* 05 + 06 */}
      <div className="vitae-wrap">
        {/* 05 Review */}
        <Phase n="05" kicker="Review · find what hurts" title="Five seconds, tested">
          <p style={{ color: V.color.inkSoft, maxWidth: '56ch', marginBottom: '1.4rem', lineHeight: 1.65 }}>
            A quick heuristic pass plus five timed glance-tests surfaced three real problems — small,
            but each one cost the user clarity.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <MiniCard icon="!" title="Low-contrast percentages" body="Grey % labels on the chart failed against the light bars at a glance." />
            <MiniCard icon="!" title={'No "today" anchor'}      body="Users couldn't instantly find the current day in the week chart." />
            <MiniCard icon="!" title="Range felt like error"    body='"456 – 512 kcal" read as a glitch until the fire icon gave it context.' />
          </div>
        </Phase>

        {/* 06 Iterate */}
        <Phase n="06" kicker="Iterate · fix it, then stop" title="Three turns, then ship">
          <p style={{ color: V.color.inkSoft, maxWidth: '56ch', marginBottom: '1.4rem', lineHeight: 1.65 }}>
            Each review fed exactly one focused iteration. The budget — three — forced decisions instead of endless polish.
          </p>
          <div style={{ display: 'grid', gap: '.8rem' }}>
            {[
              { pass: 'PASS 1', text: <><b style={{ color: V.color.ink }}>Anchored &ldquo;today.&rdquo;</b> The current day (Wed) became the deep-green peak bar with a bold label, so the week reads from one fixed point.</> },
              { pass: 'PASS 2', text: <><b style={{ color: V.color.ink }}>Restored hierarchy.</b> Added the target reference (1920 Kcal) beside the big number and tightened tile weights so home stays calm.</> },
              { pass: 'PASS 3', text: <><b style={{ color: V.color.ink }}>Polished &amp; locked.</b> Chart easing, ring fill timing, and the lime accent locked into tokens. Budget spent — committed to ship.</> },
            ].map(({ pass, text }) => (
              <div
                key={pass}
                style={{
                  display:             'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap:                 '1rem',
                  background:          V.color.white,
                  border:              `1px solid ${V.color.line}`,
                  borderRadius:        16,
                  padding:             '1rem 1.2rem',
                  boxShadow:           V.shadow.sm,
                  alignItems:          'start',
                }}
              >
                <span
                  style={{
                    fontFamily:    V.font.mono,
                    fontSize:      V.size.micro,
                    fontWeight:    700,
                    letterSpacing: '.08em',
                    background:    V.color.lime,
                    color:         V.color.ink,
                    padding:       '.4rem .65rem',
                    borderRadius:  9,
                    whiteSpace:    'nowrap',
                  }}
                >
                  {pass}
                </span>
                <p style={{ fontSize: '1rem', color: V.color.inkSoft, lineHeight: 1.6 }}>{text}</p>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop:     '1rem',
              fontFamily:    V.font.mono,
              fontSize:      '1rem',
              color:         V.color.limeDeep,
              display:       'flex',
              alignItems:    'center',
              gap:           '.6rem',
            }}
          >
            ⟳ Loop closes here. Next cycle starts from a fresh Discover, not a fourth patch.
          </div>
        </Phase>
      </div>
    </section>
  )
}
