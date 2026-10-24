'use client'

import { useEffect, useRef } from 'react'
import { V } from '../tokens'
import { createBotGate } from '../ui/botGate'

export interface KilledBotRefs {
  screenRef:  React.RefObject<HTMLDivElement | null>
  fingerRef:  React.RefObject<HTMLDivElement | null>
  rippleRef:  React.RefObject<HTMLDivElement | null>
  rejBtnRef:  React.RefObject<HTMLButtonElement | null>
  shpBtnRef:  React.RefObject<HTMLButtonElement | null>
  rootRef:    React.RefObject<HTMLDivElement | null>
}

const FINGER_W = 14


function getScale(screen: HTMLDivElement) {
  return screen.getBoundingClientRect().width / screen.offsetWidth || 1
}

function centerOf(el: Element, screen: HTMLDivElement) {
  const f = getScale(screen)
  const sr = screen.getBoundingClientRect()
  const er = el.getBoundingClientRect()
  return {
    x: (er.left - sr.left) / f + er.width  / f / 2,
    y: (er.top  - sr.top)  / f + er.height / f / 2,
  }
}

export function useKilledBot(refs: KilledBotRefs) {
  const stopRef = useRef(false)

  useEffect(() => {
    stopRef.current = false
    const { screenRef, fingerRef, rippleRef, rejBtnRef, shpBtnRef, rootRef } = refs
    if (!screenRef.current) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // pauses the loop while the phone is off screen (no timers firing out of view)
    const gate = createBotGate(screenRef.current, 0.4)
    const wait = gate.wait

    function rip(c: { x: number; y: number }) {
      const r = rippleRef.current
      if (!r) return
      r.style.setProperty('--rx', `${c.x - FINGER_W}px`)
      r.style.setProperty('--ry', `${c.y - FINGER_W}px`)
      r.classList.remove('vk-ripple--go')
      void r.offsetWidth
      r.classList.add('vk-ripple--go')
    }

    async function moveTo(el: Element) {
      const screen = screenRef.current!
      const finger = fingerRef.current!
      const c = centerOf(el, screen)
      finger.style.transform = `translate(${c.x - FINGER_W}px, ${c.y - FINGER_W}px)`
      await wait(V.motion.fingerMoveMs)
      return c
    }

    async function tap(el: Element | null | undefined, cb?: () => void) {
      if (!el || !fingerRef.current) return
      const finger = fingerRef.current
      const c = await moveTo(el)
      finger.style.setProperty('--fx', `${c.x - FINGER_W}px`)
      finger.style.setProperty('--fy', `${c.y - FINGER_W}px`)
      finger.classList.add('vk-finger--press')
      rip(c)
      await wait(V.motion.fingerPressMs)
      finger.classList.remove('vk-finger--press')
      cb?.()
      await wait(V.motion.fingerSettleMs)
    }

    function setState(s: 'rejected' | 'shipped') {
      setKilledState(rootRef.current, s)
    }

    async function loop() {
      while (!stopRef.current) {
        setState('shipped')
        await wait(reduce ? 2600 : 1300)
        if (stopRef.current) break

        if (reduce) {
          setState('rejected')
          await wait(3000)
          continue
        }

        fingerRef.current?.classList.add('vk-finger--show')
        await wait(V.motion.fingerAppearMs)

        await tap(rejBtnRef.current, () => setState('rejected'))
        await wait(V.motion.killedRejectDwellMs)
        if (stopRef.current) break

        await tap(shpBtnRef.current, () => setState('shipped'))
        await wait(V.motion.killedShippedDwellMs)
        if (stopRef.current) break

        fingerRef.current?.classList.remove('vk-finger--show')
        await wait(V.motion.fingerExitMs)
      }
    }

    // start once the screen first enters the viewport
    gate.untilVisible().then(() => wait(600)).then(loop)
    return () => { stopRef.current = true; gate.stop() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

/** Switches the Rejected/Shipped view and keeps the segmented buttons' aria-pressed in sync. */
export function setKilledState(root: HTMLElement | null, s: 'rejected' | 'shipped') {
  if (!root) return
  root.dataset.state = s
  root.querySelectorAll<HTMLButtonElement>('button[data-s]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.s === s)))
}
