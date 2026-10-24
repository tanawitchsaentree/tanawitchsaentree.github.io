// Visibility gate for the ghost-finger demo loops. Every wait() resolves only after its
// timer AND once the phone is on screen again, so a loop freezes in place while scrolled
// away and resumes where it left off. stop() cancels pending timers; the loop's promises
// are left unresolved, so nothing runs after unmount.
// It also holds while the phone's pause button (ui/BotPauseButton.tsx) has flagged the chassis.
const BOT_TOGGLE_EVENT = 'vitae-bot-toggle'

export function createBotGate(el: Element, threshold: number) {
  let visible = false
  const paused = () => !!el.closest('[data-bot-paused="true"]')
  let stopped = false
  let resumers: (() => void)[] = []
  const timers = new Set<ReturnType<typeof setTimeout>>()

  const io = new IntersectionObserver(entries => entries.forEach(e => {
    visible = e.isIntersecting
    flush()
  }), { threshold })
  io.observe(el)

  function flush() {
    if (!visible || paused()) return
    const r = resumers; resumers = []; r.forEach(f => f())
  }
  document.addEventListener(BOT_TOGGLE_EVENT, flush)

  const untilVisible = () =>
    visible && !paused() ? Promise.resolve() : new Promise<void>(r => { if (!stopped) resumers.push(r) })

  async function wait(ms: number) {
    await new Promise<void>(r => {
      const t = setTimeout(() => { timers.delete(t); r() }, ms)
      timers.add(t)
    })
    await untilVisible()
  }

  function stop() {
    stopped = true
    io.disconnect()
    document.removeEventListener(BOT_TOGGLE_EVENT, flush)
    timers.forEach(clearTimeout)
    timers.clear()
    resumers = []
  }

  return { wait, untilVisible, stop }
}
