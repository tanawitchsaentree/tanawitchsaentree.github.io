'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

function useThemeObserver(): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  )
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    obs.observe(document.documentElement, { attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return [isDark, setIsDark]
}

/**
 * ParticleName — the name rendered as thousands of ink particles.
 *
 * The text is rasterized to an offscreen canvas; every inked pixel becomes a
 * particle whose "home" is that location. On load the particles fly in from a
 * scatter and settle into the word (per-particle delay → it assembles like ink
 * being pressed into paper). On pointer proximity a radial ripple pushes the
 * particles outward and tints them accent; releasing lets them spring home —
 * the offset is a pure function of cursor distance, so no physics state to keep.
 *
 * This is the page's single deliberate "look closer" moment. One THREE.Points
 * draw call. Disabled for reduced-motion (renders the plain text instead) and
 * guarded against WebGL-unavailable environments.
 */

interface ParticleNameProps {
  text: string
  className?: string
  /** Rendered pixel height of the name block (the canvas height). */
  height?: number
}

export function ParticleName({ text, className, height = 120 }: ParticleNameProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const fallbackRef = useRef<HTMLSpanElement>(null)
  const [isDark, setIsDark] = useThemeObserver()

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      if (fallbackRef.current) fallbackRef.current.style.opacity = '1'
      return
    }

    const ink = new THREE.Color(isDark ? '#F4F1EA' : '#0A0A0A')
    const accent = new THREE.Color('#FFE500')

    // ── 1. Rasterize the text to sample inked pixels ──────────
    const DPR = Math.min(window.devicePixelRatio || 1, 2)
    const fontPx = Math.round(height * 0.5)
    const measureCanvas = document.createElement('canvas')
    const mctx = measureCanvas.getContext('2d')!
    mctx.font = `500 ${fontPx}px 'Inter Variable', 'Inter', sans-serif`
    const textW = Math.ceil(mctx.measureText(text).width)

    const cw = textW + fontPx          // padding
    const ch = height
    const sample = document.createElement('canvas')
    sample.width = Math.ceil(cw * DPR)
    sample.height = Math.ceil(ch * DPR)
    const sctx = sample.getContext('2d')!
    sctx.scale(DPR, DPR)
    sctx.font = `500 ${fontPx}px 'Inter Variable', 'Inter', sans-serif`
    sctx.textAlign = 'center'
    sctx.textBaseline = 'middle'
    sctx.fillStyle = '#fff'
    sctx.fillText(text, cw / 2, ch / 2)

    const img = sctx.getImageData(0, 0, sample.width, sample.height).data

    // Sample step: density vs perf. Smaller = more particles.
    const STEP = Math.max(2, Math.round(2.5 * DPR))
    const homes: number[] = []
    const seeds: number[] = []
    for (let y = 0; y < sample.height; y += STEP) {
      for (let x = 0; x < sample.width; x += STEP) {
        const alpha = img[(y * sample.width + x) * 4 + 3]
        if (alpha > 90) {
          // center the cloud around (0,0); flip Y for GL
          homes.push((x / DPR - cw / 2), -(y / DPR - ch / 2), 0)
          seeds.push(Math.random())
        }
      }
    }
    const count = seeds.length
    if (count === 0) return

    // ── 2. Scene / ortho camera in CSS-pixel space ────────────
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-cw / 2, cw / 2, ch / 2, -ch / 2, -100, 100)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    } catch {
      if (fallbackRef.current) fallbackRef.current.style.opacity = '1'
      return
    }
    renderer.setPixelRatio(DPR)
    renderer.setSize(cw, ch)
    renderer.setClearColor(0x000000, 0)
    mount.style.width = `${cw}px`
    mount.style.height = `${ch}px`
    mount.appendChild(renderer.domElement)

    // ── 3. Geometry: home, scattered start, seed ──────────────
    const homeArr = new Float32Array(homes)
    const startArr = new Float32Array(count * 3)
    const seedArr = new Float32Array(seeds)
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2
      const rad = 80 + Math.random() * 260
      startArr[i * 3]     = Math.cos(ang) * rad
      startArr[i * 3 + 1] = Math.sin(ang) * rad
      startArr[i * 3 + 2] = 0
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(homeArr, 3)) // unused but required
    geometry.setAttribute('aHome', new THREE.BufferAttribute(homeArr, 3))
    geometry.setAttribute('aStart', new THREE.BufferAttribute(startArr, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seedArr, 1))

    const uniforms = {
      uProgress: { value: 0 },                       // 0→1 entrance
      uMouse:    { value: new THREE.Vector2(-9999, -9999) },
      uRadius:   { value: 64 },
      uInk:      { value: ink },
      uAccent:   { value: accent },
      uSize:     { value: 2.4 * DPR },
    }

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        attribute vec3 aHome;
        attribute vec3 aStart;
        attribute float aSeed;
        uniform float uProgress;
        uniform vec2 uMouse;
        uniform float uRadius;
        uniform float uSize;
        varying float vGlow;
        // per-particle eased entrance with staggered delay
        float easeOut(float t){ return 1.0 - pow(1.0 - t, 3.0); }
        void main() {
          float delay = aSeed * 0.45;
          float t = clamp((uProgress - delay) / (1.0 - delay), 0.0, 1.0);
          vec3 pos = mix(aStart, aHome, easeOut(t));

          // ripple repel from cursor (in the same centered pixel space)
          float d = distance(pos.xy, uMouse);
          float prox = 1.0 - smoothstep(0.0, uRadius, d);
          vGlow = prox;
          vec2 dir = normalize(pos.xy - uMouse + vec2(0.0001));
          pos.xy += dir * prox * 18.0;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = uSize * (1.0 + prox * 1.4);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk;
        uniform vec3 uAccent;
        varying float vGlow;
        void main() {
          // round soft point
          vec2 c = gl_PointCoord - 0.5;
          float r = dot(c, c);
          if (r > 0.25) discard;
          float edge = smoothstep(0.25, 0.05, r);
          vec3 color = mix(uInk, uAccent, vGlow);
          gl_FragColor = vec4(color, edge);
        }
      `,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    // ── 4. Pointer (mapped into the centered pixel space) ─────
    const target = new THREE.Vector2(-9999, -9999)
    const onMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      if (
        e.clientX < rect.left - 60 || e.clientX > rect.right + 60 ||
        e.clientY < rect.top - 60  || e.clientY > rect.bottom + 60
      ) { target.set(-9999, -9999); return }
      target.set(
        e.clientX - rect.left - rect.width / 2,
        -(e.clientY - rect.top - rect.height / 2)
      )
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    // ── 5. Animate ────────────────────────────────────────────
    let raf = 0
    let start = 0
    const DURATION = 1500 // entrance ms
    const render = (ts: number) => {
      if (!start) start = ts
      uniforms.uProgress.value = Math.min((ts - start) / DURATION, 1)
      const m = uniforms.uMouse.value
      if (target.x < -1000) m.set(-9999, -9999)
      else { m.x += (target.x - m.x) * 0.2; m.y += (target.y - m.y) * 0.2 }
      renderer.render(scene, camera)
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [text, height, isDark])

  return (
    <span className={className} aria-label={text}>
      {/* WebGL mount */}
      <span ref={mountRef} aria-hidden="true" className="inline-block align-middle" />
      {/* Reduced-motion / no-WebGL fallback — plain text */}
      <span
        ref={fallbackRef}
        className="opacity-0"
        style={{ transition: 'opacity 200ms' }}
      >
        {text}
      </span>
    </span>
  )
}
