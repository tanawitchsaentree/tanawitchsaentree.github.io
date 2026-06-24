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
 * Reuses MorphParticles (a loop per card) — nothing new invented.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { MorphParticles } from '@/components/ui/MorphParticles'
import { Typewriter } from '@/components/ui/Typewriter'

export type Door = 'work' | 'about' | 'contact'

type Phase = 'idle' | 'hover' | 'open'

/**
 * CardMedia — the looping clip, but only DECODING when it should be on screen.
 * Three simultaneous video decodes during a transform is what makes the split
 * stutter; pausing the occluded/idle clips keeps the GPU free for the animation.
 */
function CardMedia({ video, poster, shape, active }: {
  video?: string; poster?: string; shape: number; active: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (active) { const p = v.play(); if (p?.catch) p.catch(() => {}) }
    else v.pause()
  }, [active])

  if (video) {
    return (
      <video
        ref={ref}
        src={video}
        poster={poster}
        loop muted playsInline preload="metadata"
        className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
      />
    )
  }
  if (poster) {
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img src={poster} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover object-center select-none" />
  }
  return <MorphParticles shapeIndex={shape} className="absolute inset-0 w-full h-full" />
}

interface CardDef {
  id: Door; label: string; shape: number; z: number
  video?: string; poster?: string   // poster shows while the loop loads
}

// About is the front/live card (highest z); Work fans left, Contact fans right.
// Each card plays a silent looping clip (dribbble vibe), with its still as poster.
const CARDS: CardDef[] = [
  { id: 'work',    label: 'Work',    shape: 1, z: 1, video: '/images/work.mp4' },
  { id: 'about',   label: 'About',   shape: 0, z: 3, video: '/images/home-hero.mp4' },
  { id: 'contact', label: 'Contact', shape: 3, z: 2, video: '/images/contact.mp4' },
]


const EASE_DECISIVE = [0.16, 1, 0.3, 1] as const   // fast-out, settle (hover)
const EASE_SMOOTH   = [0.65, 0, 0.35, 1] as const  // ease-in-out, unhurried (split)

// Per-card transform for each phase.
function place(id: Door, phase: Phase) {
  if (phase === 'open') {
    const x = id === 'work' ? -232 : id === 'contact' ? 232 : 0
    return { x, y: 0, rotate: 0 }
  }
  if (phase === 'hover') {
    if (id === 'work')    return { x: -24, y: 4,  rotate: -4 }
    if (id === 'contact') return { x: 24,  y: 8,  rotate: 4 }
    return { x: 0, y: -8, rotate: 0 } // about lifts — gentle
  }
  return { x: 0, y: 0, rotate: 0 } // idle — perfectly stacked
}

interface PortalNavProps {
  onEnter: (door: Door) => void
}

export function PortalNav({ onEnter }: PortalNavProps) {
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState<Phase>('idle')
  const [moving, setMoving] = useState(false)   // true during the split/back glide
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
  const split      = useCallback(() => { setPhase('open'); settle(740) }, [settle])
  const collapse   = useCallback(() => { setPhase('idle'); settle(740) }, [settle])

  // Card keeps a FIXED pixel size; the open state only scales it down.
  // Animating transform (scale) instead of width/height keeps it on the GPU
  // compositor — no per-frame layout reflow, so the split stays smooth.
  const cardScale = open ? 0.84 : 1

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
        return (
          /* whole column (card + label) carries the x/y/rotate so the label
             travels with its card — no overlap when split */
          <motion.div
            key={card.id}
            className="absolute inset-0 m-auto flex flex-col items-center gap-4 w-max h-max pointer-events-none"
            style={{ zIndex: open ? 1 : card.z, willChange: 'transform' }}
            initial={false}
            animate={{ x: pos.x, y: pos.y, rotate: pos.rotate }}
            transition={moveTransition}
          >
            <motion.button
              type="button"
              onClick={() => (open ? onEnter(card.id) : split())}
              onMouseEnter={open ? undefined : enterHover}
              onMouseLeave={open ? undefined : leaveHover}
              onFocus={open ? undefined : enterHover}
              onBlur={open ? undefined : leaveHover}
              aria-label={open ? card.label : 'Open — Tanawitch Saentree portfolio'}
              className="group relative grid place-items-center overflow-hidden bg-[var(--bg-elevated)] p-0 cursor-pointer pointer-events-auto focus-visible:outline-2 focus-visible:outline-[var(--fg)] focus-visible:outline-offset-2"
              style={{
                width: 208, height: 224,
                borderRadius: 40,
                border: '2.5px solid var(--fg-on-cover)',
                willChange: 'transform',
              }}
              initial={false}
              animate={{
                scale: cardScale,
                boxShadow: phase === 'hover' && card.id === 'about'
                  ? '0 18px 40px -12px var(--shadow-color-mid)'
                  : '0 0px 0px 0px rgba(0,0,0,0)',
              }}
              transition={moveTransition}
            >
              <CardMedia video={card.video} poster={card.poster} shape={card.shape} active={mediaActive} />
            </motion.button>

            {/* door label — absolutely positioned BELOW the card so it never
                changes the column height (no layout bounce on enter/exit) */}
            <AnimatePresence>
              {isDoor && (
                <motion.span
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-4 whitespace-nowrap font-sans font-medium text-[var(--type-sm)] tracking-[0.01em] text-[var(--fg)]"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: reduced ? 0 : 0.22, ease: EASE_DECISIVE }}
                >
                  {card.label}
                </motion.span>
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
            style={{ top: 'calc(50% - 188px)' }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4, ease: EASE_DECISIVE }}
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

      {/* greeting line — lives below the stack, gone once split */}
      <AnimatePresence>
        {!open && (
          <motion.div
            key="greeting"
            className="absolute inset-x-0 m-auto flex items-center justify-center pointer-events-none"
            style={{ top: 'calc(50% + 148px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <Typewriter
              key={phase === 'hover' ? 'hover' : 'idle'}
              lines={[[{ text: phase === 'hover' ? 'Learn more about me?' : 'Hey, how are you?' }]]}
              speed={26}
              className="font-mono text-[var(--type-sm)] text-[var(--fg-muted)] tracking-[0.02em]"
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
