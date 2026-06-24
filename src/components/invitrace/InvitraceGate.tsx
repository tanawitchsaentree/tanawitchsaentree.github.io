'use client'

import { useState, useEffect, useRef, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/cn'

const STORAGE_KEY = 'invitrace_gate_v1'
const CORRECT_PASSWORD = '1234'

type GateState = 'idle' | 'typing' | 'checking' | 'error' | 'success'

const SHAKE_STYLE = `
@keyframes gate-shake {
  0%,100% { transform: translateX(0); }
  15%      { transform: translateX(-6px); }
  30%      { transform: translateX(6px); }
  45%      { transform: translateX(-4px); }
  60%      { transform: translateX(4px); }
  75%      { transform: translateX(-2px); }
  90%      { transform: translateX(2px); }
}
.gate-shake { animation: gate-shake 420ms cubic-bezier(0.36,0.07,0.19,0.97) both; }
@keyframes gate-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .gate-shake { animation: none; }
}
`

export function InvitraceGate({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen]     = useState(true)
  const [hasMounted, setHasMounted] = useState(false)
  const [value, setValue]       = useState('')
  const [state, setState]       = useState<GateState>('idle')
  const [attempts, setAttempts] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef  = useRef<HTMLDivElement>(null)
  const inputId  = useId()

  useEffect(() => {
    setHasMounted(true)
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'true') setIsOpen(false)
    } catch {}
  }, [])

  useEffect(() => {
    if (isOpen && hasMounted) {
      const t = setTimeout(() => inputRef.current?.focus(), 400)
      return () => clearTimeout(t)
    }
  }, [isOpen, hasMounted])

  const triggerError = () => {
    setState('error')
    setAttempts(a => a + 1)
    setValue('')
    formRef.current?.classList.add('gate-shake')
    const t = setTimeout(() => {
      formRef.current?.classList.remove('gate-shake')
      setState('idle')
      inputRef.current?.focus()
    }, 500)
    return () => clearTimeout(t)
  }

  const handleSubmit = () => {
    if (!value.trim()) return
    setState('checking')
    setTimeout(() => {
      if (value.trim() === CORRECT_PASSWORD) {
        setState('success')
        try { localStorage.setItem(STORAGE_KEY, 'true') } catch {}
        setTimeout(() => setIsOpen(false), 600)
      } else {
        triggerError()
      }
    }, 350)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (state === 'error') setState('idle')
    setValue(e.target.value)
    setState(e.target.value.length > 0 ? 'typing' : 'idle')
  }

  if (!hasMounted) return <>{children}</>

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SHAKE_STYLE }} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="invitrace-gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4, ease: [0.65, 0, 0.35, 1] } }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]"
            aria-modal="true"
            role="dialog"
            aria-labelledby="inv-gate-title"
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage:
                  'linear-gradient(var(--fg) 1px, transparent 1px), linear-gradient(90deg, var(--fg) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
              aria-hidden="true"
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1   }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'relative z-10 w-full max-w-[420px] mx-6',
                'bg-[var(--bg-elevated)]',
                'border border-[var(--border)]',
                'p-8 md:p-10'
              )}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1   }}
                transition={{ delay: 0.25, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mb-7"
                aria-hidden="true"
              >
                <LockIcon unlocked={state === 'success'} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1
                  id="inv-gate-title"
                  className={cn(
                    'font-display font-normal leading-[1.1] tracking-[-0.02em]',
                    'text-[clamp(1.5rem,3vw,2rem)]',
                    'text-[var(--fg)] mb-2'
                  )}
                >
                  Protected work
                </h1>
                <p className="text-[var(--type-base)] text-[var(--fg-muted)] leading-[1.65] mb-8">
                  This case study contains real clinical system architecture
                  from a live healthcare product.
                  Enter the password to continue.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div ref={formRef} className="flex gap-2 mb-3">
                  <div className="flex-1 relative">
                    <label htmlFor={inputId} className="sr-only">Password</label>
                    <input
                      id={inputId}
                      ref={inputRef}
                      type="password"
                      value={value}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      disabled={state === 'checking' || state === 'success'}
                      autoComplete="current-password"
                      placeholder="Enter password"
                      className={cn(
                        'w-full px-4 py-3',
                        'font-mono text-[var(--type-sm)]',
                        'bg-[var(--bg)] text-[var(--fg)]',
                        'border transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]',
                        'placeholder:text-[var(--fg-subtle)]',
                        'focus:outline-none',
                        state === 'error'
                          ? 'border-[var(--signal-danger)] focus:border-[var(--signal-danger)]'
                          : state === 'success'
                          ? 'border-[var(--accent)]'
                          : 'border-[var(--border)] focus:border-[var(--fg)]'
                      )}
                      aria-invalid={state === 'error' ? 'true' : undefined}
                      aria-describedby={state === 'error' ? 'inv-gate-error' : undefined}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!value.trim() || state === 'checking' || state === 'success'}
                    className={cn(
                      'px-5 py-3',
                      'font-mono text-[var(--type-sm)] font-medium',
                      'border transition-[background-color,border-color,opacity] duration-[200ms] ease-[var(--ease-out-quick)]',
                      'disabled:opacity-40 disabled:cursor-not-allowed',
                      state === 'success'
                        ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--fg)]'
                        : 'bg-[var(--fg)] border-[var(--fg)] text-[var(--bg)] hover:opacity-85'
                    )}
                    aria-label="Unlock"
                  >
                    {state === 'checking' ? <SpinnerIcon /> : state === 'success' ? <CheckIcon /> : '→'}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {state === 'error' && (
                    <motion.p
                      id="inv-gate-error"
                      key="error"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      role="alert"
                      className="text-[var(--type-xs)] text-[var(--signal-danger)] leading-[1.5]"
                    >
                      {attempts >= 3
                        ? 'Still no luck — make sure you have the right password.'
                        : "That password didn't work. Try again."}
                    </motion.p>
                  )}
                  {state === 'success' && (
                    <motion.p
                      key="success"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="text-[var(--type-xs)] text-[var(--fg-muted)] leading-[1.5]"
                    >
                      Access granted — opening case study…
                    </motion.p>
                  )}
                  {state !== 'error' && state !== 'success' && (
                    <motion.p
                      key="hint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="text-[var(--type-xs)] text-[var(--fg-subtle)] leading-[1.5]"
                    >
                      {attempts > 0
                        ? `${attempts} failed attempt${attempts > 1 ? 's' : ''}. Password needed to proceed.`
                        : 'Password provided to recruiter or interviewer.'}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="mt-8 pt-6 border-t border-[var(--border)]"
              >
                <Link
                  href="/"
                  className={cn(
                    'font-mono text-[var(--type-xs)] tracking-[0.08em] uppercase',
                    'text-[var(--fg-subtle)] no-underline',
                    'hover:text-[var(--fg-muted)] transition-colors duration-[var(--duration-fast)]'
                  )}
                >
                  ← Back to portfolio
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div aria-hidden={isOpen ? 'true' : undefined}>
        {children}
      </div>
    </>
  )
}

function LockIcon({ unlocked }: { unlocked: boolean }) {
  return (
    <motion.svg
      width="28" height="28" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round"
      className="text-[var(--fg)]"
      animate={unlocked ? { rotate: [0, -8, 0] } : {}}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.path
        d="M8 11V7a4 4 0 1 1 8 0v4"
        animate={unlocked ? { d: 'M8 11V7a4 4 0 0 1 8 0' } : { d: 'M8 11V7a4 4 0 1 1 8 0v4' }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <motion.circle
        cx="12" cy="16" r="1"
        animate={unlocked ? { r: 0 } : { r: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.svg>
  )
}

function SpinnerIcon() {
  // Stepped rotation — mechanical "typewriter tick" feel. Uses CSS steps()
  // (a timing function, not the banned `linear` keyword) so it's on-brand and
  // compliant. 8 discrete ticks per revolution.
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: 'gate-spin 0.8s steps(8, end) infinite', transformOrigin: 'center' }}
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <motion.path
        d="M5 13l4 4L19 7"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}
