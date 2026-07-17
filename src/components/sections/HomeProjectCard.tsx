'use client'

/**
 * HomeProjectCard — Maya Gao style: colored bg, component screenshot centered inside.
 *
 * Layout: fixed-height card, bg color from project token.
 * Component renders at native size × zoom, centered horizontally,
 * anchored to top with paddingTop breathing room.
 * overflow:hidden on card clips the bottom — shows a contained screenshot, not full-bleed.
 *
 * Schema per slug: { Component, nativeW, nativeH, zoom, bg, offsetY }
 * offsetY — nudge component down (positive) or up (negative) to frame the best part.
 */

import { Suspense, lazy } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ProjectFrontmatter } from '@/types/project'

const TimsiPad     = lazy(() => import('@/demos/tims/TimsiPadMockup').then(m => ({ default: m.TimsiPadMockup })))
const InvitraceCov = lazy(() => import('@/demos/allianz/InvitraceCover').then(m => ({ default: m.InvitraceCover })))
const ProfitaCov   = lazy(() => import('@/demos/profita/ProfitaCover').then(m => ({ default: m.ProfitaCover })))
const StellarCov   = lazy(() => import('@/demos/stellar/ui/StellarScreen1').then(m => ({
  default: function StellarPreview() { return m.StellarScreen1({ preview: true }) },
})))
const VitaeCov     = lazy(() => import('@/demos/vitae/Reframe/VitaeAppScreen').then(m => ({ default: m.VitaeAppScreen })))

interface CoverSchema {
  Component: React.ComponentType<Record<string, unknown>>
  nativeW:   number   // px — component's own declared width
  nativeH:   number   // px — component's own declared height
  zoom:      number   // scale factor
  bg:        string   // card background
  offsetY:   number   // px nudge after scaling (positive = move down into card)
}

// nativeW/nativeH = explicit container size passed to the component's wrapper
// TimsiPadMockup is fluid (width:100% aspectRatio:16/10) so we wrap it in a fixed box
const COVERS: Record<string, CoverSchema> = {
  'tims-pos': {
    Component: TimsiPad,
    nativeW:   900,
    nativeH:   562,
    zoom:      0.55,
    bg:        'color-mix(in srgb, var(--cover-tims) 88%, var(--color-black))',
    offsetY:   32,
  },
  'invitrace-design-system': {
    Component: InvitraceCov,
    nativeW:   900,
    nativeH:   700,
    zoom:      0.48,
    bg:        'color-mix(in srgb, var(--cover-invitrace) 12%, var(--bg-elevated))',
    offsetY:   28,
  },
  'allianz-doc-classification': {
    Component: InvitraceCov,
    nativeW:   900,
    nativeH:   700,
    zoom:      0.48,
    bg:        'color-mix(in srgb, var(--cover-invitrace) 12%, var(--bg-elevated))',
    offsetY:   28,
  },
  'profita-mutual-fund': {
    Component: ProfitaCov,
    nativeW:   900,
    nativeH:   700,
    zoom:      0.48,
    bg:        'color-mix(in srgb, var(--cover-profita) 12%, var(--bg-elevated))',
    offsetY:   28,
  },
  'stellareat': {
    Component: StellarCov,
    nativeW:   340,
    nativeH:   720,
    zoom:      0.82,
    bg:        'color-mix(in srgb, var(--cover-stellar) 55%, var(--color-black))',
    offsetY:   24,
  },
  'vitae': {
    Component: VitaeCov,
    nativeW:   300,
    nativeH:   632,
    zoom:      0.88,
    bg:        'color-mix(in srgb, var(--cover-vitae) 55%, var(--color-black))',
    offsetY:   24,
  },
}

const CARD_H = 380

interface Props {
  project:      ProjectFrontmatter
  index:        number
  onOpen:       (slug: string) => void
  onNavigate:   (href: string) => void
  universePath: string | undefined
}

export function HomeProjectCard({ project, index, onOpen, onNavigate, universePath }: Props) {
  const reduced = useReducedMotion()
  const cover = COVERS[project.slug]
  const bg    = cover?.bg ?? 'var(--bg-elevated)'

  const handleClick = () => {
    if (universePath) onNavigate(universePath)
    else onOpen(project.slug)
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={reduced ? undefined : { y: -3, scale: 1.015 }}
      viewport={{ once: true, margin: '0px 0px 60px 0px' }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group relative w-full text-left border-none cursor-pointer p-0"
      style={{
        height:       CARD_H,
        borderRadius: 'var(--radius-xl)',
        background:   bg,
        overflow:     'hidden',
        display:      'block',
        fontFamily:   "'League Spartan', sans-serif",
        boxShadow:    'var(--shadow-sm)',
      }}
      aria-label={project.title}
    >
      {cover && (
        <div
          aria-hidden="true"
          data-demo
          onClick={e => e.stopPropagation()}
          style={{
            position:        'absolute',
            top:             cover.offsetY,
            left:            '50%',
            width:           cover.nativeW,
            height:          cover.nativeH,
            transform:       `translateX(-50%) scale(${cover.zoom})`,
            transformOrigin: 'top center',
            pointerEvents:   'none',
          }}
        >
          <Suspense fallback={null}>
            <cover.Component />
          </Suspense>
        </div>
      )}
    </motion.button>
  )
}
