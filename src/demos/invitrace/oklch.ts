// OKLCH ↔ sRGB and WCAG contrast against the white button text. Pure; shared by the
// contrast-field worker and the main thread (handle readout, snapping, markers).

export const C_MAX = 0.37
/** Relative luminance of raw.white (#FEFEFF), the button text colour. */
const WHITE_Y = (() => { const f = (c: number) => ((c / 255 + 0.055) / 1.055) ** 2.4; return 0.2126 * f(254) + 0.7152 * f(254) + 0.0722 * f(255) })()

/** OKLCH (hue in degrees) → linear sRGB. Channels outside 0..1 are out of gamut. */
export function oklchToLinear(L: number, C: number, hDeg: number): [number, number, number] {
  const h = (hDeg * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}
// Tolerance is tight on purpose: a loose one in linear light accepts near-black colours that don't exist.
const EPS = 1e-7
export const inGamut = ([r, g, b]: [number, number, number]) => r >= -EPS && r <= 1 + EPS && g >= -EPS && g <= 1 + EPS && b >= -EPS && b <= 1 + EPS
export const ratioOnWhite = ([r, g, b]: [number, number, number]) => (WHITE_Y + 0.05) / (0.2126 * r + 0.7152 * g + 0.0722 * b + 0.05)
const enc = (c: number) => { const v = Math.min(1, Math.max(0, c)); return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055 }
export const linearToBytes = (rgb: [number, number, number]) => rgb.map(c => Math.round(enc(c) * 255)) as [number, number, number]
export const oklchToHex = (L: number, C: number, h: number) => '#' + linearToBytes(oklchToLinear(L, C, h)).map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase()

export function hexToOklch(hex: string) {
  const lin = [1, 3, 5].map(i => { const c = parseInt(hex.slice(i, i + 2), 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 })
  const [r, g, b] = lin
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const C = Math.hypot(A, B)
  const h = C < 1e-4 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360
  return { L, C, h }
}

/** The largest in-gamut chroma at this lightness and hue. */
export function maxChroma(L: number, h: number) {
  let lo = 0, hi = C_MAX
  for (let i = 0; i < 18; i++) { const mid = (lo + hi) / 2; if (inGamut(oklchToLinear(L, mid, h))) lo = mid; else hi = mid }
  return lo
}

/** The chroma axis for one hue: the hue's real gamut plus a margin, so the plane isn't mostly hatch. */
export function chromaAxis(h: number) {
  let m = 0
  for (let L = 0.02; L < 1; L += 0.02) m = Math.max(m, maxChroma(L, h))
  return Math.min(C_MAX, Math.max(0.06, m * 1.12))
}

/** The nearest passing point at the same hue. Chroma counts four times as much as lightness,
    so a snap darkens the brand colour before it greys it out. */
export function nearestPassingOklch(L0: number, C0: number, h: number, min = 4.5) {
  let best = { L: 0, C: 0, d: Infinity }
  // Coarse pass over the whole in-gamut plane, then a fine pass around the winner.
  for (let L = 0; L <= 1; L += 0.005) {
    const cm = maxChroma(L, h)
    for (let C = 0; C <= cm; C += 0.004) {
      if (ratioOnWhite(oklchToLinear(L, C, h)) < min) continue
      const d = (L - L0) ** 2 + 4 * (C - C0) ** 2
      if (d < best.d) best = { L, C, d }
    }
  }
  for (let L = Math.max(0, best.L - 0.02); L <= Math.min(1, best.L + 0.02); L += 0.001) {
    const cm = maxChroma(L, h)
    for (let C = Math.max(0, best.C - 0.03); C <= Math.min(cm, best.C + 0.03); C += 0.001) {
      if (ratioOnWhite(oklchToLinear(L, C, h)) < min) continue
      const d = (L - L0) ** 2 + 4 * (C - C0) ** 2
      if (d < best.d) best = { L, C, d }
    }
  }
  // Hex rounding can land a hair under the line; step darker until the hex itself passes.
  let { L } = best
  const C = best.C
  let hex = oklchToHex(L, C, h)
  for (let i = 0; i < 40 && hexRatio(hex) < min; i++) { L -= 0.001; hex = oklchToHex(L, Math.min(C, maxChroma(L, h)), h) }
  return { L, C: Math.min(C, maxChroma(L, h)), hex }
}

export function hexRatio(hex: string) {
  const lin = [1, 3, 5].map(i => { const c = parseInt(hex.slice(i, i + 2), 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 })
  return (WHITE_Y + 0.05) / (0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2] + 0.05)
}

export type FieldResult = { id: number; w: number; h: number; pixels: Uint8ClampedArray; pass: Float32Array; large: Float32Array }

// Pixel ops (canvas paint, exempt from the CSS token rule). Values match --ixp-paper and --ixp-ink.
const PAPER = [246, 247, 245], INK = [15, 18, 22]
const GRID = 72

/** Paint the L × C plane at one hue and trace the 4.5:1 and 3:1 contours (marching squares). */
export function computeField(id: number, hue: number, w: number, h: number, cMax: number): FieldResult {
  const pixels = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++) {
    const L = 1 - y / (h - 1)
    for (let x = 0; x < w; x++) {
      const C = (x / (w - 1)) * cMax
      const lin = oklchToLinear(L, C, hue)
      const i = (y * w + x) * 4
      if (!inGamut(lin)) {
        // Outside sRGB: bare lightbox, nothing printed.
        pixels[i] = PAPER[0]; pixels[i + 1] = PAPER[1]; pixels[i + 2] = PAPER[2]; pixels[i + 3] = 255
        continue
      }
      const r = ratioOnWhite(lin)
      const [R, G, B] = linearToBytes(lin)
      // Pass prints the true colour. Large-text-only gets a light paper wash; fail a heavier wash
      // under a fine diagonal hatch, like a rejected region on a printed chart.
      const k = r >= 4.5 ? 0 : r >= 3 ? 0.3 : 0.55
      let pr = R + (PAPER[0] - R) * k, pg = G + (PAPER[1] - G) * k, pb = B + (PAPER[2] - B) * k
      if (r < 3 && (x + y) % 7 === 0) { pr = pr + (INK[0] - pr) * 0.35; pg = pg + (INK[1] - pg) * 0.35; pb = pb + (INK[2] - pb) * 0.35 }
      pixels[i] = pr; pixels[i + 1] = pg; pixels[i + 2] = pb; pixels[i + 3] = 255
    }
  }
  // Sample the contrast on a coarse grid; out-of-gamut samples are NaN and break the line.
  const N = GRID, v = new Float32Array((N + 1) * (N + 1))
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
    const lin = oklchToLinear(1 - j / N, (i / N) * cMax, hue)
    v[j * (N + 1) + i] = inGamut(lin) ? ratioOnWhite(lin) : NaN
  }
  return { id, w, h, pixels, pass: contour(v, N, 4.5), large: contour(v, N, 3) }
}

/** Marching squares: line segments (x1,y1,x2,y2 in 0..1) where the field crosses `t`. */
function contour(v: Float32Array, N: number, t: number) {
  const out: number[] = []
  const at = (i: number, j: number) => v[j * (N + 1) + i]
  const lerp = (a: number, b: number) => (t - a) / (b - a)
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1)
    if ([a, b, c, d].some(Number.isNaN)) continue
    const pts: number[] = []
    // Edges: top (a-b), right (b-c), bottom (d-c), left (a-d). Ratio rises as colours darken.
    if ((a >= t) !== (b >= t)) pts.push((i + lerp(a, b)) / N, j / N)
    if ((b >= t) !== (c >= t)) pts.push((i + 1) / N, (j + lerp(b, c)) / N)
    if ((d >= t) !== (c >= t)) pts.push((i + lerp(d, c)) / N, (j + 1) / N)
    if ((a >= t) !== (d >= t)) pts.push(i / N, (j + lerp(a, d)) / N)
    if (pts.length >= 4) out.push(pts[0], pts[1], pts[2], pts[3])
    if (pts.length === 8) out.push(pts[4], pts[5], pts[6], pts[7])
  }
  return new Float32Array(out)
}
