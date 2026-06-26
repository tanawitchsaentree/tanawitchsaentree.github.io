'use client'

import React, { useRef, useEffect, useCallback } from 'react'

/** Shared iPhone-style shell. Children = screen content. */
export function StellarPhone({
  children,
  width = 340,
  height = 720,
}: {
  children: React.ReactNode
  width?: number
  height?: number
}) {
  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: 56,
        padding: 13,
        background: 'linear-gradient(145deg,#2a2d30,#0c0d0e 40%,#000 70%,#1a1c1e)',
        boxShadow: `
          0 0 0 2px #3c4044,
          0 0 0 5px #141618,
          inset 0 0 1px 1px rgba(255,255,255,.10),
          0 50px 90px -28px rgba(22,33,15,.42),
          0 22px 44px -20px rgba(22,33,15,.30)
        `,
        flexShrink: 0,
      }}
    >
      {/* shadow blob */}
      <div style={{ position: 'absolute', left: '10%', right: '10%', bottom: -38, height: 52, background: 'rgba(22,33,15,.26)', filter: 'blur(32px)', borderRadius: '50%', zIndex: -1 }} />
      {/* side buttons */}
      <div style={{ position: 'absolute', left: -3, top: 118, width: 3, height: 28, background: 'linear-gradient(180deg,#3a3d40,#16181a)', borderRadius: '2px 0 0 2px' }} />
      <div style={{ position: 'absolute', left: -3, top: 166, width: 3, height: 52, background: 'linear-gradient(180deg,#3a3d40,#16181a)', borderRadius: '2px 0 0 2px' }} />
      <div style={{ position: 'absolute', left: -3, top: 230, width: 3, height: 52, background: 'linear-gradient(180deg,#3a3d40,#16181a)', borderRadius: '2px 0 0 2px' }} />
      <div style={{ position: 'absolute', right: -3, top: 188, width: 3, height: 74, background: 'linear-gradient(180deg,#3a3d40,#16181a)', borderRadius: '0 2px 2px 0' }} />
      {/* screen */}
      <div
        className="stellar-phone-screen"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 44,
          overflow: 'hidden',
          background: '#fff',
          fontFamily: "'DM Sans', sans-serif",
          color: '#16210f',
          fontSize: 13,
          userSelect: 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}

const FINGER_W = 15

export interface BotHandle {
  moveTo: (el: HTMLElement) => Promise<{ x: number; y: number }>
  tap: (el: HTMLElement, effect?: () => void) => Promise<void>
  smoothScroll: (scrollEl: HTMLElement, to: number) => Promise<void>
  show: () => void
  hide: () => void
}

/** Ghost finger overlay — injected into the screen, coordinates relative to screen */
export function useBotFinger(screenRef: React.RefObject<HTMLElement | null>): {
  fingerEl: React.ReactElement
  rippleEl: React.ReactElement
  bot: React.MutableRefObject<BotHandle>
} {
  const fingerRef  = useRef<HTMLDivElement>(null)
  const rippleRef  = useRef<HTMLDivElement>(null)

  const bot = useRef<BotHandle>({
    moveTo: async () => ({ x: 0, y: 0 }),
    tap: async () => {},
    smoothScroll: async () => {},
    show: () => {},
    hide: () => {},
  })

  useEffect(() => {
    const screen = screenRef.current
    const finger = fingerRef.current
    const ripple = rippleRef.current
    if (!screen || !finger || !ripple) return

    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

    function scaleFactor() {
      const r = screen!.getBoundingClientRect()
      return r.width / screen!.offsetWidth || 1
    }

    function center(el: HTMLElement) {
      const k = scaleFactor()
      const s = screen!.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      return {
        x: (r.left - s.left) / k + r.width / k / 2,
        y: (r.top  - s.top)  / k + r.height / k / 2,
      }
    }

    function place(x: number, y: number) {
      finger!.style.transform = `translate(${x - FINGER_W}px,${y - FINGER_W}px)`
    }

    async function moveTo(el: HTMLElement) {
      const c = center(el)
      place(c.x, c.y)
      finger!.style.transition = 'transform 950ms cubic-bezier(.5,0,.2,1)'
      await wait(950)
      return c
    }

    function doRipple(c: { x: number; y: number }) {
      ripple!.style.setProperty('--rx', (c.x - FINGER_W) + 'px')
      ripple!.style.setProperty('--ry', (c.y - FINGER_W) + 'px')
      ripple!.classList.remove('sbot-go')
      void ripple!.offsetWidth
      ripple!.classList.add('sbot-go')
    }

    async function tap(el: HTMLElement, effect?: () => void) {
      if (!el) return
      const c = await moveTo(el)
      finger!.style.setProperty('--fx', (c.x - FINGER_W) + 'px')
      finger!.style.setProperty('--fy', (c.y - FINGER_W) + 'px')
      finger!.style.transition = 'transform 160ms cubic-bezier(.16,1,.3,1)'
      finger!.style.transform = `translate(var(--fx),var(--fy)) scale(.78)`
      doRipple(c)
      await wait(180)
      finger!.style.transition = 'transform 950ms cubic-bezier(.5,0,.2,1)'
      finger!.style.transform = `translate(${c.x - FINGER_W}px,${c.y - FINGER_W}px)`
      if (effect) effect(); else el.click()
      await wait(480)
    }

    async function smoothScroll(scrollEl: HTMLElement, to: number) {
      return new Promise<void>(res => {
        const start = scrollEl.scrollTop
        const d = to - start
        const dur = 850
        let t0: number | null = null
        function step(t: number) {
          if (!t0) t0 = t
          const p = Math.min((t - t0) / dur, 1)
          const e = 1 - Math.pow(1 - p, 3)
          scrollEl.scrollTop = start + d * e
          if (p < 1) requestAnimationFrame(step); else res()
        }
        requestAnimationFrame(step)
      })
    }

    bot.current = {
      moveTo,
      tap,
      smoothScroll,
      show: () => finger!.classList.add('sbot-show'),
      hide: () => finger!.classList.remove('sbot-show'),
    }
  }, [screenRef])

  const fingerEl = (
    <div
      ref={fingerRef}
      className="sbot-finger"
      style={{
        position: 'absolute', top: 0, left: 0,
        width: FINGER_W * 2, height: FINGER_W * 2,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 34%,rgba(22,33,15,.42),rgba(22,33,15,.28))',
        border: '1.5px solid rgba(255,255,255,.7)',
        boxShadow: '0 4px 14px rgba(22,33,15,.3)',
        transform: 'translate(150px,300px)',
        zIndex: 90,
        pointerEvents: 'none',
        opacity: 0,
        transition: 'opacity 300ms, transform 950ms cubic-bezier(.5,0,.2,1)',
      }}
    />
  )

  const rippleEl = (
    <div
      ref={rippleRef}
      className="sbot-ripple"
      style={{
        position: 'absolute', top: 0, left: 0,
        width: FINGER_W * 2, height: FINGER_W * 2,
        borderRadius: '50%',
        border: '2px solid #14A800',
        opacity: 0,
        transform: 'translate(150px,300px) scale(.3)',
        zIndex: 89,
        pointerEvents: 'none',
      }}
    />
  )

  return { fingerEl, rippleEl, bot }
}
