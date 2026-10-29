'use client'

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight, LockKeyhole } from 'lucide-react'
import { ENTRIES, TABS, type Entry, type ModalKey } from '@/data/entries'
import styles from './WorkTabs.module.css'

type TabId = (typeof TABS)[number]['id']

const inTab = (e: Entry, tab: TabId) => tab === 'all' || e.categories.includes(tab)

function Actions({ entry, onOpen }: { entry: Entry; onOpen: (key: ModalKey) => void }) {
  const { primary, external } = entry
  return (
    <div className={styles.actions}>
      {primary?.type === 'case' && (
        <Link href={primary.href} className={styles.action}>
          View case study <ArrowRight size={14} aria-hidden="true" />
          <span className="sr-only">: {entry.title}</span>
        </Link>
      )}
      {primary?.type === 'case' && primary.protected && (
        <span className={styles.lock}><LockKeyhole size={11} aria-hidden="true" /> Password required</span>
      )}
      {primary?.type === 'modal' && (
        <button type="button" className={styles.action} onClick={() => onOpen(primary.key)} aria-haspopup="dialog">
          {primary.label} <ArrowRight size={14} aria-hidden="true" />
          <span className="sr-only">: {entry.title}</span>
        </button>
      )}
      {external && (
        <a href={external.href} className={primary ? styles.actionQuiet : styles.action} target="_blank" rel="noopener noreferrer">
          {external.label} <ArrowUpRight size={12} aria-hidden="true" />
          <span className="sr-only"> ({entry.title}, opens in a new tab)</span>
        </a>
      )}
    </div>
  )
}

/** One row. Projects with a picture lead with it; everything else leads with who it was for and when. */
function Row({ entry, index, onOpen }: { entry: Entry; index: number; onOpen: (key: ModalKey) => void }) {
  const { thumb } = entry
  return (
    <li className={styles.row} data-kind={thumb ? 'project' : 'work'} style={{ '--i': index } as CSSProperties}>
      {thumb ? (
        <div className={styles.lead}>
          <span className={`${styles.thumb} ${thumb.contain ? styles.thumbContain : ''}`}>
            <Image src={thumb.src} alt="" fill sizes="(max-width: 480px) 64px, 96px" />
          </span>
        </div>
      ) : (
        <div className={`${styles.lead} ${styles.leadMeta}`}>
          <span className={styles.kind}>{entry.kind}</span>
          {entry.meta && <span className={styles.meta}>{entry.meta}</span>}
        </div>
      )}
      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.title}>{entry.title}</h3>
          {thumb && <span className={styles.tag}>{entry.kind}</span>}
        </div>
        {entry.role && <p className={styles.role}>{entry.role}</p>}
        <p className={styles.description}>{entry.description}</p>
        <Actions entry={entry} onOpen={onOpen} />
      </div>
    </li>
  )
}

export function WorkTabs({ onOpen }: { onOpen: (key: ModalKey) => void }) {
  const [tab, setTab] = useState<TabId>('all')
  const [moved, setMoved] = useState(false)
  const [ready, setReady] = useState(false)
  const baseId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const barRef = useRef<HTMLSpanElement>(null)

  const place = useCallback(() => {
    const i = TABS.findIndex(t => t.id === tab)
    const el = tabRefs.current[i]
    const bar = barRef.current
    if (!el || !bar) return
    bar.style.setProperty('--bar-x', `${el.offsetLeft}px`)
    bar.style.setProperty('--bar-w', String(el.offsetWidth))
  }, [tab])

  useLayoutEffect(() => { place(); setReady(true) }, [place])

  const select = (id: TabId) => { setMoved(true); setTab(id) }

  // Keep the chosen tab in view when the row scrolls (narrow screens), and hide the edge cue at the end.
  const scrollerRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const edge = useCallback(() => {
    const sc = scrollerRef.current
    if (!sc || !wrapRef.current) return
    wrapRef.current.dataset.end = String(sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 6)
  }, [])
  useEffect(() => { edge() }, [edge, ready])

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const ro = new ResizeObserver(() => { place(); edge() })
    ro.observe(list)
    return () => ro.disconnect()
  }, [place, edge])
  useEffect(() => {
    if (!moved) return
    const i = TABS.findIndex(t => t.id === tab)
    tabRefs.current[i]?.scrollIntoView({ inline: 'nearest', block: 'nearest' })
  }, [tab, moved])

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = TABS.findIndex(t => t.id === tab)
    const next = e.key === 'ArrowRight' ? (i + 1) % TABS.length
      : e.key === 'ArrowLeft' ? (i - 1 + TABS.length) % TABS.length
      : e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : -1
    if (next < 0) return
    e.preventDefault()
    select(TABS[next].id)
    tabRefs.current[next]?.focus()
    // Clicks are counted by the Analytics component; key presses are counted here.
    ;(window as unknown as { goatcounter?: { count: (d: object) => void } }).goatcounter?.count({
      path: `tab/${TABS[next].label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, title: `Opened tab ${TABS[next].label}`, event: true,
    })
  }

  const visible = ENTRIES.filter(e => inTab(e, tab))

  return (
    <>
      <div ref={wrapRef} className={styles.tabsWrap}>
      <div ref={scrollerRef} className={styles.scroller} onScroll={edge}>
        <div ref={listRef} className={styles.tabs} role="tablist" aria-label="Filter work and projects">
          {TABS.map((t, i) => {
            const selected = t.id === tab
            return (
              <button
                key={t.id}
                ref={el => { tabRefs.current[i] = el }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${t.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                className={styles.tab}
                onClick={() => select(t.id)}
                onKeyDown={onKeyDown}
              >
                {t.label}
                <span className={styles.count}>{ENTRIES.filter(e => inTab(e, t.id)).length}</span>
              </button>
            )
          })}
          <span ref={barRef} className={styles.bar} data-ready={ready} aria-hidden="true" />
        </div>
      </div>
      </div>
      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${tab}`} tabIndex={0} className={styles.panel}>
        <ul key={tab} className={styles.list} data-moved={moved}>
          {visible.map((entry, index) => (
            <Row key={entry.id} entry={entry} index={index} onOpen={onOpen} />
          ))}
        </ul>
      </div>
    </>
  )
}
