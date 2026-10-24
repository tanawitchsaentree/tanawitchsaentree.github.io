// Build step for the gated case studies. The plaintext (content/gated/<name>.json) is
// local only and never committed; the encrypted blobs (public/gated/<name>.json) are.
//
// - Plaintext present (local): re-encrypt only if the committed blob no longer matches,
//   i.e. it doesn't decrypt with the current password to the same plaintext. Otherwise the
//   blob is left byte-for-byte untouched, so salt and IV stay stable and deploys don't log
//   visitors out.
// - Plaintext absent (CI): use the committed blob as is.
//
// PBKDF2-SHA-256 from GATE_PASSWORD (default for local work below), random salt per
// encryption; AES-GCM-256, random IV. Node 18+, no network, no dependencies.
import { webcrypto as crypto } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const ITERATIONS = 310_000
const password = process.env.GATE_PASSWORD || '1234'
// invitrace carries no content yet: its blob only lets the gate check the password.
const BLOBS = [
  { name: 'claims', source: 'content/gated/claims.json' },
  { name: 'docsort', source: 'content/gated/docsort.json' },
  { name: 'invitrace', source: null },
]

const enc = new TextEncoder(), dec = new TextDecoder()
const b64 = buf => Buffer.from(buf).toString('base64')
const unb64 = s => new Uint8Array(Buffer.from(s, 'base64'))

async function deriveKey(salt, iterations, usage) {
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, base, { name: 'AES-GCM', length: 256 }, false, [usage])
}

/** The committed blob's plaintext under the current password, or null if it doesn't open. */
async function openExisting(file) {
  try {
    const blob = JSON.parse(await readFile(file, 'utf8'))
    const key = await deriveKey(unb64(blob.salt), blob.iter, 'decrypt')
    return dec.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(blob.iv) }, key, unb64(blob.ct)))
  } catch { return null }
}

await mkdir('public/gated', { recursive: true })
for (const { name, source } of BLOBS) {
  const out = `public/gated/${name}.json`
  if (source && !existsSync(source)) {
    if (!existsSync(out)) { console.error(`gated: ${name}: no plaintext and no committed blob (${out})`); process.exit(1) }
    console.log(`gated: ${name}: no local plaintext, using the committed blob`)
    continue
  }
  const plain = source ? JSON.stringify(JSON.parse(await readFile(source, 'utf8'))) : '{}'
  if (existsSync(out) && (await openExisting(out)) === plain) {
    console.log(`gated: ${name}: unchanged, blob kept`)
    continue
  }
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(salt, ITERATIONS, 'encrypt')
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plain))
  await writeFile(out, JSON.stringify({ v: 1, iter: ITERATIONS, salt: b64(salt), iv: b64(iv), ct: b64(ct) }))
  console.log(`gated: ${name}: encrypted (${plain.length} bytes) → ${out}`)
}
