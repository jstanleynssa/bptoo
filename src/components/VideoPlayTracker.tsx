'use client'

import { useRef, ReactNode } from 'react'

interface VideoPlayTrackerProps {
  slug: string
  children: ReactNode
}

export default function VideoPlayTracker({ slug, children }: VideoPlayTrackerProps) {
  const tracked = useRef(false)

  function handlePlay() {
    if (tracked.current) return // only count first play per page load
    tracked.current = true
    fetch(`/api/projects/${slug}/play`, { method: 'POST' }).catch(() => {})
  }

  return (
    <div onPlay={handlePlay} style={{ display: 'contents' }}>
      {children}
    </div>
  )
}
