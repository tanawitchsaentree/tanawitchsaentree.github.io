/**
 * Parametric point clouds — each function fills a Float32Array(count*3) with
 * positions for one mathematical form. The particle system morphs between them.
 * All shapes are normalized to roughly a unit-ish radius so morphs stay framed.
 */

const TAU = Math.PI * 2
const GOLDEN = Math.PI * (3 - Math.sqrt(5)) // golden angle

/** Evenly distributed points on a sphere (Fibonacci lattice). */
export function sphere(out: Float32Array, n: number, R = 1.15) {
  for (let i = 0; i < n; i++) {
    const y = 1 - (i + 0.5) / n * 2          // -1..1
    const r = Math.sqrt(1 - y * y)
    const a = GOLDEN * i
    out[i * 3]     = Math.cos(a) * r * R
    out[i * 3 + 1] = y * R
    out[i * 3 + 2] = Math.sin(a) * r * R
  }
}

/** A (p,q) torus knot curve, with a little radial jitter to give it volume. */
export function torusKnot(out: Float32Array, n: number, p = 2, q = 3, scale = 0.62) {
  for (let i = 0; i < n; i++) {
    const t = (i / n) * TAU
    const r = Math.cos(q * t) + 2
    // jitter around the tube so it reads as a solid knot, not a wire
    const j = (((i * 9301 + 49297) % 233280) / 233280) // cheap hash 0..1
    const jr = 0.12 * (j - 0.5)
    out[i * 3]     = (r * Math.cos(p * t)) * scale + jr
    out[i * 3 + 1] = (r * Math.sin(p * t)) * scale + jr
    out[i * 3 + 2] = (Math.sin(q * t) * 1.4) * scale + jr
  }
}

function superformula(angle: number, m: number, n1: number, n2: number, n3: number) {
  const t1 = Math.pow(Math.abs(Math.cos(m * angle / 4)), n2)
  const t2 = Math.pow(Math.abs(Math.sin(m * angle / 4)), n3)
  return Math.pow(t1 + t2, -1 / n1)
}

/**
 * 3D supershape via the spherical product of two superformulae (Gielis).
 * The defaults make a faceted, crystalline star-ish form.
 */
export function supershape(
  out: Float32Array, n: number,
  m1 = 7, n11 = 0.2, n12 = 1.7, n13 = 1.7,
  m2 = 7, n21 = 0.2, n22 = 1.7, n23 = 1.7,
  R = 1.2,
) {
  for (let i = 0; i < n; i++) {
    // map index → (lat, lon) on a Fibonacci-ish grid for even coverage
    const v = (i + 0.5) / n
    const lon = (v * TAU * 13.0) % TAU - Math.PI   // wrap longitude
    const lat = Math.acos(1 - 2 * v) - Math.PI / 2 // -pi/2..pi/2
    const r1 = superformula(lon, m1, n11, n12, n13)
    const r2 = superformula(lat, m2, n21, n22, n23)
    out[i * 3]     = R * r1 * Math.cos(lon) * r2 * Math.cos(lat)
    out[i * 3 + 1] = R * r2 * Math.sin(lat)
    out[i * 3 + 2] = R * r1 * Math.sin(lon) * r2 * Math.cos(lat)
  }
}

/** A double helix / DNA-ish ribbon pair. */
export function helix(out: Float32Array, n: number, turns = 4, R = 0.6, H = 1.8) {
  for (let i = 0; i < n; i++) {
    const t = i / n
    const a = t * TAU * turns
    const strand = i % 2 === 0 ? 0 : Math.PI // two strands, opposite phase
    out[i * 3]     = Math.cos(a + strand) * R
    out[i * 3 + 1] = (t - 0.5) * H
    out[i * 3 + 2] = Math.sin(a + strand) * R
  }
}

/** A flat-ish spiral galaxy disc with arm structure. */
export function galaxy(out: Float32Array, n: number, arms = 3, R = 1.3) {
  for (let i = 0; i < n; i++) {
    const t = (i / n)
    const rad = Math.sqrt(t) * R
    const arm = (i % arms) * (TAU / arms)
    const a = rad * 3.2 + arm
    const h = (((i * 12347) % 1000) / 1000 - 0.5) * 0.12 // thin disc thickness
    out[i * 3]     = Math.cos(a) * rad
    out[i * 3 + 1] = h
    out[i * 3 + 2] = Math.sin(a) * rad
  }
}

export type ShapeName = 'sphere' | 'knot' | 'supershape' | 'helix' | 'galaxy'

/** Fill `out` with the named shape. */
export function buildShape(name: ShapeName, out: Float32Array, n: number) {
  switch (name) {
    case 'sphere':     sphere(out, n); break
    case 'knot':       torusKnot(out, n); break
    case 'supershape': supershape(out, n); break
    case 'helix':      helix(out, n); break
    case 'galaxy':     galaxy(out, n); break
  }
}
