'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

type GoatCounter = { count: (data: { path: string; title?: string; event?: boolean }) => void }

const gc = () => (typeof window === 'undefined' ? undefined : (window as unknown as { goatcounter?: GoatCounter }).goatcounter)

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/**
 * GoatCounter counts the first page load by itself, including the ?ref=<company> source on each application link.
 * This adds what it cannot see in a Next.js site: client-side page changes, project dialogs that open on the
 * home page, and clicks that leave the site (the Brick-forge demo, GitHub, email).
 */
export function Analytics() {
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) { first.current = false; return }
    gc()?.count({ path: pathname })
  }, [pathname])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null
      const dialogButton = target?.closest('button[aria-haspopup="dialog"]')
      if (dialogButton) {
        const name = (dialogButton.querySelector('.sr-only')?.textContent || '').replace(/^[:\s]+/, '').trim()
        if (name) gc()?.count({ path: `open/${slug(name)}`, title: `Opened ${name}`, event: true })
        return
      }
      const a = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!a) return
      if (a.protocol === 'mailto:') { gc()?.count({ path: 'out/email', title: 'Email link', event: true }); return }
      if (a.origin && a.origin !== window.location.origin) {
        gc()?.count({ path: `out/${a.hostname}${a.pathname === '/' ? '' : a.pathname}`, title: `Left for ${a.hostname}`, event: true })
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
