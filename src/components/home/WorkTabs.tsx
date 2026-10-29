'use client'

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { KeyboardEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'framer-motion'
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
function Row({ entry, onOpen }: { entry: Entry; onOpen: (key: ModalKey) => void }) {
  const { thumb } = entry
  return (
    <div className={styles.row} data-kind={thumb ? 'project' : 'work'}>
      {thumb ? (
        <div className={styles.lead}>
          <span className={`${styles.thumb} ${thumb.contain ? styles.thumbContain : ''}`}>
            <Image src={thumb.src} alt="" fill loading="eager" sizes="(max-width: 480px) 64px, 96px" />
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
    </div>
  )
}

/** A list item that folds shut on exit. While it leaves it is inert and hidden from screen readers, so focus never lands in a vanishing row. */
function Item({ index, still, children }: { index: number; still: boolean; children: ReactNode }) {
  const isPresent = useIsPresent()
  const ref = useRef<HTMLLIElement>(null)
  useEffect(() => {
    const el = ref.current as (HTMLLIElement & { inert: boolean }) | null
    if (el) el.inert = !isPresent
  }, [isPresent])
  return (
    <motion.li
      ref={ref}
      className={styles.item}
      aria-hidden={isPresent ? undefined : true}
      initial={{ height: 0, overflow: 'hidden' }}
      animate={{ height: 'auto', transitionEnd: { overflow: 'visible' }, transition: { duration: still ? 0 : 0.6, delay: still ? 0 : Math.min(index, 5) * 0.04, ease: [0.16, 1, 0.3, 1] } }}
      exit={{ height: 0, overflow: 'hidden', transition: { duration: still ? 0 : 0.55, ease: [0.65, 0, 0.35, 1] } }}
    >
      {children}
    </motion.li>
  )
}

export function WorkTabs({ onOpen }: { onOpen: (key: ModalKey) => void }) {
  const [tab, setTab] = useState<TabId>('all')
  const [moved, setMoved] = useState(false)
  const still = useReducedMotion()
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
        <ul className={styles.list}>
          {/* Rows that stay glide to their new place, rows that leave fold shut, rows that arrive unfold. Nothing fades. */}
          <AnimatePresence initial={false}>
            {visible.map((entry, index) => (
              <Item key={entry.id} index={index} still={!!still}>
                <Row entry={entry} onOpen={onOpen} />
              </Item>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </>
  )
}
