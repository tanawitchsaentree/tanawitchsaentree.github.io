import type { Variants, Transition } from 'framer-motion'

// ─── Easing presets ───────────────────────────────────────────
export const ease = {
  outQuick:     [0.22, 1, 0.36, 1]     as const,
  inOutNatural: [0.65, 0, 0.35, 1]     as const,
  outStandard:  [0.0, 0.0, 0.2, 1]     as const,
} satisfies Record<string, readonly [number, number, number, number]>

// ─── Shared transitions ───────────────────────────────────────
export const transition = {
  fast:   { duration: 0.18, ease: ease.outQuick }     satisfies Transition,
  base:   { duration: 0.28, ease: ease.outQuick }     satisfies Transition,
  slow:   { duration: 0.48, ease: ease.outQuick }     satisfies Transition,
  reveal: { duration: 0.60, ease: ease.outQuick }     satisfies Transition,
  modal:  { duration: 0.48, ease: ease.outQuick }     satisfies Transition,
  // Reduced-motion fallback: opacity-only, fast
  reduced: { duration: 0.20, ease: ease.outStandard } satisfies Transition,
}

// ─── Variant sets ─────────────────────────────────────────────

/** Scroll-reveal: fade up 24px, once per session */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transition.reveal,
  },
}

/** Stagger container — wraps children that use fadeUp */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
}

/** Modal open/close */
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 16,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transition.modal,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: { duration: 0.24, ease: ease.inOutNatural },
  },
}

/** Modal backdrop */
export const backdropVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.28, ease: ease.outStandard } },
  exit:    { opacity: 0, transition: { duration: 0.20, ease: ease.inOutNatural } },
}

/** Mobile sheet (slide up from bottom) */
export const sheetVariants: Variants = {
  hidden:  { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: transition.modal },
  exit:    { y: '100%', opacity: 0, transition: { duration: 0.24, ease: ease.inOutNatural } },
}

/** Page enter — sections stagger in on first load only */
export const pageEnter: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: transition.reveal },
}
