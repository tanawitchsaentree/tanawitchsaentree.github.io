'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { buildShape, type ShapeName } from '@/lib/shapes'

/**
 * MorphParticles — a cloud of small 3D particles that morphs between
 * mathematical forms (Fibonacci sphere → torus knot → 3D supershape → …).
 *
 * Each particle interpolates from its position in shape A to shape B with an
 * eased, per-particle-delayed transition, and is pushed along a divergence-free
 * **curl-noise** field during the morph so the swarm flows like fluid rather
 * than sliding in straight lines. The active shape is driven by `shapeIndex`
 * (wired to the horizontal frame the user is on).
 *
 * One THREE.Points draw call. Curl noise + easing live in the vertex shader, so
 * the CPU only swaps a target buffer on shape change. Reduced-motion holds a
 * still sphere; WebGL-unavailable environments render nothing.
 */

const SHAPES: ShapeName[] = ['sphere', 'knot', 'supershape', 'helix', 'galaxy']
const COUNT = 4200

interface MorphParticlesProps {
  /** Which shape to display (index into SHAPES). Morphs when it changes. */
  shapeIndex: number
  className?: string
}

export function MorphParticles({ shapeIndex, className }: MorphParticlesProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const morphToRef = useRef<((i: number) => void) | null>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isDark = document.documentElement.classList.contains('dark')
    const ink = new THREE.Color(isDark ? '#F4F1EA' : '#1A1714')
    const accent = new THREE.Color('#FFE500')

    let w = mount.clientWidth
    let h = mount.clientHeight
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
    camera.position.set(0, 0, 4.2)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Buffers: from-shape, to-shape, seed ───────────────────
    const fromArr = new Float32Array(COUNT * 3)
    const toArr = new Float32Array(COUNT * 3)
    const seedArr = new Float32Array(COUNT)
    buildShape(SHAPES[0], fromArr, COUNT)
    buildShape(SHAPES[Math.min(shapeIndex, SHAPES.length - 1)], toArr, COUNT)
    fromArr.set(toArr) // start settled on the initial shape
    for (let i = 0; i < COUNT; i++) seedArr[i] = Math.random()

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(toArr, 3)) // required
    geometry.setAttribute('aFrom', new THREE.BufferAttribute(fromArr, 3))
    geometry.setAttribute('aTo', new THREE.BufferAttribute(toArr, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seedArr, 1))

    const uniforms = {
      uMorph:  { value: 1 },          // 0→1 over a transition
      uTime:   { value: 0 },
      uMouse:  { value: new THREE.Vector2(0, 0) },
      uInk:    { value: ink },
      uAccent: { value: accent },
      uSize:   { value: 2.3 * renderer.getPixelRatio() },
    }

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      vertexShader: /* glsl */ `
        attribute vec3 aFrom;
        attribute vec3 aTo;
        attribute float aSeed;
        uniform float uMorph;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uSize;
        varying float vMix;

        // ── simplex-ish curl noise (Ashima 3D simplex) ──────────
        vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
        vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
        float snoise(vec3 v){
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod(i, 289.0);
          vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
            i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
            i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 1.0/7.0;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m*m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        vec3 curl(vec3 p){
          float e = 0.18;
          vec3 dx = vec3(e,0.0,0.0), dy = vec3(0.0,e,0.0), dz = vec3(0.0,0.0,e);
          float x = snoise(p+dy).z - snoise(p-dy).z - snoise(p+dz).y + snoise(p-dz).y;
          float y = snoise(p+dz).x - snoise(p-dz).x - snoise(p+dx).z + snoise(p-dx).z;
          float z = snoise(p+dx).y - snoise(p-dx).y - snoise(p+dy).x + snoise(p-dy).x;
          return normalize(vec3(x,y,z) + 1e-5);
        }
        float easeInOut(float t){
          return t < 0.5 ? 4.0*t*t*t : 1.0 - pow(-2.0*t+2.0, 3.0)/2.0;
        }
        void main(){
          // per-particle staggered progress
          float delay = aSeed * 0.4;
          float t = clamp((uMorph - delay) / (1.0 - delay), 0.0, 1.0);
          float e = easeInOut(t);
          vec3 pos = mix(aFrom, aTo, e);
          // curl flow peaks mid-morph, vanishes at the ends → fluid swirl
          float swirl = sin(e * 3.14159);
          pos += curl(pos * 1.4 + uTime * 0.05) * swirl * 0.5;
          // gentle idle breathing
          pos *= 1.0 + 0.015 * sin(uTime * 0.6 + aSeed * 6.28);

          vMix = swirl;  // tint accent while flowing
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * (300.0 / -mv.z);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk;
        uniform vec3 uAccent;
        varying float vMix;
        void main(){
          vec2 c = gl_PointCoord - 0.5;
          if (dot(c,c) > 0.25) discard;       // round
          float edge = smoothstep(0.25, 0.02, dot(c,c));
          vec3 col = mix(uInk, uAccent, vMix * 0.85);
          gl_FragColor = vec4(col, edge * 0.9);
        }
      `,
    })

    const points = new THREE.Points(geometry, material)
    points.frustumCulled = false // morph moves verts beyond the static bounds
    scene.add(points)

    // ── morphTo: swap target, restart uMorph ──────────────────
    let morphStart = -1
    const MORPH_MS = 1400
    let currentShape = Math.min(shapeIndex, SHAPES.length - 1)
    const aFromAttr = geometry.getAttribute('aFrom') as THREE.BufferAttribute
    const aToAttr = geometry.getAttribute('aTo') as THREE.BufferAttribute

    morphToRef.current = (idx: number) => {
      const next = ((idx % SHAPES.length) + SHAPES.length) % SHAPES.length
      if (next === currentShape) return
      // freeze current visual position into aFrom (use current target as base)
      aFromAttr.array.set(aToAttr.array as Float32Array)
      aFromAttr.needsUpdate = true
      buildShape(SHAPES[next], aToAttr.array as Float32Array, COUNT)
      aToAttr.needsUpdate = true
      currentShape = next
      morphStart = -1 // reset on next frame
      uniforms.uMorph.value = 0
      restartMorph = true
    }
    let restartMorph = false

    // ── Pointer parallax ──────────────────────────────────────
    const target = new THREE.Vector2(0, 0)
    const onMove = (e: MouseEvent) => {
      target.set((e.clientX / window.innerWidth - 0.5) * 2, (e.clientY / window.innerHeight - 0.5) * 2)
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    // ── Animate ───────────────────────────────────────────────
    let raf = 0
    let t0 = 0
    let mStart = 0
    const render = (ts: number) => {
      if (!t0) t0 = ts
      uniforms.uTime.value = reduced ? 0 : (ts - t0) / 1000

      if (restartMorph) { mStart = ts; restartMorph = false }
      const mp = Math.min((ts - mStart) / MORPH_MS, 1)
      uniforms.uMorph.value = reduced ? 1 : mp

      // eased pointer parallax → subtle rotation
      const m = uniforms.uMouse.value
      m.x += (target.x - m.x) * 0.05
      m.y += (target.y - m.y) * 0.05
      points.rotation.y = (reduced ? 0 : uniforms.uTime.value * 0.12) + m.x * 0.5
      points.rotation.x = m.y * 0.35

      renderer.render(scene, camera)
      if (reduced) return
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    const onResize = () => {
      w = mount.clientWidth; h = mount.clientHeight
      camera.aspect = w / h; camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      morphToRef.current = null
      geometry.dispose(); material.dispose(); renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, []) // build once

  // Drive morph from prop changes
  useEffect(() => {
    morphToRef.current?.(shapeIndex)
  }, [shapeIndex])

  return <div ref={mountRef} aria-hidden="true" className={className} />
}

export const SHAPE_COUNT = SHAPES.length
