'use client'

import { useEffect, useRef } from 'react'
import styles from './HomeDocument.module.css'

// A fixed embossed surface. Only the grazing light moves; the geometry never swims.
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`
const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float uAspect;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec3 uInk;
  uniform vec3 uSurface;
  uniform vec3 uHighlight;

  float relief(vec2 p) {
    float right = p.x - (0.96 - 0.34 * p.y + 0.16 * sin(p.y * 1.7));
    float left = p.x - (-1.30 - 0.40 * p.y + 0.10 * cos(p.y * 2.0));
    return 0.15 * exp(-pow(right / 0.22, 2.0))
         + 0.10 * exp(-pow(left / 0.32, 2.0));
  }
  void main() {
    vec2 p = (vUv - 0.5) * vec2(2.0 * max(uAspect, 1.0), 2.0);
    float stepSize = 0.003;
    float dx = (relief(p + vec2(stepSize, 0.0)) - relief(p - vec2(stepSize, 0.0))) / (2.0 * stepSize);
    float dy = (relief(p + vec2(0.0, stepSize)) - relief(p - vec2(0.0, stepSize))) / (2.0 * stepSize);
    vec3 normal = normalize(vec3(-dx, -dy, 1.0));
    vec3 light = normalize(vec3(-0.8 + uPointer.x * 0.12 + sin(uTime * 0.07) * 0.07,
                               0.6 + uPointer.y * 0.09, 0.48));
    float grazing = dot(normal, light) - light.z;
    float quiet = smoothstep(0.28, 1.0, abs(p.x));
    float lit = max(grazing, 0.0) * quiet;
    float shade = max(-grazing, 0.0) * quiet;
    vec3 color = mix(uInk, uSurface, lit * 1.7);
    color = mix(color, uHighlight, pow(lit, 3.0) * 0.13);
    color *= 1.0 - shade * 0.28;
    // Static, sub-pixel grain: no temporal noise, stars, or particle simulation.
    float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    color += (grain - 0.5) * (0.65 / 255.0);
    gl_FragColor = vec4(color, 1.0);
  }
`

export function GraphiteBackground({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pausedRef = useRef(paused)
  const updateRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    pausedRef.current = paused
    updateRef.current?.()
  }, [paused])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    let cleanup: (() => void) | undefined

    async function initialize() {
      const THREE = await import('three')
      if (cancelled || !canvas) return
      let renderer: InstanceType<typeof THREE.WebGLRenderer>
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' })
      } catch {
        return // The CSS surface stays visible on devices without WebGL.
      }
      const css = getComputedStyle(canvas)
      const color = (token: string) => {
        const hex = css.getPropertyValue(token).trim().replace('#', '')
        return new THREE.Vector3(
          parseInt(hex.slice(0, 2), 16) / 255,
          parseInt(hex.slice(2, 4), 16) / 255,
          parseInt(hex.slice(4, 6), 16) / 255,
        )
      }
      const uniforms = {
        uAspect: { value: 1 }, uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2() },
        uInk: { value: color('--bg') },
        uSurface: { value: color('--bg-muted') },
        uHighlight: { value: color('--fg-muted') },
      }
      const scene = new THREE.Scene()
      const camera = new THREE.Camera()
      const geometry = new THREE.PlaneGeometry(2, 2)
      const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, depthTest: false, depthWrite: false })
      scene.add(new THREE.Mesh(geometry, material))
      const reduced = matchMedia('(prefers-reduced-motion: reduce)')
      const fine = matchMedia('(pointer: fine)')
      const target = new THREE.Vector2()
      let raf = 0
      let previous = 0
      let lost = false
      const moving = () => !reduced.matches && fine.matches && !pausedRef.current && !document.hidden && !lost
      const render = () => {
        if (lost) return
        renderer.render(scene, camera)
        canvas.dataset.ready = 'true'
      }
      function tick(now: number) {
        if (!moving()) { raf = 0; return }
        raf = requestAnimationFrame(tick)
        if (now - previous < 1000 / 30) return
        const delta = previous ? Math.min((now - previous) / 1000, 0.1) : 0
        previous = now
        uniforms.uTime.value += delta
        uniforms.uPointer.value.lerp(target, 1 - Math.exp(-delta * 2))
        render()
      }
      function update() {
        cancelAnimationFrame(raf)
        raf = 0
        previous = 0
        if (reduced.matches || !fine.matches) {
          uniforms.uPointer.value.set(0, 0)
          uniforms.uTime.value = 0
        }
        if (!document.hidden) render()
        if (moving()) raf = requestAnimationFrame(tick)
      }
      function resize() {
        const { width, height } = canvas!.getBoundingClientRect()
        if (!width || !height) return
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
        renderer.setSize(width, height, false)
        uniforms.uAspect.value = width / height
        update()
      }
      function pointer(event: PointerEvent) {
        if (moving()) target.set(event.clientX / innerWidth * 2 - 1, 1 - event.clientY / innerHeight * 2)
      }
      function leave() { target.set(0, 0) }
      function contextLost(event: Event) {
        event.preventDefault()
        lost = true
        delete canvas!.dataset.ready
        cancelAnimationFrame(raf)
      }
      function contextRestored() { lost = false; resize() }
      const observer = new ResizeObserver(resize)
      observer.observe(canvas)
      window.addEventListener('pointermove', pointer, { passive: true })
      document.documentElement.addEventListener('pointerleave', leave)
      document.addEventListener('visibilitychange', update)
      reduced.addEventListener('change', update)
      fine.addEventListener('change', update)
      canvas.addEventListener('webglcontextlost', contextLost)
      canvas.addEventListener('webglcontextrestored', contextRestored)
      updateRef.current = update
      resize()
      cleanup = () => {
        updateRef.current = null
        cancelAnimationFrame(raf)
        observer.disconnect()
        window.removeEventListener('pointermove', pointer)
        document.documentElement.removeEventListener('pointerleave', leave)
        document.removeEventListener('visibilitychange', update)
        reduced.removeEventListener('change', update)
        fine.removeEventListener('change', update)
        canvas.removeEventListener('webglcontextlost', contextLost)
        canvas.removeEventListener('webglcontextrestored', contextRestored)
        geometry.dispose()
        material.dispose()
        renderer.dispose()
      }
    }
    void initialize().catch(() => { /* Preserve the CSS fallback if the chunk cannot load. */ })
    return () => { cancelled = true; cleanup?.() }
  }, [])

  return <div className={styles.background} aria-hidden="true"><canvas ref={canvasRef} className={styles.graphite} /></div>
}
