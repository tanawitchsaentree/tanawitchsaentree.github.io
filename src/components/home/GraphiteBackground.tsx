'use client'

import { useEffect, useRef } from 'react'
import styles from './HomeDocument.module.css'

// A fixed embossed surface. Only the grazing light moves; the geometry never swims.
// Raw WebGL: one program, one buffer (a full-screen triangle strip).
const vertexShader = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
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
    let gl: WebGLRenderingContext | null = null
    try {
      gl = canvas.getContext('webgl', {
        antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power',
      })
    } catch { /* fall through */ }
    if (!gl) return // The CSS surface stays visible on devices without WebGL.
    const ctx = gl

    const css = getComputedStyle(canvas)
    const color = (token: string): [number, number, number] => {
      const hex = css.getPropertyValue(token).trim().replace('#', '')
      return [
        parseInt(hex.slice(0, 2), 16) / 255,
        parseInt(hex.slice(2, 4), 16) / 255,
        parseInt(hex.slice(4, 6), 16) / 255,
      ]
    }

    let program: WebGLProgram | null = null
    let buffer: WebGLBuffer | null = null
    let loc: Record<'aspect' | 'time' | 'pointer', WebGLUniformLocation | null> = { aspect: null, time: null, pointer: null }

    function compile(type: number, source: string) {
      const shader = ctx.createShader(type)
      if (!shader) return null
      ctx.shaderSource(shader, source)
      ctx.compileShader(shader)
      if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) { ctx.deleteShader(shader); return null }
      return shader
    }
    function setup() {
      const vs = compile(ctx.VERTEX_SHADER, vertexShader)
      const fs = compile(ctx.FRAGMENT_SHADER, fragmentShader)
      if (!vs || !fs) return false
      const prog = ctx.createProgram()
      if (!prog) return false
      ctx.attachShader(prog, vs)
      ctx.attachShader(prog, fs)
      ctx.linkProgram(prog)
      ctx.deleteShader(vs)
      ctx.deleteShader(fs)
      if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) { ctx.deleteProgram(prog); return false }
      program = prog
      ctx.useProgram(prog)
      buffer = ctx.createBuffer()
      ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer)
      ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), ctx.STATIC_DRAW)
      const position = ctx.getAttribLocation(prog, 'position')
      ctx.enableVertexAttribArray(position)
      ctx.vertexAttribPointer(position, 2, ctx.FLOAT, false, 0, 0)
      loc = {
        aspect: ctx.getUniformLocation(prog, 'uAspect'),
        time: ctx.getUniformLocation(prog, 'uTime'),
        pointer: ctx.getUniformLocation(prog, 'uPointer'),
      }
      ctx.uniform3fv(ctx.getUniformLocation(prog, 'uInk'), color('--bg'))
      ctx.uniform3fv(ctx.getUniformLocation(prog, 'uSurface'), color('--bg-muted'))
      ctx.uniform3fv(ctx.getUniformLocation(prog, 'uHighlight'), color('--fg-muted'))
      return true
    }
    if (!setup()) return

    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const fine = matchMedia('(pointer: fine)')
    const pointerNow = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    let time = 0
    let aspect = 1
    let raf = 0
    let previous = 0
    let lost = false
    // Light only travels while the pointer moves, then eases to rest and the
    // loop stops entirely. No idle 60 Hz loop.
    const SETTLE_EPS = 0.0015
    const moving = () => !reduced.matches && fine.matches && !pausedRef.current && !document.hidden && !lost

    const render = () => {
      if (lost || !program) return
      ctx.uniform1f(loc.aspect, aspect)
      ctx.uniform1f(loc.time, time)
      ctx.uniform2f(loc.pointer, pointerNow.x, pointerNow.y)
      ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, 4)
      canvas.dataset.ready = 'true'
    }
    const settled = () => Math.abs(target.x - pointerNow.x) < SETTLE_EPS && Math.abs(target.y - pointerNow.y) < SETTLE_EPS
    function tick(now: number) {
      if (!moving()) { raf = 0; return }
      raf = requestAnimationFrame(tick)
      if (now - previous < 1000 / 30) return
      const delta = previous ? Math.min((now - previous) / 1000, 0.1) : 0
      previous = now
      time += delta
      const k = 1 - Math.exp(-delta * 2)
      pointerNow.x += (target.x - pointerNow.x) * k
      pointerNow.y += (target.y - pointerNow.y) * k
      render()
      if (settled()) { cancelAnimationFrame(raf); raf = 0; previous = 0 }
    }
    function start() {
      if (!raf && moving() && !settled()) raf = requestAnimationFrame(tick)
    }
    function update() {
      cancelAnimationFrame(raf)
      raf = 0
      previous = 0
      if (reduced.matches || !fine.matches) {
        pointerNow.x = pointerNow.y = target.x = target.y = 0
        time = 0
      }
      if (!document.hidden) render()
      start()
    }
    function resize() {
      const { width, height } = canvas!.getBoundingClientRect()
      if (!width || !height) return
      const ratio = Math.min(devicePixelRatio, 1.5)
      canvas!.width = Math.floor(width * ratio)
      canvas!.height = Math.floor(height * ratio)
      ctx.viewport(0, 0, canvas!.width, canvas!.height)
      aspect = width / height
      update()
    }
    function pointer(event: PointerEvent) {
      if (!moving()) return
      target.x = event.clientX / innerWidth * 2 - 1
      target.y = 1 - event.clientY / innerHeight * 2
      start()
    }
    function leave() { target.x = 0; target.y = 0; start() }
    function contextLost(event: Event) {
      event.preventDefault()
      lost = true
      program = null
      buffer = null
      delete canvas!.dataset.ready
      cancelAnimationFrame(raf)
      raf = 0
    }
    function contextRestored() { lost = false; if (setup()) resize() }
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
    return () => {
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
      if (!lost) {
        if (buffer) ctx.deleteBuffer(buffer)
        if (program) ctx.deleteProgram(program)
      }
    }
  }, [])

  return <div className={styles.background} aria-hidden="true"><canvas ref={canvasRef} className={styles.graphite} /></div>
}
