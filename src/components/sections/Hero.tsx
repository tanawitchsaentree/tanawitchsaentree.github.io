'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

function LiveTime() {
  const [time, setTime] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    function update() {
      if (document.visibilityState === 'hidden') return
      const now = new Date()
      const formatted = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Bangkok',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      setTime(formatted)
    }

    update()
    const id = setInterval(update, 60_000)
    document.addEventListener('visibilitychange', update)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  if (!mounted) return null
  return <span>{time}</span>
}

const GUTTER = 'left-6 md:left-12 lg:left-20 xl:left-[7.5rem]'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const shouldReduceMotion = useReducedMotion()

  // Cursor-reactive parallax — pointer:fine + no reduced-motion only
  useEffect(() => {
    const el = headlineRef.current
    if (!el) return
    const mq = window.matchMedia(
      '(pointer: fine) and (prefers-reduced-motion: no-preference)'
    )
    if (!mq.matches) return

    const onMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const dx = ((e.clientX - cx) / cx) * 8
      const dy = ((e.clientY - cy) / cy) * 4
      el.style.transform = `translate(${dx * 0.15}px, ${dy * 0.1}px)`
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  // Scroll-tied opacity — fades hero out as user scrolls down
  const { scrollY } = useScroll()
  const opacity = useTransform(
    scrollY,
    [0, 600],
    [1, shouldReduceMotion ? 1 : 0]
  )

  return (
    <motion.section
      ref={sectionRef}
      id="hero"
      aria-label="Introduction"
      style={{ opacity }}
      className={cn(
        'relative min-h-svh',
        'flex flex-col justify-center',
        'py-24',
        'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]'
      )}
    >
      <div className="flex flex-col items-start w-full max-w-[80rem]">

        <p
          className={cn(
            'font-display font-normal',
            'text-[var(--type-2xl)] leading-[1.25] tracking-[-0.024em]',
            'text-[var(--fg-muted)]',
            'mb-6'
          )}
        >
          Hi, I&apos;m Tanawitch.
        </p>

        <h1
          ref={headlineRef}
          className={cn(
            'font-display font-normal',
            'text-[clamp(2.75rem,8vw,7rem)]',
            'leading-[0.95] tracking-[-0.04em]',
            'text-[var(--fg)]',
            'max-w-[18ch]',
            'transition-transform duration-75 ease-out will-change-transform'
          )}
        >
          8 years designing
          <br />
          <em className="not-italic text-[var(--fg-muted)]">systems that</em>
          <br />
          survive contact
          <br />
          with engineering.
        </h1>

        <div className="mt-12 md:mt-16 flex flex-col gap-1">
          <p
            className={cn(
              'text-[var(--type-lg)] leading-[1.6] tracking-[-0.014em]',
              'text-[var(--fg-muted)]'
            )}
          >
            Senior Designer at{' '}
            <span style={{ color: 'var(--accent)' }}>Allianz Technology</span>
            .
          </p>
          <p
            className={cn(
              'text-[var(--type-lg)] leading-[1.6] tracking-[-0.014em]',
              'text-[var(--fg-muted)]',
              'max-w-[60ch]'
            )}
          >
            Currently designing AI document tools for operator workflows.
          </p>
        </div>

        <div
          aria-label="Location and current time"
          className={cn(
            'mt-12 md:mt-20',
            'font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]',
            'tracking-widest uppercase',
            'flex items-center gap-4'
          )}
        >
          <span>Bangkok</span>
          <span aria-hidden="true">·</span>
          <span>GMT+7</span>
          <span aria-hidden="true">·</span>
          <LiveTime />
        </div>
      </div>

      <div
        className={cn(
          'absolute bottom-12',
          GUTTER,
          'flex flex-col items-start gap-2',
          'animate-scroll-hint'
        )}
        aria-hidden="true"
      >
        <ChevronDown
          size={12}
          className="text-[var(--fg-subtle)]"
          strokeWidth={1.5}
        />
        <span
          className={cn(
            'font-mono text-[var(--type-xs)]',
            'tracking-[0.1em] uppercase',
            'text-[var(--fg-subtle)]'
          )}
        >
          scroll
        </span>
      </div>
    </motion.section>
  )
}
