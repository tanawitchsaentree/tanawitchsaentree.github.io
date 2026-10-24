// Browser side of the gate: PBKDF2-SHA-256 → AES-GCM-256 with WebCrypto. The password is
// never stored; on success the derived key (raw, base64) is remembered per blob so a
// returning visitor skips the prompt until the next build changes the salt.

export type GateBlob = { v: 1; iter: number; salt: string; iv: string; ct: string }

const fromB64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0))
const toB64 = (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b)))

const cache: Record<string, Promise<GateBlob>> = {}
export function fetchBlob(name: string): Promise<GateBlob> {
  return (cache[name] ??= fetch(`/gated/${name}.json`, { cache: 'no-store' }).then(r => {
    if (!r.ok) throw new Error(`Missing gated blob ${name}`)
    return r.json() as Promise<GateBlob>
  }))
}

async function decrypt(blob: GateBlob, key: CryptoKey): Promise<Record<string, unknown>> {
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(blob.iv) }, key, fromB64(blob.ct))
  return JSON.parse(new TextDecoder().decode(plain))
}

/** Derives the key from the password and decrypts. Throws if the password is wrong. */
export async function unlockWithPassword(name: string, password: string) {
  const blob = await fetchBlob(name)
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'])
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromB64(blob.salt), iterations: blob.iter },
    base, { name: 'AES-GCM', length: 256 }, true, ['decrypt'],
  )
  const data = await decrypt(blob, key)
  return { data, keyB64: toB64(await crypto.subtle.exportKey('raw', key)) }
}

/** Decrypts with a remembered key. Throws if the key no longer fits (e.g. a new build). */
export async function unlockWithKey(name: string, keyB64: string) {
  const blob = await fetchBlob(name)
  const key = await crypto.subtle.importKey('raw', fromB64(keyB64), { name: 'AES-GCM' }, false, ['decrypt'])
  return decrypt(blob, key)
}

/** Remembered keys live under one localStorage entry, keyed by blob name. */
export function readKeys(storageKey: string): Record<string, string> {
  try {
    const v = JSON.parse(localStorage.getItem(storageKey) ?? '{}')
    return v && typeof v === 'object' ? v : {}
  } catch { return {} }
}
export function writeKey(storageKey: string, name: string, keyB64: string | null) {
  try {
    const keys = readKeys(storageKey)
    if (keyB64) keys[name] = keyB64
    else delete keys[name]
    localStorage.setItem(storageKey, JSON.stringify(keys))
  } catch {}
}
