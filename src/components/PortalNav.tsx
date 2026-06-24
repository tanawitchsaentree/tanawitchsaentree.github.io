'use client'

/**
 * PortalNav — the signature entry moment, as ONE continuous object.
 *
 * Three cards exist the entire time — they never unmount, so nothing ever
 * "disappears then reappears". The same three elements simply move between
 * three phases:
 *   idle  — stacked dead-centre, only the front (About) card visible, greeting
 *           typing below it.
 *   hover — the two behind slide a crack out from under the front, fast-out,
 *           foreshadowing the split. Greeting swaps to "Learn more about me?".
 *   open  — the very same three cards glide apart into Work · About · Contact
 *           doors. One motion, fully continuous from the hover pose.
 *
 * Each card is a silent looping clip with a tiny poster — no WebGL.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Typewriter } from '@/components/ui/Typewriter'

export type Door = 'work' | 'about' | 'contact'

type Phase = 'idle' | 'hover' | 'open'

/**
 * CardMedia — the looping clip, but only DECODING when it should be on screen.
 * Three simultaneous video decodes during a transform is what makes the split
 * stutter; pausing the occluded/idle clips keeps the GPU free for the animation.
 */
function CardMedia({ video, poster, active, load }: {
  video?: string; poster?: string; active: boolean; load: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (active) { const p = v.play(); if (p?.catch) p.catch(() => {}) }
    else v.pause()
  }, [active, load])

  if (video) {
    return (
      <div className="absolute inset-0">
        {/* poster (tiny jpg) shows instantly; the clip lazy-attaches on top
            once this card is needed, so idle never fetches all three videos */}
        {poster && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={poster} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover object-center select-none" />
        )}
        {load && (
          <video
            ref={ref}
            src={video}
            poster={poster}
            loop muted playsInline preload="metadata"
            className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
          />
        )}
      </div>
    )
  }
  /* eslint-disable-next-line @next/next/no-img-element */
  if (poster) return <img src={poster} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover object-center select-none" />
  return <div className="absolute inset-0 bg-[var(--bg-muted)]" aria-hidden="true" />
}

interface CardDef {
  id: Door; label: string; z: number
  video?: string; poster?: string   // poster shows while the loop loads
}

// About is the front/live card (highest z); Work fans left, Contact fans right.
// Each card plays a silent looping clip (dribbble vibe), with its still as poster.
const CARDS: CardDef[] = [
  { id: 'work',    label: 'Work',    z: 1, video: '/images/work.mp4',      poster: '/images/work.jpg' },
  { id: 'about',   label: 'About',   z: 3, video: '/images/home-hero.mp4', poster: '/images/home-hero.jpg' },
  { id: 'contact', label: 'Contact', z: 2, video: '/images/contact.mp4',   poster: '/images/contact.jpg' },
]


const EASE_DECISIVE = [0.16, 1, 0.3, 1] as const   // fast-out, settle (hover)
const EASE_SMOOTH   = [0.65, 0, 0.35, 1] as const  // ease-in-out, unhurried (split)

// One greeting is picked at random on every fresh visit (client-side, after
// mount — keeps SSR markup stable, then swaps in once hydrated).
const GREETINGS = [
  'Hey, how are you?',
  'Hi there — glad you stopped by.',
  'Hello! Good to see you here.',
  'Hey, welcome in.',
  'Hi — thanks for dropping by.',
  'Hey there, make yourself at home.',
  'Hello, hello.',
  'Hey! You found me.',
  'Hi — happy you’re here.',
  'Welcome — pull up a chair.',
  'Hey, coffee’s on me if you’re ever in Bangkok.',
  'Hi from Bangkok — what time is it where you are?',
  'Hey there, hope your day’s treating you kindly.',
  'Hello! Hope you’re caffeinated.',
  'Hey — long road brought me here, glad you came too.',
  'Hi! Still building, still curious.',
  'Hey, no map, but I made it this far. Welcome.',
  'Hello — I design things, I build things, come look.',
  'Hi there — let’s make something that actually ships.',
  'Hey! Tell me you’re here to talk shop.',
  'Hi — I promise this’ll be a good read.',
  'Hey there, thanks for giving me a minute.',
  'Hello! You’re exactly the kind of person I hoped would visit.',
  'Hey — if you’re hiring, even better. Welcome.',
  'Hi! Let’s see if we’re a fit.',
  'Hey, glad the algorithm sent you my way.',
  'Hello — seven years in, still excited about this stuff.',
  'Hi there — I’ll keep it honest and human, promise.',
] as const

// Per-card transform for each phase.
function place(id: Door, phase: Phase) {
  if (phase === 'open') {
    const x = id === 'work' ? -232 : id === 'contact' ? 232 : 0
    return { x, y: 0, rotate: 0 }
  }
  if (phase === 'hover') {
    // fan out like a hand of cards — enough to clearly peek the two behind,
    // foreshadowing the split into three doors.
    if (id === 'work')    return { x: -88, y: 10, rotate: -7 }
    if (id === 'contact') return { x: 88,  y: 16, rotate: 7 }
    return { x: 0, y: -12, rotate: 0 } // about lifts in front
  }
  return { x: 0, y: 0, rotate: 0 } // idle — perfectly stacked
}

interface PortalNavProps {
  onEnter: (door: Door) => void
}

export function PortalNav({ onEnter }: PortalNavProps) {
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState<Phase>('idle')
  const [greeting, setGreeting] = useState<string>(GREETINGS[0])  // stable for SSR
  const [moving, setMoving] = useState(false)   // true during the split/back glide

  // pick a fresh greeting once on the client (avoids hydration mismatch)
  useEffect(() => {
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)])
  }, [])

  // Intro choreography: nothing is visible at first, then pill → card → greeting
  // rise in sequence (the page "greets" you rather than just finishing loading).
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60)
    return () => clearTimeout(t)
  }, [])

  const [everOpened, setEverOpened] = useState(false)  // gate loading the back clips
  const open = phase === 'open'

  // Pause every clip while the cards are gliding, resume once settled — so no
  // video decode competes with the transform.
  const settle = useCallback((ms: number) => {
    setMoving(true)
    const t = setTimeout(() => setMoving(false), ms)
    return () => clearTimeout(t)
  }, [])

  const enterHover = useCallback(() => setPhase(p => (p === 'open' ? p : 'hover')), [])
  const leaveHover = useCallback(() => setPhase(p => (p === 'open' ? p : 'idle')), [])
  const split      = useCallback(() => { setEverOpened(true); setPhase('open'); settle(740) }, [settle])
  const collapse   = useCallback(() => { setPhase('idle'); settle(740) }, [settle])

  // Cards keep a FIXED size and never scale — they only slide apart. Constant
  // box = the label glues to top-full perfectly (no scale skew, no math) and
  // there's no transform competing with the glide.
  // split/back = slow & smooth. hover = a soft, gentle lift (not snappy).
  const moveTransition = reduced
    ? { duration: 0 }
    : open
      ? { duration: 0.72, ease: EASE_SMOOTH }      // unhurried split, not sluggish
      : phase === 'hover'
        ? { duration: 0.5, ease: EASE_SMOOTH }     // gentle lift up
        : { duration: 0.55, ease: EASE_SMOOTH }    // gentle settle back

  return (
    <div className="relative w-full min-h-[calc(100svh-2.75rem)]">
      {/* the three cards — always mounted, centred, transformed per phase */}
      {CARDS.map(card => {
        const pos = reduced ? { x: 0, y: 0, rotate: 0 } : place(card.id, phase)
        const isDoor = open
        // play: front card when stacked; all three once split — but never while gliding
        const mediaActive = !moving && (open || card.id === 'about')
        // front card loads at once; the other two only after the first open
        const mediaLoad = card.id === 'about' || everOpened
        return (
          // Wrapper is exactly the card box (208×224) and carries the glide
          // transforms. The label sits at top-full, glued to the real bottom
          // edge and auto-centred — no scale skew, no math.
          <motion.div
            key={card.id}
            className="absolute inset-0 m-auto pointer-events-none"
            style={{ zIndex: card.z, width: 208, height: 224, willChange: 'transform, opacity' }}
            initial={false}
            animate={{
              x: pos.x,
              // front card rises 24px on intro; back cards stay put behind it
              y: !entered && card.id === 'about' ? pos.y + 24 : pos.y,
              rotate: pos.rotate,
              // only the visible front card fades in; back cards are occluded anyway
              opacity: card.id === 'about' && !entered ? 0 : 1,
            }}
            transition={
              entered
                ? moveTransition
                : { duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.18, ease: EASE_DECISIVE }
            }
          >
            <motion.button
              type="button"
              onClick={() => (open ? onEnter(card.id) : split())}
              onMouseEnter={open ? undefined : enterHover}
              onMouseLeave={open ? undefined : leaveHover}
              onFocus={open ? undefined : enterHover}
              onBlur={open ? undefined : leaveHover}
              aria-label={open ? card.label : 'Open — Tanawitch Saentree portfolio'}
              className="group relative grid place-items-center overflow-hidden bg-[var(--bg-elevated)] p-0 cursor-pointer pointer-events-auto w-full h-full focus-visible:outline-2 focus-visible:outline-[var(--fg)] focus-visible:outline-offset-2"
              style={{ borderRadius: 40, border: '2.5px solid var(--fg-on-cover)', willChange: 'transform' }}
              initial={false}
              animate={{
                boxShadow: phase === 'hover' && card.id === 'about'
                  ? '0 18px 40px -12px var(--shadow-color-mid)'
                  : '0 0px 0px 0px rgba(0,0,0,0)',
              }}
              transition={moveTransition}
              /* once a door, each card lifts + grows slightly on hover */
              whileHover={open && !reduced ? { y: -10, scale: 1.04 } : undefined}
              whileTap={open && !reduced ? { scale: 0.98 } : undefined}
            >
              <CardMedia video={card.video} poster={card.poster} active={mediaActive} load={mediaLoad} />
              {/* hover scrim + arrow cue — only as a door */}
              {isDoor && (
                <span
                  className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-base)] ease-[var(--ease-out-quick)]"
                  style={{ background: 'color-mix(in srgb, var(--fg) 28%, transparent)' }}
                  aria-hidden="true"
                >
                  <span className="font-sans text-[var(--fg-on-cover)]" style={{ fontSize: 22 }}>↗</span>
                </span>
              )}
            </motion.button>

            {/* door label — full-width flex row pinned under the card centres
                it; the motion.span only animates opacity/y so Framer's transform
                never fights a translate-x (the bug that pushed it off-centre). */}
            <AnimatePresence>
              {isDoor && (
                <div className="absolute inset-x-0 top-full mt-3.5 flex justify-center pointer-events-none">
                  <motion.span
                    className="whitespace-nowrap font-sans text-[var(--fg)]"
                    style={{ fontSize: 14, fontWeight: 400 }}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: reduced ? 0 : 0.22, ease: EASE_DECISIVE }}
                  >
                    {card.label}
                  </motion.span>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}

      {/* status pill — above the stack, gone once split */}
      <AnimatePresence>
        {!open && (
          <motion.div
            key="pill"
            className="absolute inset-x-0 m-auto flex items-center justify-center pointer-events-none px-6"
            style={{ top: 'calc(50% - 196px)' }}
            initial={{ opacity: 0, y: 14 }}
            animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.55, delay: reduced ? 0 : 0.05, ease: EASE_DECISIVE }}
          >
            <span
              className="inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg)] whitespace-nowrap"
              style={{ borderRadius: 14, fontSize: 14, padding: '10px 18px', lineHeight: 1.2 }}
            >
              <span aria-hidden="true">🪴</span>
              <span>
                I design experience and build at{' '}
                <strong className="font-semibold">Allianz Technology</strong>
              </span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* greeting — the hero line. Sits well below the card in its own pool of
          space (≈2× the gap above the card) so the eye lands on it, and it only
          starts typing after the pill + card have risen. */}
      <AnimatePresence>
        {!open && (
          <motion.div
            key="greeting"
            className="absolute inset-x-0 m-auto flex items-center justify-center pointer-events-none px-6"
            style={{ top: 'calc(50% + 200px)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.5, delay: reduced ? 0 : 0.5, ease: EASE_DECISIVE }}
          >
            <Typewriter
              key={phase === 'hover' ? 'hover' : 'idle'}
              lines={[[{ text: phase === 'hover' ? 'Learn more about me?' : greeting }]]}
              speed={26}
              startDelay={phase === 'hover' ? 120 : 850}
              className="font-mono text-[var(--type-base)] text-[var(--fg)] tracking-[0.01em] text-center"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* back — arrow only, appears when open */}
      <AnimatePresence>
        {open && (
          <motion.button
            key="back"
            type="button"
            onClick={collapse}
            aria-label="Back to start"
            className="absolute inset-x-0 m-auto w-max text-[var(--type-lg)] text-[var(--fg-subtle)] hover:text-[var(--fg)] bg-transparent border-none cursor-pointer transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]"
            style={{ top: 'calc(50% + 220px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            ←
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
