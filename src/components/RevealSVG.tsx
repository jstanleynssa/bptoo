'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

// hero.svg: 229.12 × 2623.72, displayed at 280px wide
const HERO_W = 280
const HERO_H = Math.round(HERO_W * 2623.72 / 229.12)  // ≈ 3207px

// BRAIN_PCT: shows brain + wordmark + line stub from 't' — that's fine
const BRAIN_PCT = 0.10

// Clip stops here — just before the hero.svg person appears
const CLIP_END_PCT = 0.855

// How many px to scroll past the 't' before the line starts growing
// (gives the brain+wordmark time to settle, then line emerges)
const REVEAL_RATE = 1.2  // px of line per px scrolled

// man.svg: 149.16 × 266.15
const MAN_W = 180
const MAN_H = Math.round(MAN_W * 266.15 / 149.16)

// Export for LineRevealBlock to use the same constants
export const HERO_H_EXPORT = HERO_H
export const BRAIN_PCT_EXPORT = BRAIN_PCT
export const CLIP_END_PCT_EXPORT = CLIP_END_PCT
export const REVEAL_RATE_EXPORT = REVEAL_RATE

export default function RevealSVG() {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    let rafId: number

    function update() {
      const container = containerRef.current
      const img = imgRef.current
      if (!container || !img) return

      const rect = container.getBoundingClientRect()
      const vh = window.innerHeight

      // Line grows immediately on scroll — no delay
      const scrollY = window.scrollY
      const maxReveal = HERO_H * (CLIP_END_PCT - BRAIN_PCT)
      const revealedPx = Math.min(maxReveal, Math.max(0, scrollY) * REVEAL_RATE)
      const revealedEndY = BRAIN_PCT + revealedPx / HERO_H
      const clipBottom = (1 - Math.min(CLIP_END_PCT, revealedEndY)) * 100
      img.style.clipPath = `inset(0 0 ${clipBottom}% 0)`
    }

    function onScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const manTop = Math.round(HERO_H * CLIP_END_PCT) + 30

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-1/2 -translate-x-1/2"
      style={{ width: `${HERO_W}px` }}
    >
      {/* Single hero.svg — brain + wordmark + line all as one integrated illustration */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src="/hero.svg"
        alt="bptoo — a bespectacled brain connected by a winding string"
        style={{
          width: `${HERO_W}px`,
          height: `${HERO_H}px`,
          display: 'block',
          // Start fully clipped — only brain+wordmark show (line stub hidden)
          clipPath: `inset(0 0 ${(1 - BRAIN_PCT) * 100}% 0)`,
          willChange: 'clip-path',
        }}
        draggable={false}
      />

      {/* man.svg — fades in when line is fully drawn */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: `${manTop}px`,
          left: `${Math.round((HERO_W - MAN_W) / 2)}px`,
          width: `${MAN_W}px`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/man.svg"
          alt="A person"
          style={{ width: `${MAN_W}px`, height: `${MAN_H}px`, display: 'block', mixBlendMode: 'multiply' }}
          draggable={false}
        />
      </motion.div>
    </div>
  )
}
