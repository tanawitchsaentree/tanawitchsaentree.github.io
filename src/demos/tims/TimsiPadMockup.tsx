'use client'

import { useRef, useState, useEffect } from 'react'

/** Messages the POS iframe sends to the page (see the "Parent page link" block in tims-pos.html). */
export type PosMessage =
  | { source: 'tims-pos'; type: 'taps'; taps: number }
  | { source: 'tims-pos'; type: 'paid'; taps: number }
  | { source: 'tims-pos'; type: 'cart'; lines: PosLine[] }
  | { source: 'tims-pos'; type: 'reset'; reason: 'clear' | 'paid' }
export type PosLine = { id: string | null; name: string; qty: number; size: string | null; cream: number | null; sugar: number | null; iced: boolean }

export function TimsiPadMockup({ onPosMessage, resetKey = 0 }: { onPosMessage?: (m: PosMessage) => void; resetKey?: number } = {}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [reduce, setReduce] = useState(false)
  useEffect(() => { setReduce(matchMedia('(prefers-reduced-motion: reduce)').matches) }, [])
  const handler = useRef(onPosMessage)
  useEffect(() => { handler.current = onPosMessage }, [onPosMessage])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const onLoad = () => setLoaded(true)
    // Eager iframe can finish before hydration attaches the listener.
    try {
      if (iframe.contentDocument?.readyState === 'complete' && iframe.contentDocument.URL !== 'about:blank') setLoaded(true)
    } catch { /* cross-origin: rely on the load event */ }
    iframe.addEventListener('load', onLoad)
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== iframe.contentWindow) return
      if (e.data?.source === 'tims-pos') handler.current?.(e.data as PosMessage)
    }
    window.addEventListener('message', onMessage)
    return () => { iframe.removeEventListener('load', onLoad); window.removeEventListener('message', onMessage) }
  }, [])

  useEffect(() => {
    if (!resetKey) return
    iframeRef.current?.contentWindow?.postMessage({ source: 'tims-slip', type: 'reset' }, window.location.origin)
  }, [resetKey])

  return (
    <div style={{ position: 'relative', aspectRatio: '16 / 10' }}>
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', gap: '.6rem', textAlign: 'center',
          fontSize: '.75rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg-muted)',
        }}>
          Loading terminal…
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/demos/tims-pos.html"
        title="Tims POS iPad terminal prototype"
        style={{
          width: '100%', height: '100%', border: 'none', display: 'block',
          clipPath: loaded ? 'inset(0 0 0 0 round 52px)' : 'inset(50% 50% 50% 50% round 52px)',
          transition: reduce ? 'none' : 'clip-path .6s cubic-bezier(.16,1,.3,1)',
        }}
        allow="autoplay"
        loading="eager"
      />
    </div>
  )
}
