'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { ReactNode } from 'react'

interface ScrollSectionProps {
  children: ReactNode
  className?: string
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const childVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: 'easeOut' } },
}

function StaggeredChildren({ children }: { children: ReactNode }) {
  const arr = Array.isArray(children) ? children : [children]
  return (
    <>
      {arr.map((child, i) => (
        <motion.div key={i} variants={childVariants}>{child}</motion.div>
      ))}
    </>
  )
}

export default function ScrollSection({ children, className }: ScrollSectionProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={`relative ${className ?? ''}`}>
      {/* Line continues down from above */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-12 h-12 w-px bg-black/20" />

      {/* Node dot */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-black/40 bg-[#FACD40] z-10" />

      {/* 1px sentinel at the very top of the section — fires when IT hits the trigger line */}
      <motion.div
        style={{ height: 1, marginBottom: -1 }}
        onViewportEnter={() => setVisible(true)}
        onViewportLeave={() => setVisible(false)}
        // Trigger when sentinel's top reaches 30% from bottom of viewport (70% down)
        viewport={{ margin: '0px 0px -70% 0px' }}
      />

      {/* Content — driven by sentinel state */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={visible ? 'visible' : 'hidden'}
      >
        <StaggeredChildren>{children}</StaggeredChildren>
      </motion.div>
    </div>
  )
}
