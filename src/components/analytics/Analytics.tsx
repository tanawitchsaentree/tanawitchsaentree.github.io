'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackEngagement } from './engagement'
import { record } from './collector'

type GoatCounter = { count: (data: { path: string; title?: string; event?: boolean }) => void }

const gc = () => (typeof window === 'undefined' ? undefined : (window as unknown as { goatcounter?: GoatCounter }).goatcounter)

/** Every event goes to GoatCounter (totals) and to the portfolio's own collector (each visit in order). */
const send = (data: { path: string; title?: string; event?: boolean }) => {
  gc()?.count(data)
  record(data.event ? data.path : 'page', data.event ? undefined : data.path)
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/**
 * GoatCounter counts the first page load by itself, including the ?ref=<company> source on each application link.
 * This adds what it cannot see in a Next.js site: client-side page changes, project dialogs that open on the
 * home page, and clicks that leave the site (the Brick-forge demo, GitHub, email).
 * It also records how far a visitor scrolls and how long the page stays in view, once per milestone per page.
 * Nothing is stored on the visitor's device and no one is identified: GoatCounter sees the event name only.
 */
const DEPTHS = [25, 50, 75, 100]
const SECONDS = [15, 30, 60, 120, 300]

const pageKey = (pathname: string) => (pathname === '/' ? 'home' : slug(pathname))

export function Analytics() {
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) { first.current = false; record('page', pathname); return }
    send({ path: pathname })
  }, [pathname])

  useEffect(() => {
    const page = pageKey(pathname)
    const seenDepth = new Set<number>()
    const seenTime = new Set<number>()
    let visible = 0

    const onScroll = () => {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      if (scrollable <= 0) return
      const pct = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100))
      for (const d of DEPTHS) {
        if (pct >= d && !seenDepth.has(d)) {
          seenDepth.add(d)
          send({ path: `depth/${page}/${d}`, title: `Scrolled ${d}% of ${page}`, event: true })
        }
      }
    }
    const tick = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      visible += 1
      for (const t of SECONDS) {
        if (visible >= t && !seenTime.has(t)) {
          seenTime.add(t)
          send({ path: `time/${page}/${t}s`, title: `${t} seconds on ${page}`, event: true })
        }
      }
    }, 1000)

    window.addEventListener('scroll', onScroll, { passive: true })
    const stopEngagement = trackEngagement(page, data => send(data))
    return () => { window.removeEventListener('scroll', onScroll); window.clearInterval(tick); stopEngagement() }
  }, [pathname])

  useEffect(() => {
    const onCopy = () => {
      const text = window.getSelection()?.toString() || ''
      if (text.includes('@')) send({ path: 'copy/email', title: 'Copied the email address', event: true })
    }
    document.addEventListener('copy', onCopy)
    return () => document.removeEventListener('copy', onCopy)
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null
      const tab = target?.closest('button[role="tab"]')
      if (tab) {
        const label = (tab.firstChild?.textContent || '').trim()
        if (label) send({ path: `tab/${slug(label)}`, title: `Opened tab ${label}`, event: true })
        return
      }
      const dialogButton = target?.closest('button[aria-haspopup="dialog"]')
      if (dialogButton) {
        const name = (dialogButton.querySelector('.sr-only')?.textContent || '').replace(/^[:\s]+/, '').trim()
        if (name) send({ path: `open/${slug(name)}`, title: `Opened ${name}`, event: true })
        return
      }
      const a = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!a) return
      if (a.origin === window.location.origin && /\.(pdf|docx?|zip)$/i.test(a.pathname)) {
        send({ path: `download${a.pathname}`, title: `Downloaded ${a.pathname}`, event: true })
        return
      }
      if (a.protocol === 'mailto:') { send({ path: 'out/email', title: 'Email link', event: true }); return }
      if (a.origin && a.origin !== window.location.origin) {
        send({ path: `out/${a.hostname}${a.pathname === '/' ? '' : a.pathname}`, title: `Left for ${a.hostname}`, event: true })
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
