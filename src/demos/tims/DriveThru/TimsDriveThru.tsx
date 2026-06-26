'use client'

import React, { useEffect, useRef, useState } from 'react'
import styles from './TimsDriveThru.module.css'
import { loadAssets } from './engine/loader'
import { startScene } from './engine/scene'
import { CFG } from './engine/config'
import manifest from './manifest.json'

const LOGICAL_W = 800
const LOGICAL_H = CFG.canvasH

interface Props {
  className?: string
  style?: React.CSSProperties
  bgColor?: string
}

export function TimsDriveThru({ className, style, bgColor = '#1c1410' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width  = LOGICAL_W * CFG.scale
    canvas.height = LOGICAL_H * CFG.scale

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced) {
      loadAssets(manifest).then(assets => {
        if (!canvasRef.current) return
        setReady(true)
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.imageSmoothingEnabled = false
        const ps = CFG.scale
        const ss = CFG.spriteScale
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        const sLogW = assets.store.width / ss
        const sLogH = assets.store.height / ss
        const sLogX = canvas.width / ps - sLogW - 4
        const sLogY = CFG.groundY - sLogH
        ctx.drawImage(assets.store, sLogX * ps, sLogY * ps, sLogW * ps, sLogH * ps)
        ctx.fillStyle = 'rgba(255,255,255,0.08)'
        ctx.fillRect(0, CFG.groundY * ps, canvas.width, ps)
      })
      return
    }

    let handle: ReturnType<typeof startScene> | null = null

    loadAssets(manifest).then(assets => {
      if (!canvasRef.current) return
      setReady(true)
      handle = startScene(canvas, assets, bgColor) ?? null
    })

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => handle?.setPaused(!e.isIntersecting))
    }, { threshold: 0.1 })
    io.observe(canvas)

    return () => {
      io.disconnect()
      handle?.stop()
    }
  }, [])

  return (
    <div
      className={`${styles.wrap}${className ? ` ${className}` : ''}`}
      data-demo="tims-drivethru"
      style={style}
    >
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-label="Pixel-art drive-thru animation"
        role="img"
        style={{ opacity: ready ? 1 : 0, transition: `opacity 0.3s cubic-bezier(0.65, 0, 0.35, 1)` }}
      />
    </div>
  )
}
