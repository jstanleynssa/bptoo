'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TOOL_MAP, type Tool } from '@/lib/tools'

interface ToolBadgeProps {
  toolId: string
  size?: 'sm' | 'md'
}

function BadgeContent({ tool, dim, fontSize }: { tool: Tool; dim: number; fontSize: number }) {
  if (tool.abbr && tool.bg) {
    return (
      <span
        className="inline-flex items-center justify-center rounded font-black select-none shrink-0"
        style={{ width: dim, height: dim, backgroundColor: tool.bg, color: tool.color, fontSize, letterSpacing: '-0.5px' }}
      >
        {tool.abbr}
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border ${dim <= 24 ? 'text-[10px] px-2 py-0.5 gap-1' : 'text-xs'}`}
      style={{ borderColor: `${tool.color}50`, color: tool.color, backgroundColor: `${tool.color}18` }}
    >
      {tool.emoji && <span style={{ fontSize: dim <= 24 ? 10 : 14 }}>{tool.emoji}</span>}
      <span>{tool.label}</span>
    </span>
  )
}

export default function ToolBadge({ toolId, size = 'md' }: ToolBadgeProps) {
  const [hovered, setHovered] = useState(false)
  const tool: Tool | undefined = TOOL_MAP[toolId]
  const dim = size === 'sm' ? 24 : 32
  const fontSize = size === 'sm' ? 9 : 11

  if (!tool) {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-medium bg-white/10 text-white/60 ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs'}`}>
        {toolId}
      </span>
    )
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* The badge itself */}
      <BadgeContent tool={tool} dim={dim} fontSize={fontSize} />

      {/* Animated tooltip bubble */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute z-50 pointer-events-none"
            style={{
              bottom: '100%',
              left: '50%',
              marginBottom: 10,
            }}
            initial={{ opacity: 0, scale: 0.6, x: '-50%', y: 8 }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: 0 }}
            exit={{ opacity: 0, scale: 0.6, x: '-50%', y: 8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.6 }}
          >
            <div
              className="flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border border-white/10 shadow-2xl"
              style={{ backgroundColor: '#18181b', minWidth: 80, whiteSpace: 'nowrap' }}
            >
              {/* Large badge in tooltip */}
              <BadgeContent tool={tool} dim={48} fontSize={18} />
              {/* Tool name */}
              <span className="text-xs font-semibold text-white/80">{tool.label}</span>
            </div>
            {/* Arrow */}
            <div className="flex justify-center">
              <div
                style={{
                  width: 0, height: 0,
                  borderLeft: '7px solid transparent',
                  borderRight: '7px solid transparent',
                  borderTop: '7px solid #27272a',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
