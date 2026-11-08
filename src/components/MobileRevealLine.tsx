'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

// Simplified mobile string — narrower, centered behind content
const SVG_W = 180
const SVG_H = Math.round(SVG_W * 2623.72 / 229.12) // ≈ 2063px
const BRAIN_PCT = 0.10
const CLIP_END_PCT = 0.859
const MAN_W = 120
const MAN_H = Math.round(MAN_W * 266.15 / 149.16)

export default function MobileRevealLine() {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    let rafId: number

    function update() {
      const container = containerRef.current
      const img = imgRef.current
      if (!container || !img) return

      const scrollY = window.scrollY
      const maxReveal = SVG_H * (CLIP_END_PCT - BRAIN_PCT)
      const revealedPx = Math.min(maxReveal, Math.max(0, scrollY) * 1.0)
      const revealedEndY = BRAIN_PCT + revealedPx / SVG_H
      const clipBottom = (1 - Math.min(CLIP_END_PCT, revealedEndY)) * 100
      img.style.clipPath = `inset(0 0 ${clipBottom}% 0)`
    }

    function onScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(rafId) }
  }, [])

  const manTop = Math.round(SVG_H * CLIP_END_PCT) - 8

  return (
    <div
      ref={containerRef}
      className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none"
      style={{ width: SVG_W, zIndex: 0 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src="/hero.svg"
        alt=""
        aria-hidden="true"
        style={{
          width: SVG_W,
          height: SVG_H,
          display: 'block',
          clipPath: `inset(0 0 ${(1 - BRAIN_PCT) * 100}% 0)`,
          willChange: 'clip-path',
        }}
        draggable={false}
      />
      {/* Man fades in at the bottom */}
      <motion.img
        src="/man.svg"
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: manTop,
          left: (SVG_W - MAN_W) / 2,
          width: MAN_W,
          height: MAN_H,
          display: 'block',
          mixBlendMode: 'multiply',
        }}
        draggable={false}
      />
    </div>
  )
}
