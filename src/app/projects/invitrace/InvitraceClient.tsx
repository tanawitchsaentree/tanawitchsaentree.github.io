'use client'

export function InvitraceClient() {
  return (
    <iframe
      src="/demos/invitrace-ds.html"
      title="Invitrace Design System — federated token architecture case study"
      style={{
        display:    'block',
        position:   'fixed',
        inset:      0,
        width:      '100%',
        height:     '100%',
        border:     'none',
        background: '#FFFFFF',
        zIndex:     1,
      }}
      allow="autoplay"
    />
  )
}
