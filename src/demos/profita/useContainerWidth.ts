'use client'
import { useState, useEffect, useRef, RefObject } from 'react'

/** Returns the current pixel width of the referenced container (or window.innerWidth if no ref). */
export function useContainerWidth(ref?: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const target = ref?.current ?? document.documentElement

    const measure = () => {
      const w = ref?.current
        ? ref.current.getBoundingClientRect().width
        : window.innerWidth
      setWidth(Math.round(w))
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(target)
    return () => ro.disconnect()
  }, [ref])

  return width
}
