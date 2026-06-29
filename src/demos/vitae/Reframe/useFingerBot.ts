'use client'

import { useEffect, useRef } from 'react'

export interface FingerBotRefs {
  fingerRef:  React.RefObject<HTMLDivElement | null>
  rippleRef:  React.RefObject<HTMLDivElement | null>
  screenRef:  React.RefObject<HTMLDivElement | null>
  numRef:     React.RefObject<HTMLSpanElement | null>
  bandRef:    React.RefObject<HTMLElement | null>
  verdictRef: React.RefObject<HTMLDivElement | null>
  moveRef:    React.RefObject<HTMLDivElement | null>
  doBtnRef:   React.RefObject<HTMLButtonElement | null>
  toggleRef:  React.RefObject<HTMLButtonElement | null>
  inputsRef:  React.RefObject<HTMLDivElement | null>
  tabsRef:    React.RefObject<(HTMLButtonElement | null)[]>
}

const FINGER_W = 14
const CHECK_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`
const ARROW_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`

function wait(ms: number) { return new Promise<void>(r => setTimeout(r, ms)) }

function getScale(screen: HTMLDivElement) {
  return screen.getBoundingClientRect().width / screen.offsetWidth || 1
}

function centerOf(el: Element, screen: HTMLDivElement) {
  const f = getScale(screen)
  const sr = screen.getBoundingClientRect()
  const er = el.getBoundingClientRect()
  return {
    x: (er.left - sr.left) / f + (er.width  / f) / 2,
    y: (er.top  - sr.top)  / f + (er.height / f) / 2,
  }
}

function countTo(el: HTMLSpanElement, target: number, dur = 700) {
  return new Promise<void>(res => {
    const start = parseInt(el.textContent ?? '82', 10)
    const diff  = target - start
    let t0: number | null = null
    function step(t: number) {
      if (!t0) t0 = t
      const p = Math.min((t - t0) / dur, 1)
      const e = 1 - Math.pow(1 - p, 3)
      el.textContent = String(Math.round(start + diff * e))
      if (p < 1) requestAnimationFrame(step); else res()
    }
    requestAnimationFrame(step)
  })
}

export function useFingerBot(refs: FingerBotRefs) {
  const stopRef = useRef(false)

  useEffect(() => {
    stopRef.current = false
    const { fingerRef, rippleRef, screenRef, numRef, bandRef, verdictRef,
            moveRef, doBtnRef, toggleRef, inputsRef, tabsRef } = refs

    if (!screenRef.current) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function reset() {
      if (numRef.current)     numRef.current.textContent = '82'
      if (bandRef.current)    (bandRef.current as HTMLElement).style.width = '82%'
      if (verdictRef.current) verdictRef.current.textContent = 'On track today'
      moveRef.current?.classList.remove('va-move--done')
      if (doBtnRef.current) { doBtnRef.current.classList.remove('va-do--done'); doBtnRef.current.innerHTML = ARROW_SVG }
      inputsRef.current?.classList.remove('va-inputs--open')
      toggleRef.current?.classList.remove('va-toggle--open')
      tabsRef.current?.forEach((t, i) => t?.classList.toggle('va-tab--on', i === 0))
    }

    function rip(c: { x: number; y: number }) {
      const r = rippleRef.current
      if (!r) return
      r.style.setProperty('--rx', `${c.x - FINGER_W}px`)
      r.style.setProperty('--ry', `${c.y - FINGER_W}px`)
      r.classList.remove('va-ripple--go')
      void r.offsetWidth // force reflow
      r.classList.add('va-ripple--go')
    }

    async function moveTo(el: Element) {
      const screen = screenRef.current!
      const finger = fingerRef.current!
      const c = centerOf(el, screen)
      finger.style.transform = `translate(${c.x - FINGER_W}px, ${c.y - FINGER_W}px)`
      await wait(820)
      return c
    }

    async function tap(el: Element | null | undefined, cb?: () => void) {
      if (!el || !fingerRef.current) return
      const finger = fingerRef.current
      const c = await moveTo(el)
      finger.style.setProperty('--fx', `${c.x - FINGER_W}px`)
      finger.style.setProperty('--fy', `${c.y - FINGER_W}px`)
      finger.classList.add('va-finger--press')
      rip(c)
      await wait(165)
      finger.classList.remove('va-finger--press')
      cb?.()
      await wait(430)
    }

    async function loop() {
      while (!stopRef.current) {
        reset()
        await wait(reduce ? 2600 : 1100)
        if (stopRef.current) break

        if (reduce) {
          inputsRef.current?.classList.add('va-inputs--open')
          await wait(3000)
          continue
        }

        fingerRef.current?.classList.add('va-finger--show')
        await wait(500)

        // 1) tap "do" — score ticks up
        await tap(doBtnRef.current, () => {
          moveRef.current?.classList.add('va-move--done')
          if (doBtnRef.current) { doBtnRef.current.classList.add('va-do--done'); doBtnRef.current.innerHTML = CHECK_SVG }
          if (verdictRef.current) verdictRef.current.textContent = 'Ring closed'
          if (bandRef.current) (bandRef.current as HTMLElement).style.width = '88%'
          if (numRef.current) countTo(numRef.current, 88)
        })
        await wait(700)
        if (stopRef.current) break

        // 2) expand 4 inputs
        await tap(toggleRef.current, () => {
          inputsRef.current?.classList.add('va-inputs--open')
          toggleRef.current?.classList.add('va-toggle--open')
        })
        await wait(900)
        if (stopRef.current) break

        // 3) collapse + switch tab
        await tap(toggleRef.current, () => {
          inputsRef.current?.classList.remove('va-inputs--open')
          toggleRef.current?.classList.remove('va-toggle--open')
        })
        const tab1 = tabsRef.current?.[1]
        await tap(tab1 ?? undefined, () => {
          tabsRef.current?.forEach(t => t?.classList.remove('va-tab--on'))
          tabsRef.current?.[1]?.classList.add('va-tab--on')
        })
        await wait(900)
        if (stopRef.current) break

        fingerRef.current?.classList.remove('va-finger--show')
        await wait(800)
      }
    }

    // start only when phone screen enters viewport
    const io = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) { io.disconnect(); setTimeout(loop, 600) } }),
      { threshold: 0.35 }
    )
    io.observe(screenRef.current)
    return () => { stopRef.current = true; io.disconnect() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
