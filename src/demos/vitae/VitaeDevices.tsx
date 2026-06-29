'use client'

import { V } from './tokens'
import { DashboardScreen } from './DashboardScreen'
import { StatisticsScreen } from './StatisticsScreen'

export function VitaeDevices() {
  return (
    <section id="build" style={{ padding: 'clamp(4.5rem,10vw,8rem) 0 clamp(5rem,12vw,10rem)' }}>
      <div className="vitae-wrap">
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
