// View Transitions API — not yet in TypeScript's lib.dom.d.ts
interface Document {
  startViewTransition?: (callback: () => void | Promise<void>) => ViewTransition
}

interface ViewTransition {
  ready: Promise<void>
  finished: Promise<void>
  updateCallbackDone: Promise<void>
  skipTransition: () => void
}
