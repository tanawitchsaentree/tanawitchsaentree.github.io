// Gated case-study content. Story text and sample data are not in the JS bundle: they ship
// as AES-GCM blobs (scripts/encrypt-gated.mjs) and are decrypted in the browser after the
// password is entered. The gate stores the decrypted object here before it renders the page.

const store: Record<string, Record<string, unknown> | undefined> = {}

export function setGated(name: string, data: Record<string, unknown>) {
  store[name] = data
}
export const hasGated = (name: string) => store[name] !== undefined

/**
 * A live view of one key of a gated blob. Reads happen at render time (after unlock), so
 * modules can export these at the top level like ordinary constants.
 */
export function gated<T extends object>(name: string, key: string): T {
  const read = () => {
    const d = store[name]
    if (!d) throw new Error(`Gated content "${name}" is read before it was unlocked`)
    return d[key] as object
  }
  return new Proxy(Object.create(null), {
    get(_, p) { const v = read() as Record<PropertyKey, unknown>; const r = v[p]; return typeof r === 'function' ? (r as (...a: unknown[]) => unknown).bind(v) : r },
    has(_, p) { return p in read() },
    ownKeys() { return Reflect.ownKeys(read()) },
    getOwnPropertyDescriptor(_, p) { const d = Reflect.getOwnPropertyDescriptor(read(), p); return d && { ...d, configurable: true } },
  }) as T
}
