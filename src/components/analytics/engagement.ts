/**
 * Reading-level analytics for UX work (no cookies, nothing stored on the visitor's device, no text the
 * visitor typed). Each event goes to GoatCounter as a total and to the portfolio collector in visit order;
 * read a visit back with `node scripts/journeys.mjs` in job-engine.
 *
 * Events (the collector also gets click :: <label> and scroll-max, which GoatCounter does not)
 *   read/<page>/<block>/<5|15|30|60>s   time a block (the nearest heading above the reading line) was in view
 *   exit/<page>/<block>                 the block in view when the visitor left or hid the tab
 *   dialog/<name>/<5|15|30|60|120>s     how long a project dialog stayed open (sent on close)
 *   hover/<name>                        pointer rested 1s on a project row without opening it
 *   deadclick/<page>/<block>/<tag>      click on something that is not a link or control (image, heading...)
 *   rage/<page>/<block>                 three or more clicks within 700ms in the same spot
 *   copy/<page>/<block>                 copied text from the page (email copies keep their own event)
 */

import { onLeaving, record } from './collector'

type Count = (data: { path: string; title?: string; event: true }) => void

const READ_MARKS = [5, 15, 30, 60]
const DIALOG_MARKS = [5, 15, 30, 60, 120]
const INTERACTIVE = 'a,button,input,select,textarea,label,summary,details,[role="button"],[role="tab"],[tabindex]:not([tabindex="-1"])'

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)

const openDialog = () => document.querySelector<HTMLElement>('[role="dialog"]')

const dialogName = (d: HTMLElement) => slug((d.getAttribute('aria-labelledby') || '').replace(/-modal-title$|-title$/, '')) || 'dialog'

/** The block a point belongs to: the last heading (h1–h3) above it, inside the open dialog if there is one. */
export function blockAt(page: string, y = window.innerHeight * 0.4, from?: Element | null): string {
  const dialog = openDialog()
  const scope: ParentNode = dialog || document
  const headings = Array.from(scope.querySelectorAll<HTMLElement>('h1, h2, h3'))
  let current = ''
  if (from) {
    for (const h of headings) {
      if (h.compareDocumentPosition(from) & Node.DOCUMENT_POSITION_FOLLOWING || h.contains(from)) current = h.textContent || ''
    }
  } else {
    for (const h of headings) if (h.getBoundingClientRect().top <= y) current = h.textContent || ''
  }
  const block = slug(current) || 'top'
  return dialog ? `${page}/${dialogName(dialog)}/${block}` : `${page}/${block}`
}

export function trackEngagement(page: string, count: Count): () => void {
  const readTotals = new Map<string, number>()
  const sent = new Set<string>()
  const once = (path: string, title: string) => {
    if (sent.has(path)) return
    sent.add(path)
    count({ path, title, event: true })
  }

  // Reading time per block, counted only while the tab is visible.
  const tick = window.setInterval(() => {
    if (document.visibilityState !== 'visible') return
    const block = blockAt(page)
    const seconds = (readTotals.get(block) || 0) + 1
    readTotals.set(block, seconds)
    for (const m of READ_MARKS) if (seconds === m) once(`read/${block}/${m}s`, `Read ${block} for ${m}s`)
  }, 1000)

  // Where the visit ended. pagehide covers closing the tab and leaving; hidden covers switching away on phones.
  let exitSent = false
  let maxScroll = 0
  const onScrollMax = () => {
    const doc = document.documentElement
    const pct = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / Math.max(doc.scrollHeight, 1)) * 100))
    if (pct > maxScroll) maxScroll = pct
  }
  const onLeave = () => {
    if (exitSent) return
    exitSent = true
    record('scroll-max', `${maxScroll}%`) // collector only: furthest point reached on this page
    if (dialogSeen) {
      // left with a dialog still open (a project, or the password gate): how long it had been open
      record(`dialog/${dialogSeen}/left-open`, `${Math.round((Date.now() - dialogOpenedAt) / 1000)}s`)
    }
    count({ path: `exit/${blockAt(page)}`, title: `Left while reading ${blockAt(page)}`, event: true })
  }
  // A tab that comes back into view can leave again later.
  const onVisibility = () => { if (document.visibilityState === 'visible') exitSent = false }

  // Dialog open time, measured from when the dialog appears to when it is removed.
  let dialogOpenedAt = 0
  let dialogSeen = ''
  const observer = new MutationObserver(() => {
    const d = openDialog()
    if (d && !dialogSeen) { dialogSeen = dialogName(d); dialogOpenedAt = Date.now() }
    if (!d && dialogSeen) {
      const secs = (Date.now() - dialogOpenedAt) / 1000
      const mark = [...DIALOG_MARKS].reverse().find(m => secs >= m)
      count({ path: `dialog/${dialogSeen}/${mark ? `${mark}s` : 'under-5s'}`, title: `${dialogSeen} open ${Math.round(secs)}s`, event: true })
      dialogSeen = ''
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

  // Hover intent on project rows (fine pointers only; touch has no hover).
  const hoverTimers = new WeakMap<Element, number>()
  const rowName = (el: Element) => slug((el.querySelector('.sr-only')?.textContent || el.textContent || '').replace(/^[:\s]+/, ''))
  const onOver = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const row = (e.target as Element | null)?.closest('button[aria-haspopup="dialog"]')
    if (!row || hoverTimers.has(row)) return
    hoverTimers.set(row, window.setTimeout(() => once(`hover/${rowName(row)}`, `Hovered ${rowName(row)} 1s`), 1000))
  }
  const onOut = (e: PointerEvent) => {
    const row = (e.target as Element | null)?.closest('button[aria-haspopup="dialog"]')
    if (!row || (e.relatedTarget instanceof Node && row.contains(e.relatedTarget))) return
    window.clearTimeout(hoverTimers.get(row))
    hoverTimers.delete(row)
  }
  const onRowClick = (e: MouseEvent) => {
    const row = (e.target as Element | null)?.closest('button[aria-haspopup="dialog"]')
    if (row) { window.clearTimeout(hoverTimers.get(row)); hoverTimers.delete(row) }
  }

  // Dead clicks and rage clicks.
  let recent: { t: number; x: number; y: number }[] = []
  let rageSentAt = 0
  const onClick = (e: MouseEvent) => {
    const target = e.target as Element | null
    if (!target) return
    const now = Date.now()
    recent = recent.filter(c => now - c.t < 700 && Math.hypot(c.x - e.clientX, c.y - e.clientY) < 40)
    recent.push({ t: now, x: e.clientX, y: e.clientY })
    if (recent.length >= 3 && now - rageSentAt > 5000) {
      rageSentAt = now
      count({ path: `rage/${blockAt(page, e.clientY, target)}`, title: 'Rapid repeated clicks', event: true })
    }
    const control = target.closest(INTERACTIVE)
    if (control) {
      // collector only: every link or control clicked, by its visible label (or aria-label)
      const label = (control.getAttribute('aria-label') || control.textContent || '').replace(/\s+/g, ' ').trim()
      record('click', `${blockAt(page, e.clientY, target)} :: ${label.slice(0, 80)}`)
      return
    }
    if (target.closest('[role="dialog"] [aria-hidden="true"]')) return
    if (window.getSelection()?.toString()) return
    const tag = target.closest('img, figure, svg, picture, canvas, h1, h2, h3, h4')?.tagName.toLowerCase()
    if (tag) once(`deadclick/${blockAt(page, e.clientY, target)}/${tag}`, `Clicked a ${tag} that does nothing`)
  }

  const onCopy = () => {
    const text = window.getSelection()?.toString() || ''
    if (!text || text.includes('@')) return
    const node = window.getSelection()?.anchorNode
    once(`copy/${blockAt(page, undefined, node instanceof Element ? node : node?.parentElement)}`, 'Copied text')
  }

  const firstMeasure = window.setTimeout(onScrollMax, 1000) // after layout settles: what is on screen counts as reached
  window.addEventListener('scroll', onScrollMax, { passive: true })
  // The collector runs this before it sends its last batch, so exit events are never left behind.
  const stopLeaving = onLeaving(onLeave)
  document.addEventListener('visibilitychange', onVisibility)
  document.addEventListener('pointerover', onOver)
  document.addEventListener('pointerout', onOut)
  document.addEventListener('click', onRowClick, true)
  document.addEventListener('click', onClick, true)
  document.addEventListener('copy', onCopy)

  return () => {
    window.clearInterval(tick)
    observer.disconnect()
    window.clearTimeout(firstMeasure)
    window.removeEventListener('scroll', onScrollMax)
    stopLeaving()
    document.removeEventListener('visibilitychange', onVisibility)
    document.removeEventListener('pointerover', onOver)
    document.removeEventListener('pointerout', onOut)
    document.removeEventListener('click', onRowClick, true)
    document.removeEventListener('click', onClick, true)
    document.removeEventListener('copy', onCopy)
  }
}
