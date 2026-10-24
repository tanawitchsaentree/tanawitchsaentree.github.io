'use client'

import { useEffect, useRef } from 'react'
import { V } from './tokens'
import { VitaeAppScreen } from './Reframe/VitaeAppScreen'

const SCENES = [
  {
    tag:   'Concept 01',
    h:     <>The first idea was an absolute <em>0–100.</em></>,
    p:     'Product loved it. One universal number, simple to grasp. We built it.',
    dark:  false,
  },
  {
    tag:   'Clinical review',
    h:     <>It died in <em>ten minutes.</em></>,
    p:     'An absolute health number implies a medical claim. A confident "78" on the morning you are coming down with something would falsely reassure you, and that is dangerous.',
    dark:  true,
  },
  {
    tag:   'The reframe',
    h:     <>Score the day against <em>your own</em> baseline.</>,
    p:     'The score compares today with your own last 14 days. It makes no claim about your health, and it is still one number you can read at a glance.',
    dark:  false,
  },
] as const


// Scroll-melt choreography. Progress p runs 0→1 while the 460vh film scrolls past the
// sticky stage. Background melts paper → ink (28%) → lime (55%) → paper (90%). It is
// painted by stacked colour layers whose OPACITY animates, so the melt stays on the
// compositor. Scene text crossfades between an ink copy and a paper copy for the same
// reason. Browsers with CSS scroll-driven animations scrub it natively (no JS on
// scroll); everywhere else an IntersectionObserver steps the stage through 3 states.
const PAR = V.motion.reframeParallax
const PY1 = V.motion.distanceReveal * 0.35
const PY2 = V.motion.distanceReveal * 0.18
const EASE = V.ease.smoothInOut
const px = (n: number) => `${Math.round(n * 10) / 10}px`
// scene i peaks at its centre c = (i + .5) / 3 and fades over ±0.2 of progress
const sceneKF = [
  `0%{opacity:.17;transform:translateY(${px(PAR / 6)})}16.67%{opacity:1;transform:none}36.67%{opacity:0;transform:translateY(${px(-PAR * 0.2)})}100%{opacity:0;transform:translateY(${px(-PAR * 5 / 6)})}`,
  `0%{opacity:0;transform:translateY(${px(PAR / 2)})}30%{opacity:0;transform:translateY(${px(PAR * 0.2)})}50%{opacity:1;transform:none}70%{opacity:0;transform:translateY(${px(-PAR * 0.2)})}100%{opacity:0;transform:translateY(${px(-PAR / 2)})}`,
  `0%{opacity:0;transform:translateY(${px(PAR * 5 / 6)})}63.33%{opacity:0;transform:translateY(${px(PAR * 0.2)})}83.33%{opacity:1;transform:none}100%{opacity:.17;transform:translateY(${px(-PAR / 6)})}`,
]
const PHONE_MID = `translate(-5%,${px(-PY1)}) scale(1.04) rotate(-1.5deg)`
const PHONE_END = `translate(0,${px(-PY2)}) scale(.95) rotate(1deg)`

const CSS = `
.vr-film{position:relative;height:460vh;view-timeline-name:--vr-film;view-timeline-axis:block}
.vr-trig{position:absolute;left:0;width:1px;height:120vh;pointer-events:none}
.vr-stage{background:${V.color.paper}}
.vr-layer{position:absolute;inset:0;z-index:0;opacity:0;pointer-events:none;transition:opacity ${V.motion.durationBase} ${EASE}}
.vr-layer--ink{background:${V.color.ink}}
.vr-layer--lime{background:${V.color.lime}}
.vr-cols{position:relative;z-index:1}
.vr-set{position:absolute;inset:0;transition:opacity ${V.motion.durationBase} ${EASE}}
.vr-set--ink{color:${V.color.ink}}
.vr-set--light{color:${V.color.paper};opacity:0}
.vr-scene{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;opacity:0;transform:translateY(${px(PAR * 0.2)});transition:opacity ${V.motion.durationBase} ${EASE},transform ${V.motion.durationBase} ${EASE}}
.vr-phone{position:relative;z-index:1;justify-self:center;transition:transform ${V.motion.durationBase} ${EASE}}
/* stepped fallback */
.vr-film[data-step="0"] .vr-s0,.vr-film[data-step="1"] .vr-s1,.vr-film[data-step="2"] .vr-s2{opacity:1;transform:none}
.vr-film[data-step="1"] .vr-s0,.vr-film[data-step="2"] .vr-s0,.vr-film[data-step="2"] .vr-s1{transform:translateY(${px(-PAR * 0.2)})}
.vr-film[data-step="1"] .vr-layer--ink,.vr-film[data-step="1"] .vr-set--light{opacity:1}
.vr-film[data-step="1"] .vr-set--ink{opacity:0}
.vr-film[data-step="2"] .vr-layer--lime{opacity:.22}
.vr-film[data-step="1"] .vr-phone{transform:${PHONE_MID}}
.vr-film[data-step="2"] .vr-phone{transform:${PHONE_END}}
@keyframes vr-ink{0%{opacity:0}28%{opacity:1}55%{opacity:1}55.1%{opacity:0}100%{opacity:0}}
@keyframes vr-lime{0%{opacity:0}28%{opacity:0}55%{opacity:1}90%{opacity:0}100%{opacity:0}}
@keyframes vr-light{0%{opacity:0}28%{opacity:1}55%{opacity:0}100%{opacity:0}}
@keyframes vr-dark{0%{opacity:1}28%{opacity:0}55%{opacity:1}100%{opacity:1}}
@keyframes vr-s0{${sceneKF[0]}}
@keyframes vr-s1{${sceneKF[1]}}
@keyframes vr-s2{${sceneKF[2]}}
@keyframes vr-phone{0%{transform:none}45%{transform:${PHONE_MID}}100%{transform:${PHONE_END}}}
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .vr-film .vr-layer,.vr-film .vr-set,.vr-film .vr-scene,.vr-film .vr-phone{transition:none;animation-fill-mode:both;animation-timing-function:${EASE};animation-timeline:--vr-film;animation-range:contain 0% contain 100%}
    .vr-film .vr-layer--ink{animation-name:vr-ink}
    .vr-film .vr-layer--lime{animation-name:vr-lime}
    .vr-film .vr-set--light{animation-name:vr-light}
    .vr-film .vr-set--ink{animation-name:vr-dark}
    .vr-film .vr-s0{animation-name:vr-s0}
    .vr-film .vr-s1{animation-name:vr-s1}
    .vr-film .vr-s2{animation-name:vr-s2}
    .vr-film .vr-phone{animation-name:vr-phone}
  }
}
@media (prefers-reduced-motion: reduce) {
  .vr-layer,.vr-set,.vr-scene,.vr-phone{transition:none}
}
`

const H_STYLE = {
  fontFamily:    V.font.serif,
  fontWeight:    300,
  fontSize:      'clamp(2rem,4.6vw,3.8rem)',
  lineHeight:    1.04,
  letterSpacing: '-.022em',
  maxWidth:      '15ch',
  margin:        '0 0 1.3rem',
} as const

function SceneSet({ light }: { light?: boolean }) {
  return (
    <div className={`vr-set ${light ? 'vr-set--light' : 'vr-set--ink'}`} aria-hidden={light || undefined}>
      {SCENES.map((sc, i) => (
        <div key={sc.tag} className={`vr-scene vr-s${i}`}>
          <div
            style={{
              fontFamily:    V.font.mono,
              fontSize:      V.size.eyebrow,
              letterSpacing: '.22em',
              textTransform: 'uppercase',
              marginBottom:  '1.2rem',
              opacity:       0.75,
            }}
          >
            {sc.tag}
          </div>
          {light ? <div style={H_STYLE}>{sc.h}</div> : <h2 style={H_STYLE}>{sc.h}</h2>}
          <p
            style={{
              fontFamily: V.font.sans,
              fontSize:   '1.08rem',
              maxWidth:   '40ch',
              lineHeight: 1.65,
              margin:     0,
              opacity:    0.75,
            }}
          >
            {sc.p}
          </p>
        </div>
      ))}
    </div>
  )
}

export function VitaeReframe() {
  const filmRef = useRef<HTMLDivElement>(null)
  const trigRefs = useRef<(HTMLDivElement | null)[]>([])

  // Three state changes over the whole film; drives the fallback / reduced-motion view.
  useEffect(() => {
    const film = filmRef.current
    if (!film) return
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) film.dataset.step = (e.target as HTMLElement).dataset.i ?? '0'
      }),
      { rootMargin: '-50% 0px -50% 0px' },
    )
    trigRefs.current.forEach(t => { if (t) io.observe(t) })
    return () => io.disconnect()
  }, [])

  return (
    <div ref={filmRef} id="reframe" className="vr-film" data-step="0">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {/* scroll triggers: segment i covers progress [i/3, (i+1)/3] at the viewport centre line */}
      {[0, 1, 2].map(i => (
        <div
          key={i}
          ref={el => { trigRefs.current[i] = el }}
          data-i={i}
          aria-hidden
          className="vr-trig"
          style={{ top: `calc(50vh + ${i * 120}vh)` }}
        />
      ))}
      <div
        style={{
          position:      'sticky',
          top:           0,
          height:        '100vh',
          overflow:      'hidden',
          display:       'grid',
          gridTemplateColumns: '1.05fr .95fr',
          alignItems:    'center',
          gap:           'clamp(2rem,5vw,5rem)',
          padding:       '0 clamp(1.4rem,5vw,7.5rem)',
        }}
        className="vitae-reframe-stage vr-stage"
      >
        {/* scenes column: ink copy + paper copy crossfade instead of animating colour */}
        <div className="vr-cols" style={{ position: 'relative', height: '58vh' }}>
          <SceneSet />
          <SceneSet light />
        </div>

        <span aria-hidden className="vr-layer vr-layer--ink" />
        <span aria-hidden className="vr-layer vr-layer--lime" />

        {/* phone column: shell + animated app screen */}
        <div className="vr-phone">
          <div
            style={{
              width:        'clamp(228px, 26vw, 300px)',
              aspectRatio:  '9 / 19.3',
              borderRadius: '13% / 6.5%',
              padding:      '2.6%',
              background:   V.gradient.phoneShell,
              boxShadow:    V.shadow.phoneRing,
              flexShrink:   0,
              position:     'relative',
            }}
          >
            <div
              style={{
                width:        '100%',
                height:       '100%',
                borderRadius: '11% / 5.6%',
                overflow:     'hidden',
                position:     'relative',
                background:   V.color.screenBg,
              }}
            >
              <VitaeAppScreen />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
