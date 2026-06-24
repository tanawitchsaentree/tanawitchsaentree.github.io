'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'

const SIGNATURES: Record<string, string> = {
  'allianz-doc-classification': '/projects/signatures/allianz.svg',
  'profita-mutual-fund':        '/projects/signatures/profita.svg',
  'invitrace-design-system':    '/projects/signatures/invitrace.svg',
  // Stubs — no signature yet, CoverSignature handles missing gracefully
}

interface CoverSignatureProps {
  slug: string
  hovered: boolean
}

export function CoverSignature({ slug, hovered }: CoverSignatureProps) {
  const src = SIGNATURES[slug]
  const reduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  // Raw mouse position relative to container center
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  // Spring-smoothed — lag gives the floating/parallax feel
  const x = useSpring(rawX, { stiffness: 120, damping: 20, mass: 0.8 })
  const y = useSpring(rawY, { stiffness: 120, damping: 20, mass: 0.8 })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    // Max ±10px drift
    rawX.set(((e.clientX - cx) / rect.width) * 10)
    rawY.set(((e.clientY - cy) / rect.height) * 10)
  }

  function handleMouseLeave() {
    rawX.set(0)
    rawY.set(0)
  }

  return (
    <div
      ref={containerRef}
      className="flex-shrink-0 flex items-start gap-3 ml-8 overflow-visible mt-[2px]"
      aria-hidden="true"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {src && (
        <motion.div
          style={reduced ? {} : { x, y }}
          className={cn(
            'relative w-24 h-24 overflow-hidden',
            'rounded-[var(--radius-sm)]',
            'opacity-40 md:opacity-0',
            'transition-opacity duration-[480ms] ease-[var(--ease-out-quick)]',
            hovered && 'md:opacity-100',
            '[clip-path:inset(0_100%_0_0)]',
            hovered && '[clip-path:inset(0_0%_0_0)]',
            'motion-reduce:[clip-path:none]',
            'motion-reduce:transition-opacity motion-reduce:duration-[200ms]'
          )}
        >
          <Image src={src} alt="" fill sizes="96px" className="object-cover" />
        </motion.div>
      )}

      {/* Extending line */}
      <div
        className={cn(
          'h-px bg-[var(--fg-subtle)] self-center',
          'w-12 transition-[width] duration-[320ms] ease-[var(--ease-out-quick)]',
          hovered && 'w-[7.5rem]',
          'motion-reduce:w-12'
        )}
      />
    </div>
  )
}
