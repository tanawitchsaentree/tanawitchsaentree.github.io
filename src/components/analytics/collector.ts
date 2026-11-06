/**
 * Sends every analytics event, in order, to the portfolio's own collector (Cloudflare Worker + D1,
 * source in ~/Downloads/portfolio-analytics). GoatCounter keeps getting the same events as totals.
 *
 * Privacy: no cookies, nothing written to the visitor's device. The visit id is a random value held in
 * memory; it survives in-site navigation and is gone when the tab closes. The collector stores no IP address.
 * Owner's own visits: open any page with ?analytics=off once per device (this sets a flag on that device
 * only); ?analytics=on removes it.
 */

const ENDPOINT = 'https://portfolio-analytics.tanawitchsaentree.workers.dev/e'
const PROD_HOST = 'tanawitchsaentree.github.io'
const FLUSH_MS = 5000

type Queued = { t: number; p: string; n: string; d?: string }

let endpoint = ENDPOINT
let visit = ''
let queue: Queued[] = []
let meta: Record<string, string> | null = null
let started = false
let enabled = false
const leaveHooks = new Set<() => void>()

/**
 * Run `fn` when the visitor leaves or hides the tab, before the last batch is sent. Listener order on
 * window is not reliable across browsers, so exit events go through here instead of their own listener.
 */
export function onLeaving(fn: () => void): () => void {
  setup()
  leaveHooks.add(fn)
  return () => { leaveHooks.delete(fn) }
}

function leaving() {
  for (const fn of leaveHooks) { try { fn() } catch { /* one bad hook must not drop the batch */ } }
  flush(true)
}

function setup() {
  if (started || typeof window === 'undefined') return
  started = true
  // Leave hooks run even when the collector is off, so GoatCounter still gets exit events.
  window.addEventListener('pagehide', leaving)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') leaving() })
  const params = new URLSearchParams(window.location.search)
  try {
    if (params.get('analytics') === 'off') localStorage.setItem('analytics-ignore', '1')
    if (params.get('analytics') === 'on') localStorage.removeItem('analytics-ignore')
    if (localStorage.getItem('analytics-ignore') === '1') return
  } catch { /* storage blocked: keep tracking, nothing is stored anyway */ }
  const debug = params.get('track') === 'dev'
  if (window.location.hostname !== PROD_HOST && !debug) return
  if (navigator.webdriver && !debug) return
  enabled = true
  if (debug) endpoint = 'http://localhost:8787/e' // `npx wrangler dev` in ~/Downloads/portfolio-analytics
  visit = crypto.randomUUID()
  let referrer = ''
  try { if (document.referrer) { const r = new URL(document.referrer); if (r.hostname !== window.location.hostname) referrer = `${r.origin}${r.pathname}` } } catch { /* ignore */ }
  meta = {
    screen: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    lang: navigator.language || '',
    ref: params.get('ref') || params.get('utm_source') || '',
    referrer,
    entry: window.location.pathname,
  }
  window.setInterval(() => flush(false), FLUSH_MS)
}

function flush(leaving: boolean) {
  if (!enabled || !queue.length) return
  const body = JSON.stringify({ v: visit, meta, e: queue.splice(0, 100) })
  meta = null // the visit row is written once; later batches only carry events
  const blob = new Blob([body], { type: 'text/plain' })
  if (leaving || !('fetch' in window)) navigator.sendBeacon?.(endpoint, blob)
  else fetch(endpoint, { method: 'POST', body: blob, keepalive: true, mode: 'cors' }).catch(() => {})
}

/** Record one event. `name` uses the same paths GoatCounter gets (read/..., open/..., exit/...). */
let lastPage = { path: '', t: 0 }

export function record(name: string, detail?: string) {
  setup()
  if (!enabled) return
  const now = Date.now()
  const path = window.location.pathname
  if (name === 'page') {
    if (lastPage.path === path && now - lastPage.t < 2000) return // same page counted twice by a re-run effect
    lastPage = { path, t: now }
  }
  const d = detail ? detail.slice(0, 200) : undefined
  const prev = queue[queue.length - 1]
  if (prev && prev.n === name && prev.d === d && prev.p === path && now - prev.t < 500) return // same event fired twice in a row
  queue.push({ t: now, p: path, n: name, d })
  if (queue.length >= 50) flush(false)
}
