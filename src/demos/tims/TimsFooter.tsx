'use client'

import { T } from './tokens'

export function TimsFooter() {
  return (
    <footer style={{ background: T.color.espresso, color: T.color.cream, padding: 'clamp(3.5rem,8vw,6rem) 0 3rem', fontFamily: T.font.sans }}>
      <div className="tims-wrap tims-animate">
        <h2 style={{ fontFamily: T.font.display, fontWeight: 600, fontSize: T.size.display, letterSpacing: '-.015em', lineHeight: 1.03, color: T.color.cream, marginBottom: '1rem', maxWidth: '18ch' }}>
          A POS for the <em style={{ fontStyle: 'normal', color: T.color.red }}>5 a.m.</em> shift.
        </h2>
        <p style={{ color: T.alpha.cream60, maxWidth: '54ch', lineHeight: 1.65 }}>
          A weekend concept. The seconds that ran my mornings drove every decision, and a hard cap on iterations made me ship it before it was perfect. I made it for the people still on the drive-thru headset.
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginTop: '3rem', paddingTop: '2rem', borderTop: `1px solid ${T.alpha.lineDk}` }}>
          <small style={{ fontFamily: T.font.mono, fontSize: '.75rem', letterSpacing: '.1em', textTransform: 'uppercase' as const, color: T.alpha.cream55, lineHeight: 1.7, display: 'block', fontStyle: 'normal' }}>
            TIMS POS · A CONCEPT FROM BEHIND THE COUNTER<br />
            FORMER FRONT-LINE EMPLOYEE · NOW DESIGNING
          </small>
          <small style={{ fontFamily: T.font.mono, fontSize: '.75rem', letterSpacing: '.1em', textTransform: 'uppercase' as const, color: T.alpha.cream55, lineHeight: 1.7, display: 'block', fontStyle: 'normal' }}>
            DESIGN + BUILD · 2026<br />
            PORTFOLIO · WEEKEND PROJECT
          </small>
        </div>

        <small style={{ display: 'block', marginTop: '1.5rem', fontSize: '.75rem', letterSpacing: '.05em', textTransform: 'uppercase', color: T.alpha.cream55, maxWidth: '56ch', lineHeight: 1.6, fontStyle: 'normal' }}>
          Unofficial concept project. Not affiliated with, endorsed by, or connected to Tim Hortons or Restaurant Brands International. Based entirely on my own experience as a former front-line employee and publicly available menu information. No internal systems, data, or proprietary tools are represented.
        </small>
      </div>
    </footer>
  )
}
