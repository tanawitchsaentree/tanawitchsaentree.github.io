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
            I used the bad POS. So I rebuilt it.
          </h2>
        </div>

        <p style={{ color: T.color.inkSoft, maxWidth: '56ch', marginBottom: '1.2rem', lineHeight: 1.65 }}>
          After two years taking orders at Tim Hortons, I realized something: the POS wasn&apos;t broken, but there were plenty of opportunities to make it better. Working through busy morning rushes gave me a front-row seat to the small inefficiencies that add up when every second matters.
        </p>
        <p style={{ color: T.color.inkSoft, maxWidth: '56ch', marginBottom: '1.2rem', lineHeight: 1.65 }}>
          So years later, as a designer, I revisited the experience and redesigned the system from scratch. No access to internal systems — just memory, a public menu, and firsthand experience using the product every day.
        </p>
        <p style={{ color: T.color.inkSoft, maxWidth: '56ch', marginBottom: '1.2rem', lineHeight: 1.65 }}>
          My challenge was simple: create a faster, clearer ordering experience for the people behind the counter. Because when the queue is growing and the drive-thru timer is running, great design isn&apos;t a nice-to-have — it&apos;s operational efficiency.
        </p>
      </div>
    </section>
  )
}
