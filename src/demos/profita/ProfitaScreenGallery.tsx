'use client'

import { useRef } from 'react'
import { P } from './tokens'
import { ProfitaPhoneScreen, PROFITA_PHONE_W, PROFITA_PHONE_H, type ScreenName } from './ProfitaPhoneScreen'
import { useContainerWidth } from './useContainerWidth'

const GALLERY: { label: string; caption: string; screen: ScreenName }[] = [
  { label: 'Order placed',   caption: 'Clear receipt. One tap to share or save.',       screen: 'ordersuccess' },
  { label: 'Switch fund',    caption: 'Toggle THB / Unit. Quick-percentage buttons.',   screen: 'switchfund'   },
  { label: 'Savings',        caption: 'Balance + expandable transaction history.',       screen: 'savings'      },
  { label: 'Select account', caption: 'Radio-select debit account before buying.',      screen: 'buyaccount'   },
]

export function ProfitaScreenGallery() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const vw = useContainerWidth()
  const galleryW = vw > 0 && vw < 640 ? Math.round(vw * 0.56) : 200

  return (
    <section
      id="screen-gallery"
      data-demo="profita"
      style={{
        padding:    'clamp(4rem,8vw,7rem) 0',
        fontFamily: P.font.body,
      }}
    >
      <div className="prof-wrap">
        <p className="prof-kick" style={{ marginBottom: '1.4rem' }}>
          06 · All screens
        </p>
        <h2 style={{
          fontFamily:    P.font.disp,
          fontWeight:    400,
          fontSize:      'clamp(1.5rem,3.5vw,2.6rem)',
          letterSpacing: '-.02em',
          lineHeight:    1.15,
          color:         P.color.on,
          margin:        '0 0 2.8rem',
          maxWidth:      '28ch',
        }}>
          Every edge covered,{' '}
          <em style={{ fontStyle: 'italic', color: P.color.gold }}>
            nothing left hanging.
          </em>
        </h2>
      </div>

      {/* Horizontal scroll strip — bleeds past prof-wrap */}
      <div
        ref={scrollRef}
        style={{
          display:                   'flex',
          gap:                       'clamp(1rem,2.5vw,1.5rem)',
          overflowX:                 'auto',
          padding:                   '0 clamp(1.5rem,6vw,4rem) 1.5rem',
          scrollSnapType:            'x mandatory',
          WebkitOverflowScrolling:   'touch',
          scrollbarWidth:            'none',
        }}
      >
        {GALLERY.map((item) => (
          <div
            key={item.label}
            style={{
              flexShrink:      0,
              scrollSnapAlign: 'start',
              display:         'flex',
              flexDirection:   'column',
              gap:             '1.2rem',
            }}
          >
            <div style={{ width: galleryW, height: PROFITA_PHONE_H * (galleryW / PROFITA_PHONE_W), position: 'relative', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${galleryW / PROFITA_PHONE_W})`, transformOrigin: 'top left', width: PROFITA_PHONE_W, height: PROFITA_PHONE_H }}>
                <ProfitaPhoneScreen screen={item.screen} />
              </div>
            </div>

            <div style={{ maxWidth: galleryW }}>
              <p style={{
                fontFamily:    P.font.mono,
                fontSize:      '12px',
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color:         P.color.gold,
                margin:        '0 0 .3rem',
              }}>
                {item.label}
              </p>
              <p style={{
                fontSize:   '1rem',
                color:      P.color.onMut,
                lineHeight: 1.55,
                margin:     0,
              }}>
                {item.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
