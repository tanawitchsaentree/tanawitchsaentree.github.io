'use client'

import { useCallback, Suspense, lazy } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ProjectFrontmatter } from '@/types/project'
import { LockGlyph, Tags } from './WorkGridAtoms'

// Lazy demo covers
const InvitraceCover = lazy(() =>
  import('@/demos/allianz/InvitraceCover').then(m => ({ default: m.InvitraceCover }))
)
const StellarCover = lazy(() =>
  import('@/demos/stellar/ui/StellarScreen1').then(m => ({
    default: () => m.StellarScreen1({ preview: true }),
  }))
)
const VitaeCover = lazy(() =>
  import('@/demos/vitae/Reframe/VitaeAppScreen').then(m => ({ default: m.VitaeAppScreen }))
)

// ── Layout knobs ───────────────────────────────────────────────
const CARD_H       = 420   // px
const TEXT_H       = 160   // px — bottom text zone height (split variant)
const PREVIEW_H    = CARD_H - TEXT_H   // 260px visible preview zone
const FADE_BLEED   = 32    // px — how far the fade overlaps the preview zone
const OVERLAY_INSET_TOP = 24  // px — breathing room above phone in overlay variant

// ── Cover registry — add new slugs here ───────────────────────
// variant 'split'   → component top portion, text zone on solid bg below
// variant 'overlay' → component full-bleed, dark gradient scrim, white text over
// Both Invitrace slugs share the same cover intentionally — same design system, different case.
type CoverDef = {
  Component: React.ComponentType
  zoom:      number
  variant:   'split' | 'overlay'
}
export const COVERS: Record<string, CoverDef> = {
  'invitrace-design-system':    { Component: InvitraceCover, zoom: 0.42, variant: 'split'   },
  'allianz-doc-classification': { Component: InvitraceCover, zoom: 0.42, variant: 'split'   }, // same cover — both are Invitrace system work
  'stellareat':                 { Component: StellarCover,   zoom: 0.85, variant: 'overlay' },
  'vitae':                      { Component: VitaeCover,     zoom: 0.85, variant: 'overlay' },
}

const EASE_DECISIVE = [0.16, 1, 0.3, 1] as const

// ── Types ──────────────────────────────────────────────────────
interface Props {
  project:      ProjectFrontmatter
  index:        number
  locked:       boolean
  onOpen:       (slug: string) => void
  onNavigate:   (href: string) => void
  universePath: string | undefined
}

// ── GridCard ───────────────────────────────────────────────────
export function WorkGridCard({ project, index, locked, onOpen, onNavigate, universePath }: Props) {
  const reduced = useReducedMotion()
  const cover   = COVERS[project.slug]

  const handleClick = useCallback(() => {
    if (universePath) onNavigate(universePath)
    else onOpen(project.slug)
  }, [universePath, onNavigate, onOpen, project.slug])

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -64px 0px' }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: EASE_DECISIVE }}
      className="group relative w-full text-left border-none cursor-pointer p-0"
      style={{
        height:       CARD_H,
        borderRadius: 'var(--radius-xl)',
        background:   cover?.variant === 'overlay' ? 'var(--color-black)' : 'var(--bg-elevated)',
        fontFamily:   "'League Spartan', sans-serif",
        overflow:     'hidden',
        boxShadow:    'var(--shadow-sm)',
        display:      'block',
      }}
      aria-label={`${project.title}${locked ? ' (password-protected)' : ''}`}
    >
      {cover?.variant === 'overlay' ? (
        /* ── Overlay variant: full-bleed component + dark scrim + white text ── */
        <>
          {/* Component fills entire card — centered, crops sides, inset from top */}
          <div aria-hidden="true" style={{
            position:       'absolute',
            inset:          0,
            overflow:       'hidden',
            pointerEvents:  'none',
            display:        'flex',
            justifyContent: 'center',
            alignItems:     'flex-start',
            paddingTop:     OVERLAY_INSET_TOP,
          }}>
            <div style={{
              transform:       `scale(${cover.zoom})`,
              transformOrigin: 'top center',
              flexShrink:      0,
              pointerEvents:   'none',
            }}>
              <Suspense fallback={null}>
                <cover.Component />
              </Suspense>
            </div>
          </div>

          {/* Dark gradient scrim — bottom 80% fades to near-black */}
          <div aria-hidden="true" style={{
            position:      'absolute',
            inset:         0,
            background:    `linear-gradient(to bottom, transparent 20%, color-mix(in srgb, var(--color-black) 55%, transparent) 55%, color-mix(in srgb, var(--color-black) 88%, transparent) 100%)`,
            pointerEvents: 'none',
          }} />

          {/* White text — bottom-left */}
          <div style={{
            position:      'absolute',
            bottom:        0,
            left:          0,
            right:         0,
            padding:       'var(--space-5)',
            display:       'flex',
            flexDirection: 'column',
            gap:           'var(--space-2)',
            zIndex:        2,
          }}>
            <h3 style={{
              fontSize:      'clamp(var(--type-lg), 1.3vw, var(--type-xl))',
              fontWeight:    800,
              letterSpacing: '-0.02em',
              lineHeight:    1.1,
              color:         'var(--fg-on-cover)',
              margin:        0,
            }}>
              {locked && <span style={{ marginRight: 'var(--space-2)', opacity: 0.5 }}><LockGlyph /></span>}
              {project.title}
            </h3>

            <Tags
              tags={project.tags}
              max={3}
              textColor="var(--fg-on-cover-muted)"
              borderColor="var(--fg-on-cover-border)"
            />

            <p style={{
              fontSize:        'var(--type-base)',
              lineHeight:      1.5,
              color:           'var(--fg-on-cover-subtle)',
              margin:          0,
              overflow:        'hidden',
              display:         '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
            }}>
              {project.summary}
            </p>
          </div>
        </>
      ) : (
        /* ── Split variant: component top, solid text zone below ── */
        <>
          {cover && (
            <div aria-hidden="true" style={{
              position:       'absolute',
              top:            0,
              left:           0,
              right:          0,
              height:         PREVIEW_H,
              overflow:       'hidden',
              pointerEvents:  'none',
              zIndex:         1,
              display:        'flex',
              justifyContent: 'center',
              alignItems:     'flex-start',
            }}>
              <div style={{
                transform:       `scale(${cover.zoom})`,
                transformOrigin: 'top center',
                flexShrink:      0,
                pointerEvents:   'none',
              }}>
                <Suspense fallback={null}>
                  <cover.Component />
                </Suspense>
              </div>
            </div>
          )}

          {/* Bottom fade into text zone */}
          <div aria-hidden="true" style={{
            position:      'absolute',
            bottom:        TEXT_H - FADE_BLEED,
            left:          0,
            right:         0,
            height:        48,
            background:    'linear-gradient(to bottom, color-mix(in srgb, var(--bg-elevated) 0%, transparent), var(--bg-elevated))',
            pointerEvents: 'none',
            zIndex:        2,
          }} />

          {/* Text zone */}
          <div style={{
            position:      'absolute',
            bottom:        0,
            left:          0,
            right:         0,
            height:        TEXT_H,
            padding:       'var(--space-5)',
            paddingTop:    'var(--space-4)',
            display:       'flex',
            flexDirection: 'column',
            gap:           'var(--space-2)',
            zIndex:        3,
            background:    'var(--bg-elevated)',
            borderRadius:  '0 0 var(--radius-xl) var(--radius-xl)',
          }}>
            <h3 style={{
              fontSize:      'clamp(var(--type-lg), 1.3vw, var(--type-xl))',
              fontWeight:    800,
              letterSpacing: '-0.02em',
              lineHeight:    1.1,
              color:         'var(--fg)',
              margin:        0,
            }}>
              {locked && <span style={{ marginRight: 'var(--space-2)', opacity: 0.4 }}><LockGlyph /></span>}
              {project.title}
            </h3>

            <Tags tags={project.tags} max={3} />

            <p style={{
              fontSize:        'var(--type-base)',
              lineHeight:      1.5,
              color:           'var(--fg-muted)',
              margin:          0,
              overflow:        'hidden',
              display:         '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
            }}>
              {project.summary}
            </p>
          </div>
        </>
      )}
    </motion.button>
  )
}
