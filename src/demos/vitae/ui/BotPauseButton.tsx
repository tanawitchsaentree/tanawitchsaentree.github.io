'use client'

import { useState } from 'react'
import { V } from '../tokens'

/** Pause/play for a ghost-finger demo loop (WCAG 2.2.2), independent of prefers-reduced-motion.
 *  Place it inside the phone's positioned chassis. It flags that chassis with
 *  data-bot-paused; the bot's gate (ui/botGate.ts) holds its next step until it clears. */
export function BotPauseButton() {
  const [paused, setPaused] = useState(false)
  return (
    <button
      type="button"
      aria-label={paused ? 'Play demo animation' : 'Pause demo animation'}
      aria-pressed={paused}
      onClick={e => {
        const next = !paused
        const host = e.currentTarget.parentElement
        if (host) host.dataset.botPaused = String(next)
        setPaused(next)
        document.dispatchEvent(new Event(BOT_TOGGLE_EVENT))
      }}
      style={{
        position: 'absolute', top: -20, right: -6, zIndex: 30,
        width: 34, height: 34, borderRadius: '50%', padding: 0,
        display: 'grid', placeContent: 'center', cursor: 'pointer',
        background: V.color.phone, color: V.color.white,
        border: `1px solid ${V.alpha.paper14}`,
      }}
    >
      {paused ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
      )}
    </button>
  )
}

export const BOT_TOGGLE_EVENT = 'vitae-bot-toggle'
