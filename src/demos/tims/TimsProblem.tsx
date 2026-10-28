'use client'

import { useEffect, useRef } from 'react'
import { T } from './tokens'

// ── Decode panel ──────────────────────────────────────────────────────────────
const DECODE_ORDERS = [
  { say: '"Large double-double, extra hot, and a 10-pack of Timbits."', taps: ['Large', 'Coffee', 'Cream ×2', 'Sugar ×2', 'Extra hot', 'Timbits 10'] },
  { say: '"Medium French Vanilla, and a BELT on a bagel, toasted."',     taps: ['Medium', 'Fr. Vanilla', 'BELT', 'Bagel', 'Toasted'] },
  { say: '"Two XL coffees: one black, one triple-triple."',             taps: ['XL Coffee', 'Black', 'XL Coffee', 'Cream ×3', 'Sugar ×3'] },
] as const

function DecodePanel() {
  const rootRef   = useRef<HTMLDivElement>(null)
  const spokenRef = useRef<HTMLParagraphElement>(null)
  const tapsRef   = useRef<HTMLDivElement>(null)
  const idxRef    = useRef(0)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

    function show(o: typeof DECODE_ORDERS[number]) {
      timersRef.current.forEach(clearTimeout); timersRef.current = []
      if (spokenRef.current) {
        spokenRef.current.textContent = o.say
        spokenRef.current.style.animation = 'none'
        void spokenRef.current.offsetWidth
        spokenRef.current.style.animation = ''
      }
      if (tapsRef.current) {
        tapsRef.current.innerHTML = o.taps.map(t => `<span class="tims-tap">${t}</span>`).join('')
        const chips = [...tapsRef.current.querySelectorAll<HTMLElement>('.tims-tap')]
        if (reduce) chips.forEach(c => c.classList.add('tims-tap-lit'))
        else chips.forEach((c, k) => {
          timersRef.current.push(setTimeout(() => c.classList.add('tims-tap-lit'), 420 + k * 340))
        })
      }
    }

    function cycle() { show(DECODE_ORDERS[idxRef.current]); idxRef.current = (idxRef.current + 1) % DECODE_ORDERS.length }
    cycle()

    if (reduce) return

    let iv: ReturnType<typeof setInterval> | null = null
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { if (!iv) iv = setInterval(cycle, 8200) }
      else { if (iv) { clearInterval(iv); iv = null } }
    }, { threshold: 0 })
    io.observe(root)

    return () => {
      if (iv) clearInterval(iv)
      io.disconnect()
      timersRef.current.forEach(clearTimeout)
    }
  }, [])

  return (
    <div ref={rootRef} style={{ position: 'relative', background: `radial-gradient(120% 100% at 80% 0%, ${T.color.espresso2}, ${T.color.espresso} 60%)`, borderRadius: 26, padding: 'clamp(1.5rem,3vw,2.2rem)', color: T.color.cream, overflow: 'hidden', isolation: 'isolate' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(60% 50% at 85% 8%, ${T.alpha.red10}, transparent 70%)`, zIndex: -1, pointerEvents: 'none' }} />

      {/* live pip */}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.55em', fontFamily: T.font.mono, fontSize: '.6875rem', letterSpacing: '.2em', textTransform: 'uppercase', color: T.alpha.cream62 }}>
        <span className="tims-decode-pip" />
        The order, decoded
      </span>

      <h3 style={{ fontFamily: T.font.display, fontWeight: 700, fontSize: 'clamp(1.5rem,3.6vw,2.05rem)', lineHeight: 1.12, letterSpacing: '-.02em', margin: '1.1rem 0 2rem', color: T.color.cream }}>
        Ringing in an order <span style={{ color: T.color.red }}>means translating it into taps.</span>
      </h3>

      <div style={{ fontFamily: T.font.mono, fontSize: '.6875rem', letterSpacing: '.18em', textTransform: 'uppercase', color: T.color.muted, marginBottom: '.7rem' }}>
        What the customer says
      </div>
      <p ref={spokenRef} className="tims-spoken" style={{ fontFamily: T.font.display, fontWeight: 700, fontSize: 'clamp(1.15rem,2.8vw,1.55rem)', lineHeight: 1.34, color: T.color.cream, margin: '0 0 1.7rem', minHeight: '3.5em' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '.7em', fontFamily: T.font.mono, fontSize: '.6875rem', letterSpacing: '.08em', textTransform: 'uppercase', color: T.color.muted, marginBottom: '1.1rem' }}>
        <span style={{ flex: 'none', width: 20, height: 1, background: T.color.muted, display: 'inline-block' }} />
        becomes the buttons I have to find
      </div>
      <div style={{ fontFamily: T.font.mono, fontSize: '.6875rem', letterSpacing: '.18em', textTransform: 'uppercase', color: T.color.muted, marginBottom: '.7rem' }}>
        What I press
      </div>

      <div ref={tapsRef} style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', minHeight: '6rem', alignContent: 'flex-start' }} />

      <p style={{ marginTop: '1.5rem', fontSize: '.92rem', lineHeight: 1.5, color: T.alpha.cream62, maxWidth: '44ch' }}>
        One sentence from the customer turned into a handful of taps that I had to find and hit before the next car. I wanted the screen to make that translation{' '}
        <b style={{ color: T.color.cream }}>disappear</b>.
      </p>
    </div>
  )
}

// ── Takeaway cards ────────────────────────────────────────────────────────────
const TAKES = [
  {
    icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M7 8h10M7 8a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4M7 8l1 11a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-11"/></svg>,
    title: 'Customers order in their own words.',
    body:  '"Large triple-triple, extra hot, half steeped tea." My job was to turn that into the right taps before the next car rolled up.',
  },
  {
    icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx={12} cy={13} r={8}/><path d="M12 9v4l2.5 2.5M12 1h0M9 1h6"/></svg>,
    title: 'The wall timer clocked every car.',
    body:  'It judged me on each one. The screen had to keep up with my hands.',
  },
  {
    icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
    title: 'One changed order slows the whole line.',
    body:  '"Make it medium… no, iced." On a slow screen, that one change makes every car behind it wait. Every tap I spent fixing it was a tap the next car waited through.',
  },
] as const

export function TimsProblem() {
  const sectionRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.removeAttribute('data-offscreen')
      else el.setAttribute('data-offscreen', '')
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="problem" data-m={2} style={{ padding: 'clamp(5rem,13vw,11rem) 0', background: T.color.cream2, fontFamily: T.font.sans }}>
      {/* dangerouslySetInnerHTML: a plain <style>{text} child gets its quotes HTML-escaped by
          the server render, which caused React hydration errors #425/#418/#423 on this page. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .tims-decode-pip{position:relative;width:8px;height:8px;border-radius:50%;background:${T.color.red};display:inline-block}
        .tims-decode-pip::after{content:"";position:absolute;inset:0;border-radius:50%;background:${T.alpha.gold55};animation:timsDecPip 2s cubic-bezier(.4,0,.2,1) infinite}
        @keyframes timsDecPip{0%{transform:scale(1);opacity:1}70%{transform:scale(3.25);opacity:0}100%{transform:scale(1);opacity:0}}
        .tims-spoken{animation:timsSpokenIn .5s cubic-bezier(.4,0,.2,1)}
        @keyframes timsSpokenIn{from{opacity:0;transform:translateY(8px)}}
        .tims-tap{display:inline-flex;align-items:center;background:${T.color.chipBg};border:1px solid ${T.alpha.cream10};border-radius:11px;padding:.55rem .85rem;font-family:${T.font.sans};font-size:.85rem;font-weight:600;color:${T.alpha.cream45};opacity:.32;transform:translateY(5px);transition:opacity .35s cubic-bezier(.65,0,.35,1),transform .42s cubic-bezier(.16,1,.3,1),background .35s cubic-bezier(.65,0,.35,1),color .35s cubic-bezier(.65,0,.35,1),box-shadow .35s cubic-bezier(.65,0,.35,1),border-color .35s cubic-bezier(.65,0,.35,1)}
        .tims-tap.tims-tap-lit{opacity:1;transform:none;background:linear-gradient(135deg,${T.color.red},${T.color.redDk});color:${T.color.cream};border-color:transparent;box-shadow:0 6px 16px -6px ${T.alpha.gold55}}
        @media(max-width:900px){.tims-prob-stage{grid-template-columns:1fr!important}}
        /* Infinite loops (live dot, pip ring, overdue pulse) pause while the section is off-screen. */
        #problem[data-offscreen] *,#problem[data-offscreen] *::before,#problem[data-offscreen] *::after{animation-play-state:paused!important}
        @media(prefers-reduced-motion:reduce){.tims-decode-pip::after{animation:none}}
      ` }} />

      <div className="tims-wrap tims-animate">
        <div style={{ marginBottom: 'clamp(2.4rem,6vw,4rem)' }}>
          <span className="tims-label-section">What the job taught me</span>
          <h2 style={{ fontFamily: T.font.display, fontWeight: 600, fontSize: T.size.display, letterSpacing: '-.015em', lineHeight: 1.02, margin: '1.1rem 0 .9rem', maxWidth: '18ch', color: T.color.ink }}>
            At 8 a.m., the line is eight cars deep.
          </h2>
          <p style={{ fontSize: 'clamp(1.05rem,2.2vw,1.28rem)', color: T.color.inkSoft, maxWidth: '46ch' }}>
            That&apos;s when a slow POS puts me over the timer, and car one has just changed their mind.
          </p>
        </div>

        {/* stage: the order decoded on the left, what it cost on the right */}
        <div className="tims-prob-stage" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,7fr) minmax(0,5fr)', gap: 'clamp(1rem,2.2vw,1.6rem)', marginTop: 'clamp(2.4rem,5vw,3.6rem)', alignItems: 'start' }}>
          <DecodePanel />

          <div style={{ display: 'grid', gap: 'clamp(.9rem,2vw,1.2rem)' }}>
            {TAKES.map(tk => (
              <div key={tk.title} style={{ background: T.color.paperWarm, border: `1px solid ${T.alpha.line}`, borderRadius: 18, padding: 'clamp(1.2rem,2.4vw,1.6rem)', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem', alignItems: 'start' }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: T.color.cream2, display: 'grid', placeContent: 'center', color: T.color.ink }}>
                  {tk.icon}
                </div>
                <p style={{ fontSize: '.97rem', lineHeight: 1.5, color: T.color.inkSoft, margin: 0 }}>
                  <b style={{ color: T.color.ink }}>{tk.title}</b>{' '}{tk.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="tims-animate" style={{ fontFamily: T.font.display, fontWeight: 500, fontSize: 'clamp(1.15rem,2.4vw,1.6rem)', lineHeight: 1.35, color: T.color.ink, maxWidth: '30ch', marginTop: 'clamp(2rem,4vw,3rem)' }}>
          Regulars ordered their Tims down to the last detail.{' '}
          <strong style={{ color: T.color.red }}>Every custom order cost me time on the clock.</strong>
        </p>
      </div>
    </section>
  )
}
