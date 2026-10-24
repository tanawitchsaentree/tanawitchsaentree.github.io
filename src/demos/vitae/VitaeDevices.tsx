'use client'

import { V } from './tokens'
import { DashboardScreen } from './DashboardScreen'
import { StatisticsScreen } from './StatisticsScreen'

export function VitaeDevices() {
  return (
    <section id="build" style={{ padding: 'clamp(4.5rem,10vw,8rem) 0 clamp(5rem,12vw,10rem)' }}>
      <div className="vitae-wrap">
        <div className="vitae-animate" style={{ maxWidth: 680, marginBottom: 'clamp(2rem,5vw,3.5rem)' }}>
          <span style={{ fontFamily: V.font.mono, fontSize: V.size.eyebrow, letterSpacing: '.26em', textTransform: 'uppercase', color: V.color.limeDeep, display: 'inline-flex', alignItems: 'center', gap: '.7em' }}>
            <span style={{ display: 'inline-block', width: 26, height: 1.5, background: V.color.limeDeep }} />
            The screens
          </span>
          <h2 style={{ fontFamily: V.font.serif, fontWeight: 300, fontSize: V.size.display, letterSpacing: '-.02em', lineHeight: 1.06, margin: '1.1rem 0 1.2rem', maxWidth: '22ch', color: V.color.ink }}>
            Both screens,{' '}
            <em style={{ fontStyle: 'italic', color: V.color.limeDeep }}>built.</em>
          </h2>
          <p style={{ color: V.color.inkSoft, fontSize: '1.1rem', maxWidth: '50ch', fontFamily: V.font.sans, lineHeight: 1.65, margin: 0 }}>
            These are the home and statistics screens from stage 04, rebuilt in HTML and CSS. Home shows how today is going, and statistics shows the week.
          </p>
        </div>
        <div
          className="vitae-animate"
          style={{
            display:        'flex',
            gap:            'clamp(1.5rem,4vw,3.5rem)',
            justifyContent: 'center',
            flexWrap:       'wrap',
            alignItems:     'flex-start',
            paddingTop:     '1rem',
          }}
        >
          <DashboardScreen />
          <StatisticsScreen />
        </div>
      </div>
    </section>
  )
}
