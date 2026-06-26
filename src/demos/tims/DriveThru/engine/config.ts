/** Canvas and physics constants */
export const CFG = {
  /** Canvas physical pixels per logical pixel (retina crispness) */
  scale: 2,

  /** Sprite render scale — native sprite px per logical px. 4 = quarter native area */
  spriteScale: 4,

  /** Canvas logical height */
  canvasH: 100,

  /** Ground y in logical pixels — wheel bases sit here */
  groundY: 52,

  /** Drive-thru stop x offset from canvas right edge (logical px) */
  stopFromRight: 100,

  /** Vehicle cruise speed (logical px/s) */
  cruiseSpeed: 70,

  /** Acceleration rate */
  accel: 110,

  /** Decel rate */
  decel: 160,

  /** Idle bounce amplitude (logical px) */
  bounceAmp: 1.2,

  /** Idle bounce frequency (rad/s) */
  bounceFreq: 4.2,

  /** Idle bounce decay */
  bounceDecay: 1.8,

  /** How long vehicle idles at the stop (ms) */
  idleMs: 2800,

  /** Gap between vehicle spawns (ms) */
  spawnGapMs: 2200,

  /** Wheel logical radius — used for rotation speed */
  wheelRadius: 7,
} as const
