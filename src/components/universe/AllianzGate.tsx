'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const STORAGE_KEY = 'allianz_gate_dismissed'

export function AllianzGate({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'true') setIsOpen(false)
    } catch {}
  }, [])

  const handleEnter = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {}
    setIsOpen(false)
  }

  // SSR: render children directly — gate is client-only
  if (!hasMounted) return <>{children}</>

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="allianz-gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'var(--universe-bg)' }}
          >
            <div
              className="mx-auto px-8 text-center"
              style={{ maxWidth: '480px' }}
            >
              {/* Headline */}
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  lineHeight: '1.4',
                  color: 'var(--universe-fg)',
                  marginBottom: '24px',
                }}
              >
                Behind this page:<br />
                Real screens from a real product<br />
                that real people use to do real work.
              </p>

              {/* Soft ask */}
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: 'var(--universe-fg-2)',
                  marginBottom: '8px',
                }}
              >
                Please don&apos;t reshare them out of context.
              </p>

              {/* Dry aside */}
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: 'var(--universe-fg-2)',
                  marginBottom: '48px',
                }}
              >
                (Unless it makes me look good.)
              </p>

              {/* CTA */}
              <button
                type="button"
                onClick={handleEnter}
                className="group inline-flex items-center gap-2 px-6 py-3 border transition-colors duration-[240ms]"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  letterSpacing: '0.02em',
                  borderColor: 'var(--universe-fg)',
                  color: 'var(--universe-fg)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.backgroundColor = 'var(--universe-fg)'
                  el.style.color = 'var(--universe-bg)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.backgroundColor = 'transparent'
                  el.style.color = 'var(--universe-fg)'
                }}
              >
                Got it — show me the work
                <span className="transition-transform duration-[240ms] group-hover:translate-x-1" aria-hidden="true">→</span>
              </button>

              {/* Back link */}
              <div style={{ marginTop: '32px' }}>
                <Link
                  href="/"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--universe-fg-2)',
                    textDecoration: 'none',
                  }}
                >
                  ↳ or back to home
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </>
  )
}
