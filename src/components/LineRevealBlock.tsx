'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, type Variants } from 'framer-motion'
import { HERO_H_EXPORT as HERO_H, BRAIN_PCT_EXPORT as BRAIN_PCT, CLIP_END_PCT_EXPORT as CLIP_END_PCT, REVEAL_RATE_EXPORT as REVEAL_RATE } from './RevealSVG'

interface LineRevealBlockProps {
  blockY: number   // Y from top of SVG container
  side: 'left' | 'right'
  children: React.ReactNode
  style?: React.CSSProperties
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
}

function makeChildVariants(side: 'left' | 'right'): Variants {
  return {
    hidden: { opacity: 0, x: side === 'left' ? -60 : 60, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.65, ease: 'easeOut' } },
  }
}

function StaggeredChildren({ children, side }: { children: React.ReactNode; side: 'left' | 'right' }) {
  const variants = makeChildVariants(side)
  const arr = Array.isArray(children) ? children : [children]
  return (
    <>
      {arr.map((child, i) => (
        <motion.div key={i} variants={variants}>{child}</motion.div>
      ))}
    </>
  )
}

export default function LineRevealBlock({ blockY, side, children, style }: LineRevealBlockProps) {
  const [triggered, setTriggered] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let rafId: number

    function onScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const container = document.querySelector('[data-reveal-container]') as HTMLElement
        if (!container || !elementRef.current) return

        const rect = container.getBoundingClientRect()
        const vh = window.innerHeight

        // Mirror RevealSVG exactly — tied to scrollY
        const scrollY = window.scrollY
        const maxReveal = HERO_H * (CLIP_END_PCT - BRAIN_PCT)
        const revealedPx = Math.min(maxReveal, Math.max(0, scrollY) * REVEAL_RATE)

        // String tip position in container coords
        const tipContainerY = HERO_H * BRAIN_PCT + revealedPx

        // Block top in container coords
        const halfHeight = elementRef.current.offsetHeight / 2
        const blockTopContainerY = blockY - halfHeight

        setTriggered(tipContainerY >= blockTopContainerY)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [blockY])

  return (
    <motion.div
      ref={elementRef}
      style={style}
      variants={containerVariants}
      initial="hidden"
      animate={triggered ? 'visible' : 'hidden'}
    >
      <StaggeredChildren side={side}>
        {children}
      </StaggeredChildren>
    </motion.div>
  )
}
