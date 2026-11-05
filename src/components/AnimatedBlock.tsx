'use client'

import { motion, type Variants } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedBlockProps {
  children: ReactNode
  delay?: number
  className?: string
  direction?: 'up' | 'left' | 'right'
  style?: React.CSSProperties
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.13 },
  },
}

function makeChildVariants(direction: 'up' | 'left' | 'right'): Variants {
  return {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 32 : 0,
      x: direction === 'left' ? -60 : direction === 'right' ? 60 : 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: { duration: 0.65, ease: 'easeOut' },
    },
  }
}

function StaggeredChildren({ children, direction }: { children: ReactNode; direction: 'up' | 'left' | 'right' }) {
  const variants = makeChildVariants(direction)
  const arr = Array.isArray(children) ? children : [children]
  return (
    <>
      {arr.map((child, i) => (
        <motion.div key={i} variants={variants}>
          {child}
        </motion.div>
      ))}
    </>
  )
}

export default function AnimatedBlock({
  children,
  delay = 0,
  className,
  direction = 'up',
  style,
}: AnimatedBlockProps) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      custom={delay}
    >
      <StaggeredChildren direction={direction}>
        {children}
      </StaggeredChildren>
    </motion.div>
  )
}
