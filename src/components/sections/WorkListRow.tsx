'use client'

import { useCallback, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ProjectFrontmatter } from '@/types/project'

const EASE_DECISIVE = [0.16, 1, 0.3, 1] as const
const DURATION      = 0.48   // matches --duration-slow: 480ms
const STAGGER       = 0.07   // per-row entrance stagger

interface Props {
  project:      ProjectFrontmatter
  index:        number   // 1-based display number (for list numbering if used)
  locked:       boolean
  onOpen:       (slug: string) => void
  onNavigate:   (href: string) => void
  universePath: string | undefined
}

export function WorkListRow({ project, index, locked, onOpen, onNavigate, universePath }: Props) {
  const reduced  = useReducedMotion()
  const [hovered, setHovered] = useState(false)

  const handleClick = useCallback(() => {
    if (universePath) onNavigate(universePath)
    else onOpen(project.slug)
  }, [universePath, onNavigate, onOpen, project.slug])

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -48px 0px' }}
      transition={{ duration: DURATION, delay: index * STAGGER, ease: EASE_DECISIVE }}
    >
      {/* top hairline */}
      <div style={{ height: 1, background: 'var(--border)' }} />

      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width:      '100%',
          display:    'grid',
          gridTemplateColumns: '3rem 1fr 1fr auto',
          alignItems: 'center',
          gap:        'clamp(var(--space-4), 3vw, var(--space-10))',
          padding:    'clamp(var(--space-6), 3vw, var(--space-8)) 0',
          background: 'transparent',
          border:     'none',
          cursor:     locked ? 'default' : 'pointer',
          textAlign:  'left',
          fontFamily: "'League Spartan', sans-serif",
          transition: reduced ? undefined : `background var(--duration-base) var(--ease-out-quick)`,
        }}
        aria-label={`${project.title}${locked ? ' (password-protected)' : ''}`}
      >
        {/* index number */}
        <span style={{
          fontSize:      'var(--type-xs)',
          letterSpacing: '0.1em',
          color:         'var(--fg-subtle)',
          fontWeight:    500,
          flexShrink:    0,
          userSelect:    'none',
        }}>
          {String(index).padStart(2, '0')}.
        </span>

        {/* title + company */}
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize:      'clamp(var(--type-xl), 2vw, var(--type-2xl))',
            fontWeight:    700,
            letterSpacing: '-0.02em',
            color:         'var(--fg)',
            lineHeight:    1.1,
            transition:    reduced ? undefined : `color var(--duration-base) var(--ease-out-quick)`,
          }}>
            {project.title}
          </div>
          <div style={{
            fontSize:   'var(--type-base)',
            color:      'var(--fg-subtle)',
            marginTop:  '0.25rem',
            fontWeight: 400,
          }}>
            {project.company} · {project.year}
          </div>
        </div>

        {/* summary */}
        <p style={{
          fontSize:   'var(--type-base)',
          color:      'var(--fg-muted)',
          lineHeight: 1.55,
          margin:     0,
          maxWidth:   '52ch',
        }}>
          {project.summary}
        </p>

        {/* arrow */}
        <span
          aria-hidden="true"
          style={{
            fontSize:    'var(--type-lg)',
            color:       hovered ? 'var(--fg)' : 'var(--fg-subtle)',
            flexShrink:  0,
            transition:  reduced ? undefined : `color var(--duration-base) var(--ease-out-quick), transform var(--duration-base) var(--ease-out-standard)`,
            transform:   hovered ? 'translateX(8px)' : 'translateX(0)',
            display:     'block',
          }}
        >
          →
        </span>
      </button>
    </motion.div>
  )
}
