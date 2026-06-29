'use client'

import { useEffect, useRef } from 'react'
import { V } from '../tokens'

export interface Bar {
  day:    string
  score?: number
  verdict?: string
  low?:   boolean
}

export interface ChartBotRefs {
  screenRef:  React.RefObject<HTMLDivElement | null>
  fingerRef:  React.RefObject<HTMLDivElement | null>
  rippleRef:  React.RefObject<HTMLDivElement | null>
  barEls:     React.RefObject<(HTMLDivElement | null)[]>
  detailRef:  React.RefObject<HTMLDivElement | null>
  dayRef:     React.RefObject<HTMLSpanElement | null>
  scoreRef:   React.RefObject<HTMLSpanElement | null>
  verdictRef: React.RefObject<HTMLSpanElement | null>
  noteRef:    React.RefObject<HTMLSpanElement | null>
}

const FINGER_W = 14

function wait(ms: number) { return new Promise<void>(r => setTimeout(r, ms)) }

function getScale(screen: HTMLElement) {
  return screen.getBoundingClientRect().width / screen.offsetWidth || 1
}

function centerOf(el: Element, screen: HTMLElement) {
  const f = getScale(screen)
  const sr = screen.getBoundingClientRect()
  const er = el.getBoundingClientRect()
  return {
    x: (er.left - sr.left) / f + er.width  / f / 2,
    y: (er.top  - sr.top)  / f + er.height / f / 2,
  }
}

export function useChartBot(bars: Bar[], refs: ChartBotRefs) {
  const stopRef = useRef(false)

  useEffect(() => {
    stopRef.current = false
    const { screenRef, fingerRef, rippleRef, barEls, detailRef,
            dayRef, scoreRef, verdictRef, noteRef } = refs
    if (!screenRef.current) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function setActive(idx: number) {
      barEls.current?.forEach((el, i) => el?.classList.toggle('vhb--on', i === idx))
    }

    function showBar(idx: number) {
      const b = bars[idx]
      setActive(idx)
      const low = !!b.low
      detailRef.current?.classList.toggle('vhd--lowconf', low)
      if (dayRef.current)     dayRef.current.textContent     = b.day
      if (scoreRef.current)   scoreRef.current.textContent   = low ? '—' : String(b.score ?? '')
      if (verdictRef.current) verdictRef.current.textContent = low ? 'Not enough data' : (b.verdict ?? '')
      if (noteRef.current)    noteRef.current.textContent    = low
        ? 'Only 2 of 4 signals — missed sleep. No score invented.'
        : 'All 4 signals in.'
    }

    function rip(c: { x: number; y: number }) {
      const r = rippleRef.current
      if (!r) return
      r.style.setProperty('--rx', `${c.x - FINGER_W}px`)
      r.style.setProperty('--ry', `${c.y - FINGER_W}px`)
      r.classList.remove('vhr--go')
      void r.offsetWidth
      r.classList.add('vhr--go')
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
      finger.classList.add('vhf--press')
      rip(c)
      await wait(V.motion.fingerPressMs)
      finger.classList.remove('vhf--press')
      cb?.()
      await wait(V.motion.fingerSettleMs)
    }

    async function loop() {
      const wedIdx = bars.findIndex(b => b.day === 'Wed')
      const satIdx = bars.findIndex(b => b.day === 'Sat')
      const friIdx = bars.findIndex(b => b.low)

      while (!stopRef.current) {
        showBar(wedIdx >= 0 ? wedIdx : 0)
        await wait(reduce ? 2600 : 1100)
        if (stopRef.current) break

        if (reduce) {
          if (friIdx >= 0) showBar(friIdx)
          await wait(3000)
          continue
        }

        fingerRef.current?.classList.add('vhf--show')
        await wait(V.motion.fingerAppearMs)

        if (satIdx >= 0) await tap(barEls.current?.[satIdx], () => showBar(satIdx))
        await wait(V.motion.fingerIdleMs)
        if (stopRef.current) break

        if (friIdx >= 0) await tap(barEls.current?.[friIdx], () => showBar(friIdx))
        await wait(V.motion.fingerDwellMs)
        if (stopRef.current) break

        if (wedIdx >= 0) await tap(barEls.current?.[wedIdx], () => showBar(wedIdx))
        await wait(V.motion.fingerPreExitMs)
        if (stopRef.current) break

        fingerRef.current?.classList.remove('vhf--show')
        await wait(V.motion.fingerExitMs)
      }
    }

    // start only when screen enters viewport
    const io = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) { io.disconnect(); setTimeout(loop, 600) } }),
      { threshold: 0.4 }
    )
    io.observe(screenRef.current)
    return () => { stopRef.current = true; io.disconnect() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
