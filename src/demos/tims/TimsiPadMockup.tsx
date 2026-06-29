'use client'

import { useRef, useState, useEffect } from 'react'

export function TimsiPadMockup() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const onLoad = () => setLoaded(true)
    iframe.addEventListener('load', onLoad)
    return () => iframe.removeEventListener('load', onLoad)
  }, [])

  return (
    <div
      style={{
        position:    'relative',
        width:       '100%',
        aspectRatio: '16 / 10',
      }}
    >
      {/* skeleton while iframe loads */}
      {!loaded && (
        <div style={{
          position:      'absolute',
          inset:         0,
          display:       'grid',
          placeContent:  'center',
          gap:           '.6rem',
          textAlign:     'center',
          fontFamily:    'var(--font-mono, monospace)',
          fontSize:      '.75rem',
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          color:         'rgba(247,241,232,.55)',
        }}>
          <span style={{ fontSize: '1.6rem' }}>☕</span>
          Loading terminal…
        </div>
      )}

      <iframe
        ref={iframeRef}
        src="/demos/tims-pos.html"
        title="Tims POS — iPad terminal prototype"
        tabIndex={-1}
        style={{
          width:      '100%',
          height:     '100%',
          border:     'none',
          display:    'block',
          opacity:    loaded ? 1 : 0,
          transition: `opacity .4s cubic-bezier(.16,1,.3,1)`,
          pointerEvents: 'none',
        }}
        allow="autoplay"
        loading="lazy"
      />
    </div>
  )
}
