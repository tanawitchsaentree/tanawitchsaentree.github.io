'use client'

import { useState, useCallback, useRef } from 'react'
import styles from './HeroPolaroids.module.css'

const PHOTOS = [
  { base: '/images/timhortons/heroes-1', caption: '5am. snow. clocked in.' },
  { base: '/images/timhortons/heroes6',  caption: 'day one'                },
  { base: '/images/timhortons/hereos5',  caption: 'the floor'              },
  { base: '/images/timhortons/heroes4',  caption: 'the case'               },
  { base: '/images/timhortons/heroes-3', caption: 'fv cold brew. daily.'   },
  { base: '/images/timhortons/heroes-2', caption: 'the machine'            },
]

// Slot offsets: index 0 = top (front), last = bottom (back)
// Backing cards use CSS transition to glide to new slot when deck rotates.
const OFFSETS = [
  { rot:  1.8, tx:   0, ty:   0 },  // top
  { rot: -5.2, tx: -11, ty:   5 },
  { rot:  6.8, tx:  13, ty:  10 },
  { rot: -8.1, tx: -17, ty:  15 },
  { rot:  7.5, tx:  17, ty:  20 },
  { rot: -4.8, tx: -10, ty:  25 },  // bottom
]

const N = PHOTOS.length

export function HeroPolaroids() {
  // `order[i]` = photoIdx at depth i (0 = top/front)
  const [order, setOrder]       = useState<number[]>(() => PHOTOS.map((_, i) => i))
  // photoIdx currently flying the arc (or null)
  const [arcIdx, setArcIdx]     = useState<number | null>(null)
  const busyRef                 = useRef(false)

  const shuffle = useCallback(() => {
    if (busyRef.current) return
    busyRef.current = true

    const departingIdx = order[0]

    // 1. Mark the top card as arcCard — keyframe takes over immediately.
    //    At the same moment, all other cards get their new slot offset via
    //    CSS transition (they shift forward by one slot).
    setArcIdx(departingIdx)

    // 2. Also immediately commit the new order so backing cards start
    //    transitioning to their new (shallower) slot positions right away.
    //    The arc card ignores the slot system while `arcIdx` is set.
    setOrder(prev => {
      const next = [...prev]
      next.push(next.shift()!)   // top → bottom
      return next
    })

    // 3. After the keyframe finishes (850ms), clear arcIdx — the card
    //    is now visually sitting at its final OFFSETS[N-1] position
    //    (keyframe end matches OFFSETS[5] exactly), so removing arcCard
    //    and handing back to CSS transform is seamless.
    setTimeout(() => {
      setArcIdx(null)
      busyRef.current = false
    }, 880)
  }, [order])

  return (
    <div
      className={styles.deckWrap}
      onClick={shuffle}
      role="button"
      tabIndex={0}
      aria-label="Browse photos — click to cycle"
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && shuffle()}
    >
      <div className={`${styles.deck}${arcIdx !== null ? ` ${styles.busy}` : ''}`}>
        {/* Render bottom-to-top so front card paints last (on top visually) */}
        {[...order].reverse().map((photoIdx, reversedDepth) => {
          const depth = N - 1 - reversedDepth  // 0 = front

          const isArcCard = photoIdx === arcIdx
          const isTop     = depth === 0 && !isArcCard

          // Arc card: keyframe drives it; ignore slot offsets during flight.
          // Backing cards: CSS transition to their current slot.
          const offset = OFFSETS[Math.min(depth, OFFSETS.length - 1)]

          const cardClass = [
            styles.card,
            isTop     ? styles.isTop   : '',
            isArcCard ? styles.arcCard : '',
          ].filter(Boolean).join(' ')

          const photo = PHOTOS[photoIdx]
          return (
            <div
              key={photo.base}
              className={cardClass}
              style={{
                '--rot': `${offset.rot}deg`,
                '--tx':  `${offset.tx}px`,
                '--ty':  `${offset.ty}px`,
                // Arc card: let the keyframe own z-index (no inline override)
                // Backing cards: deeper = lower z
                ...(isArcCard ? {} : { zIndex: N - depth }),
              } as React.CSSProperties}
              aria-hidden={!isTop}
            >
              <div className={styles.frame}>
                <div className={styles.photoWrap}>
                  <picture>
                    <source srcSet={`${photo.base}.avif`} type="image/avif" />
                    <source srcSet={`${photo.base}.jpg`}  type="image/jpeg" />
                    <img
                      src={`${photo.base}.jpg`}
                      alt={photo.caption}
                      width={220}
                      height={258}
                      className={styles.photo}
                      loading={depth <= 1 ? 'eager' : 'lazy'}
                      decoding={depth <= 1 ? 'sync' : 'async'}
                      draggable={false}
                    />
                  </picture>
                </div>
                <figcaption className={styles.caption}>
                  {photo.caption}
                </figcaption>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
