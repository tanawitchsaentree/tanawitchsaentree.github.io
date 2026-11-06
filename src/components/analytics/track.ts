import { record } from './collector'

type GoatCounter = { count: (data: { path: string; title?: string; event?: boolean }) => void }

/** One named event to GoatCounter (totals) and the portfolio collector (visit in order). */
export function track(path: string, title = path, detail?: string) {
  if (typeof window === 'undefined') return
  ;(window as unknown as { goatcounter?: GoatCounter }).goatcounter?.count({ path, title, event: true })
  record(path, detail)
}
