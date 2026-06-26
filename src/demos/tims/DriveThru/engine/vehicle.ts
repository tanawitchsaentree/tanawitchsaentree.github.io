import { CFG } from './config'
import type { LoadedAssets } from './loader'

export type VehicleState = 'ENTERING' | 'BRAKING' | 'IDLE' | 'LEAVING' | 'OFFSCREEN'

export interface Vehicle {
  x: number
  y: number
  speed: number
  wheelAngle: number
  state: VehicleState
  idleElapsed: number
  bounceT: number
  def: LoadedAssets['vehicles'][number]
  stopX: number
  canvasW: number
}

/** Logical width of a sprite at current spriteScale */
function logW(def: LoadedAssets['vehicles'][number]) { return def.w / CFG.spriteScale }
function logH(def: LoadedAssets['vehicles'][number]) { return def.h / CFG.spriteScale }

export function createVehicle(
  def: LoadedAssets['vehicles'][number],
  canvasW: number,
): Vehicle {
  const bodyW = logW(def)
  const stopX = canvasW - CFG.stopFromRight - bodyW / 2

  return {
    x: canvasW + 20,
    y: CFG.groundY - logH(def),
    speed: 0,
    wheelAngle: 0,
    state: 'ENTERING',
    idleElapsed: 0,
    bounceT: 0,
    def,
    stopX,
    canvasW,
  }
}

export function stepVehicle(v: Vehicle, dt: number): void {
  const bodyW = logW(v.def)

  switch (v.state) {
    case 'ENTERING': {
      v.speed += CFG.accel * (1 - v.speed / CFG.cruiseSpeed) * dt
      v.x -= v.speed * dt
      v.wheelAngle += (v.speed / CFG.wheelRadius) * dt

      const brakeDist = (v.speed * v.speed) / (2 * CFG.decel) + 4
      if (v.x <= v.stopX + brakeDist) v.state = 'BRAKING'
      break
    }

    case 'BRAKING': {
      const decelRate = CFG.decel * (v.speed / CFG.cruiseSpeed + 0.15)
      v.speed = Math.max(0, v.speed - decelRate * dt)
      v.x -= v.speed * dt
      v.wheelAngle += (v.speed / CFG.wheelRadius) * dt

      if (v.speed === 0) {
        v.x = v.stopX
        v.state = 'IDLE'
        v.idleElapsed = 0
        v.bounceT = 0
      }
      break
    }

    case 'IDLE': {
      v.idleElapsed += dt * 1000
      v.bounceT += dt

      const amp = CFG.bounceAmp * Math.exp(-CFG.bounceDecay * v.bounceT)
      v.y = CFG.groundY - logH(v.def) - amp * Math.sin(v.bounceT * CFG.bounceFreq)

      if (v.idleElapsed >= CFG.idleMs) v.state = 'LEAVING'
      break
    }

    case 'LEAVING': {
      v.speed += CFG.accel * (1 - v.speed / CFG.cruiseSpeed) * dt
      v.x -= v.speed * dt
      v.wheelAngle += (v.speed / CFG.wheelRadius) * dt

      if (v.x + bodyW < -20) v.state = 'OFFSCREEN'
      break
    }

    case 'OFFSCREEN': break
  }
}
