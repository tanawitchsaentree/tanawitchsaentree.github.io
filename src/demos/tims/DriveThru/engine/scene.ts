import { CFG } from './config'
import type { LoadedAssets } from './loader'
import { createVehicle, stepVehicle, type Vehicle } from './vehicle'

export interface SceneHandle {
  stop: () => void
  setPaused: (p: boolean) => void
}

interface SceneState {
  vehicles: Vehicle[]
  timeSinceLastSpawn: number
  nextVehicleIdx: number
  rafId: number
  lastT: number
  assets: LoadedAssets
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  paused: boolean
  stopped: boolean
  bgColor: string
}

/** Draw a sprite at logical coordinates, scaled up by CFG.scale for crispness */
function drawSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  lx: number, ly: number,
  lw: number, lh: number,
) {
  const s = CFG.scale
  ctx.drawImage(img, lx * s, ly * s, lw * s, lh * s)
}

function renderScene(s: SceneState): void {
  const { ctx, canvas, assets } = s
  const ps = CFG.scale        // physical scale (canvas pixels per logical px)
  const ss = CFG.spriteScale  // sprite source pixels per logical px

  ctx.fillStyle = s.bgColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Hairline ground
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.fillRect(0, CFG.groundY * ps, canvas.width, ps)

  // Store — right-anchored
  const sLogW = assets.store.width / ss
  const sLogH = assets.store.height / ss
  const sLogX = canvas.width / ps - sLogW - 4
  const sLogY = CFG.groundY - sLogH
  drawSprite(ctx, assets.store, sLogX, sLogY, sLogW, sLogH)

  // Vehicles — paint back-to-front (rightmost = nearest store = behind)
  const sorted = [...s.vehicles].sort((a, b) => b.x - a.x)
  const wLogW = assets.wheel.width / ss
  const wLogH = assets.wheel.height / ss

  for (const v of sorted) {
    const bLogW = v.def.w / ss
    const bLogH = v.def.h / ss

    drawSprite(ctx, v.def.img, v.x, v.y, bLogW, bLogH)

    for (const anchor of v.def.wheels) {
      const wLx = v.x + anchor.x / ss - wLogW / 2
      const wLy = v.y + anchor.y / ss - wLogH / 2

      ctx.save()
      ctx.translate((wLx + wLogW / 2) * ps, (wLy + wLogH / 2) * ps)
      ctx.rotate(v.wheelAngle)
      ctx.drawImage(assets.wheel, (-wLogW / 2) * ps, (-wLogH / 2) * ps, wLogW * ps, wLogH * ps)
      ctx.restore()
    }
  }
}

function tick(s: SceneState, now: number): void {
  if (s.stopped) return

  const dt = Math.min((now - s.lastT) / 1000, 0.05)
  s.lastT = now

  if (!s.paused) {
    for (const v of s.vehicles) stepVehicle(v, dt)
    s.vehicles = s.vehicles.filter(v => v.state !== 'OFFSCREEN')

    const canvasW = s.canvas.width / CFG.scale
    s.timeSinceLastSpawn += dt * 1000
    const noVehicleAtRight = !s.vehicles.some(v => v.x > canvasW * 0.6)

    if (s.timeSinceLastSpawn >= CFG.spawnGapMs && noVehicleAtRight) {
      const def = s.assets.vehicles[s.nextVehicleIdx % s.assets.vehicles.length]
      s.nextVehicleIdx++
      s.vehicles.push(createVehicle(def, canvasW))
      s.timeSinceLastSpawn = 0
    }

    renderScene(s)
  }

  s.rafId = requestAnimationFrame(t => tick(s, t))
}

export function startScene(
  canvas: HTMLCanvasElement,
  assets: LoadedAssets,
  bgColor = '#1c1410',
): SceneHandle | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.imageSmoothingEnabled = false

  const canvasW = canvas.width / CFG.scale

  const s: SceneState = {
    vehicles: [createVehicle(assets.vehicles[0], canvasW)],
    timeSinceLastSpawn: 0,
    nextVehicleIdx: 1,
    rafId: 0,
    lastT: performance.now(),
    assets,
    canvas,
    ctx,
    paused: false,
    stopped: false,
    bgColor,
  }

  s.rafId = requestAnimationFrame(t => tick(s, t))

  return {
    stop: () => { s.stopped = true; cancelAnimationFrame(s.rafId) },
    setPaused: (p: boolean) => { s.paused = p; if (!p) s.lastT = performance.now() },
  }
}
