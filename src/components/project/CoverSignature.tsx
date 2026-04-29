'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/cn'

const SIGNATURES: Record<string, string> = {
  'allianz-doc-classification': '/projects/signatures/allianz.svg',
  'profita-mutual-fund':        '/projects/signatures/profita.svg',
  'invitrace-design-system':    '/projects/signatures/invitrace.svg',
  'doctoranywhere-telehealth':  '/projects/signatures/doctoranywhere.svg',
}

interface CoverSignatureProps {
  slug: string
  // Passed from parent row — avoids duplicate hover state management
  hovered: boolean
}

export function CoverSignature({ slug, hovered }: CoverSignatureProps) {
  const src = SIGNATURES[slug]

  return (
    <div
      className="flex-shrink-0 flex items-center gap-3 ml-8"
      aria-hidden="true"
    >
      {/* Signature image — fades in on hover, always shown on touch devices */}
      {src && (
        <div
          className={cn(
            'relative w-20 h-20 overflow-hidden',
            'rounded-[var(--radius-sm)]',
            // Touch: always visible at lower opacity
            'opacity-40 md:opacity-0',
            // Desktop hover: fade in + clip-path reveal
            'transition-opacity duration-[480ms] ease-[var(--ease-out-quick)]',
            hovered && 'md:opacity-100',
            // Clip-path: masks in from left on hover
            '[clip-path:inset(0_100%_0_0)]',
            hovered && '[clip-path:inset(0_0%_0_0)]',
            // Reduced motion: opacity only, no clip-path
            'motion-reduce:[clip-path:none]',
            'motion-reduce:transition-opacity motion-reduce:duration-[200ms]'
          )}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
      )}

      {/* The line — extends on hover */}
      <div
        className={cn(
          'h-px bg-[var(--fg-subtle)]',
          // Default: 48px. Hover: 120px.
          'w-12',
          'transition-[width] duration-[320ms] ease-[var(--ease-out-quick)]',
          hovered && 'w-[7.5rem]',
          // Reduced motion: no width change
          'motion-reduce:w-12'
        )}
      />
    </div>
  )
}
