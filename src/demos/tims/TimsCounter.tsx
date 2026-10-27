'use client'

import { T } from './tokens'

export function TimsCounter() {
  return (
    <section
      id="counter"
      style={{ padding: 'clamp(5rem,13vw,11rem) 0', fontFamily: T.font.sans }}
    >
      <div className="tims-wrap tims-animate">
        <div style={{ marginBottom: 'clamp(2.4rem,6vw,4rem)' }}>
          <span className="tims-label-section">Two years on the headset</span>
          <h2 style={{ fontFamily: T.font.display, fontWeight: 600, fontSize: T.size.display, letterSpacing: '-.015em', lineHeight: 1.03, margin: '.7rem 0 1.1rem', color: T.color.ink }}>
            Twelve taps for a Double-Double.
          </h2>
        </div>

        <p style={{ color: T.color.inkSoft, maxWidth: '56ch', marginBottom: '1.2rem', lineHeight: 1.65 }}>
          After two years taking orders at Tim Hortons, I knew exactly how broken the POS was. Every one of those taps happened while eight cars waited outside.
        </p>
        <p style={{ color: T.color.inkSoft, maxWidth: '56ch', marginBottom: '1.2rem', lineHeight: 1.65 }}>
          Years later, as a designer, I went back and redesigned the system from scratch. I had no access to internal systems. I worked from memory, the public menu and two years of using the POS every day.
        </p>
        <p style={{ color: T.color.inkSoft, maxWidth: '56ch', marginBottom: '1.2rem', lineHeight: 1.65 }}>
          I wanted to make ordering faster and clearer for the people behind the counter. When the queue is growing and the drive-thru timer is running, a clearer screen gets each order out sooner.
        </p>
      </div>
    </section>
  )
}
