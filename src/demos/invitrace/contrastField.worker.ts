// Off-main-thread work for the contrast field: painting the plane (only when the hue or the
// size changes) and the nearest-passing search when a drop lands below 4.5:1.
import { computeField, nearestPassingOklch } from './oklch'

type Job = { kind: 'field'; id: number; hue: number; w: number; h: number; cMax: number } | { kind: 'snap'; id: number; L: number; C: number; hue: number }
const ctx = self as unknown as { onmessage: ((e: MessageEvent<Job>) => void) | null; postMessage: (m: unknown, t?: Transferable[]) => void }

ctx.onmessage = e => {
  const j = e.data
  if (j.kind === 'snap') { ctx.postMessage({ kind: 'snap', id: j.id, ...nearestPassingOklch(j.L, j.C, j.hue) }); return }
  const r = computeField(j.id, j.hue, j.w, j.h, j.cMax)
  ctx.postMessage({ kind: 'field', ...r }, [r.pixels.buffer, r.pass.buffer, r.large.buffer])
}
