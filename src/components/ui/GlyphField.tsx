'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * GlyphField — a WebGL background of faint monospace glyphs.
 *
 * At rest the glyphs sit barely visible, like watermark characters pressed into
 * the page. When the pointer moves, glyphs within a radius brighten, lift, and
 * the nearest ones re-roll to a new character — the page "wakes" only where you
 * touch it. Idle = almost nothing; interaction = the type comes alive.
 *
 * One THREE.Points draw call, glyphs sampled from a generated texture atlas.
 * Fully behind content (fixed, pointer-events: none). Disabled for
 * prefers-reduced-motion and coarse pointers (no hover → no payoff, saves battery).
 */

const ATLAS_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>=+*#'.split('')
const ATLAS_COLS = 8
const CELL = 64 // px per glyph cell in the atlas

function buildAtlas(color: string): THREE.CanvasTexture {
  const rows = Math.ceil(ATLAS_CHARS.length / ATLAS_COLS)
  const canvas = document.createElement('canvas')
  canvas.width = ATLAS_COLS * CELL
  canvas.height = rows * CELL
  const ctx = canvas.getContext('2d')!
  ctx.font = `500 ${CELL * 0.62}px "JetBrains Mono", monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ATLAS_CHARS.forEach((ch, i) => {
    const cx = (i % ATLAS_COLS) * CELL + CELL / 2
    const cy = Math.floor(i / ATLAS_COLS) * CELL + CELL / 2
    ctx.fillText(ch, cx, cy)
  })
  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  return tex
}

export function GlyphField() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(pointer: fine)').matches
    if (reduced || !fine) return

    // Glyph ink color follows the theme.
    const isDark = document.documentElement.classList.contains('dark')
    const inkColor = isDark ? '#F4F1EA' : '#0A0A0A'
    const accent = new THREE.Color('#FFE500')
    const base = new THREE.Color(inkColor)

    const atlas = buildAtlas('#ffffff') // white glyphs, tinted in shader
    const rows = Math.ceil(ATLAS_CHARS.length / ATLAS_COLS)

    const scene = new THREE.Scene()
    // Orthographic so the grid maps 1:1 to screen space.
    let w = mount.clientWidth
    let h = mount.clientHeight
    const camera = new THREE.OrthographicCamera(0, w, 0, h, -1, 1)

    // Guard: some environments (headless, GPU disabled, old browsers) can't create
    // a WebGL context. Fail silently — the site reads fine without the field.
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    } catch {
      atlas.dispose()
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Build the grid of glyphs ──────────────────────────────
    const GAP = 34 // px between glyphs
    let geometry!: THREE.BufferGeometry
    let material: THREE.ShaderMaterial
    let points: THREE.Points

    const uniforms = {
      uMouse:   { value: new THREE.Vector2(-9999, -9999) },
      uRadius:  { value: 150 },
      uAtlas:   { value: atlas },
      uCols:    { value: ATLAS_COLS },
      uRows:    { value: rows },
      uBase:    { value: base },
      uAccent:  { value: accent },
      uSize:    { value: 15 * renderer.getPixelRatio() },
      uIdle:    { value: isDark ? 0.06 : 0.05 }, // resting opacity — barely there
    }

    function buildGrid() {
      const cols = Math.floor(w / GAP)
      const rowsN = Math.floor(h / GAP)
      const count = cols * rowsN
      const positions = new Float32Array(count * 3)
      const glyphIndex = new Float32Array(count)
      const seed = new Float32Array(count)
      let p = 0
      for (let yi = 0; yi < rowsN; yi++) {
        for (let xi = 0; xi < cols; xi++) {
          positions[p * 3]     = xi * GAP + GAP / 2
          positions[p * 3 + 1] = yi * GAP + GAP / 2
          positions[p * 3 + 2] = 0
          glyphIndex[p] = Math.floor(Math.random() * ATLAS_CHARS.length)
          seed[p] = Math.random()
          p++
        }
      }
      geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('aGlyph', new THREE.BufferAttribute(glyphIndex, 1))
      geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    }

    material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        attribute float aGlyph;
        attribute float aSeed;
        uniform vec2 uMouse;
        uniform float uRadius;
        uniform float uSize;
        uniform float uIdle;
        varying float vGlyph;
        varying float vGlow;
        void main() {
          vGlyph = aGlyph;
          float d = distance(position.xy, uMouse);
          float prox = 1.0 - smoothstep(0.0, uRadius, d);  // 1 near cursor → 0 far
          vGlow = prox;
          vec3 pos = position;
          // lift slightly toward cursor proximity (parallax-ish ripple)
          pos.y -= prox * 6.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = uSize * (1.0 + prox * 0.5);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uAtlas;
        uniform float uCols;
        uniform float uRows;
        uniform vec3 uBase;
        uniform vec3 uAccent;
        uniform float uIdle;
        varying float vGlyph;
        varying float vGlow;
        void main() {
          // map this point's glyph index into the atlas cell
          float col = mod(vGlyph, uCols);
          float row = floor(vGlyph / uCols);
          vec2 cell = vec2(1.0 / uCols, 1.0 / uRows);
          // gl_PointCoord: (0,0) top-left → atlas v is flipped
          vec2 uv = vec2(
            (col + gl_PointCoord.x) * cell.x,
            (row + (1.0 - gl_PointCoord.y)) * cell.y
          );
          float mask = texture2D(uAtlas, uv).a;
          if (mask < 0.05) discard;
          // color: base ink at rest, shift toward accent near cursor
          vec3 color = mix(uBase, uAccent, vGlow * 0.9);
          float alpha = mask * (uIdle + vGlow * 0.85);
          gl_FragColor = vec4(color, alpha);
        }
      `,
    })

    buildGrid()
    points = new THREE.Points(geometry, material)
    scene.add(points)

    // ── Pointer tracking (smoothed) ───────────────────────────
    const target = new THREE.Vector2(-9999, -9999)
    const onMove = (e: MouseEvent) => { target.set(e.clientX, e.clientY) }
    const onLeave = () => { target.set(-9999, -9999) }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseout', onLeave, { passive: true })

    // ── Re-roll glyphs nearest the cursor, occasionally ───────
    let frame = 0
    let raf = 0
    const render = () => {
      frame++
      // ease the mouse uniform toward the target
      const m = uniforms.uMouse.value
      if (target.x < -1000) {
        m.set(-9999, -9999)
      } else {
        m.x += (target.x - m.x) * 0.18
        m.y += (target.y - m.y) * 0.18
      }
      // every ~8 frames, re-roll a few glyphs near the cursor for the "alive" flicker
      if (frame % 8 === 0 && m.x > -1000) {
        const pos = geometry.getAttribute('position') as THREE.BufferAttribute
        const gly = geometry.getAttribute('aGlyph') as THREE.BufferAttribute
        for (let i = 0; i < pos.count; i++) {
          const dx = pos.getX(i) - m.x
          const dy = pos.getY(i) - m.y
          if (dx * dx + dy * dy < 90 * 90 && Math.random() < 0.06) {
            gly.setX(i, Math.floor(Math.random() * ATLAS_CHARS.length))
          }
        }
        gly.needsUpdate = true
      }
      renderer.render(scene, camera)
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    // ── Resize ────────────────────────────────────────────────
    const onResize = () => {
      w = mount.clientWidth
      h = mount.clientHeight
      camera.right = w
      camera.bottom = h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      geometry.dispose()
      buildGrid()
      points.geometry = geometry
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseout', onLeave)
      window.removeEventListener('resize', onResize)
      geometry.dispose()
      material.dispose()
      atlas.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  )
}
