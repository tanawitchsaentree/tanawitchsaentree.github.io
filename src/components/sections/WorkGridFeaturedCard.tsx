'use client'

import { useCallback, Suspense, lazy, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ProjectFrontmatter } from '@/types/project'
import { LockGlyph, Tags } from './WorkGridAtoms'

const TimsiPadMockup = lazy(() =>
  import('@/demos/tims/TimsiPadMockup').then(m => ({ default: m.TimsiPadMockup }))
)

// ── Layout knobs — change here, nothing else breaks ────────────
const CARD_HEIGHT    = 'clamp(260px, 30vw, 400px)'
const IPAD_SCALE     = 0.52   // transform scale applied to the iframe
const IPAD_RIGHT     = '-6%'  // negative pushes iPad off right edge (more crop)
const IPAD_WIDTH     = '66%'  // clip container width relative to card
const IPAD_BLEED_PX  = 150    // px iPad is allowed to bleed below card bottom
const IFRAME_W       = 1200   // iframe native render width
const IFRAME_H       = 750    // iframe native render height
const TEXT_WIDTH     = '46%'  // left column width for title/summary

const EASE_DECISIVE = [0.16, 1, 0.3, 1] as const
const DURATION_SLOW = 0.48  // matches --duration-slow: 480ms

// ── Types ──────────────────────────────────────────────────────
interface Props {
  project:      ProjectFrontmatter
  locked:       boolean
  accentColor:  string
  hoverColor?:  string   // optional separate color for hover bloom; defaults to accentColor
  onOpen:       (slug: string) => void
  onNavigate:   (href: string) => void
  universePath: string | undefined
}

// ── FeaturedCard ───────────────────────────────────────────────
export function WorkGridFeaturedCard({ project, locked, accentColor, hoverColor, onOpen, onNavigate, universePath }: Props) {
  const reduced    = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const bloomColor = hoverColor ?? accentColor

  const handleClick = useCallback(() => {
    if (universePath) onNavigate(universePath)
    else onOpen(project.slug)
  }, [universePath, onNavigate, onOpen, project.slug])

  return (
    /*
     * Clip wrapper: iPad bleeds ONLY downward (IPAD_BLEED_PX).
     * Right / left / top are hard-clipped to card boundary.
     * This means right: '-6%' on the iPad container shifts content left
     * (shows less of right edge) without leaking outside the card.
     */
    <div style={{
      borderRadius: 'var(--radius-xl)',
      clipPath:     `inset(0 0 -${IPAD_BLEED_PX}px 0 round var(--radius-xl))`,
    }}>
      <motion.button
        type="button"
        onClick={handleClick}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -64px 0px' }}
        transition={{ duration: DURATION_SLOW, ease: EASE_DECISIVE }}
        className="group relative w-full text-left border-none cursor-pointer p-0"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          height:       CARD_HEIGHT,
          borderRadius: 'var(--radius-xl)',
          background:   `color-mix(in srgb, ${accentColor} 40%, var(--bg-elevated))`,
          fontFamily:   "'League Spartan', sans-serif",
          overflow:     'visible',
          boxShadow:    hovered
            ? '0 8px 32px -8px rgba(0,0,0,0.18), 0 2px 8px -2px rgba(0,0,0,0.10)'
            : 'var(--shadow-sm)',
          display:      'block',
          transform:    hovered ? 'translateY(-2px)' : 'translateY(0)',
          transition:   reduced ? undefined : [
            'box-shadow var(--duration-slow) var(--ease-out-standard)',
            'transform var(--duration-slow) var(--ease-out-standard)',
          ].join(', '),
        }}
        aria-label={`${project.title}${locked ? ' (password-protected)' : ''}`}
      >

        {/* iPad — right side, bleeds below via clipPath on wrapper */}
        <div
          aria-hidden="true"
          data-demo
          onClick={e => e.stopPropagation()}
          style={{
            position:      'absolute',
            right:         IPAD_RIGHT,
            top:           0,
            width:         IPAD_WIDTH,
            height:        `calc(100% + ${IPAD_BLEED_PX}px)`,
            overflow:      'hidden',
            pointerEvents: 'none',
          }}
        >
          {/* iframe at native size, scaled down anchored to bottom-right */}
          <div style={{
            position:        'absolute',
            bottom:          0,
            right:           0,
            width:           IFRAME_W,
            height:          IFRAME_H,
            transform:       `scale(${IPAD_SCALE})`,
            transformOrigin: 'bottom right',
            pointerEvents:   'none',
          }}>
            <Suspense fallback={null}>
              <TimsiPadMockup />
            </Suspense>
          </div>

        </div>

        {/* Text — bottom-left */}
        <div style={{
          position:      'absolute',
          bottom:        0,
          left:          0,
          width:         TEXT_WIDTH,
          padding:       'var(--space-8)',
          display:       'flex',
          flexDirection: 'column',
          gap:           'var(--space-2)',
          zIndex:        2,
        }}>
          <Tags tags={project.tags} max={4} />

          <h3 style={{
            fontSize:      'clamp(var(--type-xl), 2.2vw, var(--type-3xl))',
            fontWeight:    800,
            letterSpacing: '-0.02em',
            lineHeight:    1.05,
            color:         'var(--fg)',
            margin:        0,
          }}>
            {locked && <span style={{ marginRight: 'var(--space-2)', opacity: 0.4 }}><LockGlyph /></span>}
            {project.title}
          </h3>

          <p style={{
            fontSize:   'var(--type-base)',
            lineHeight: 1.55,
            color:      'var(--fg-muted)',
            margin:     0,
          }}>
            {project.summary}
          </p>
        </div>
      </motion.button>
    </div>
  )
}
