'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface VideoPlayTrackerProps {
  slug: string
  children: ReactNode
}

export default function VideoPlayTracker({ slug, children }: VideoPlayTrackerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const tracked = useRef(false)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const video = wrapper.querySelector('video')
    if (!video) return

    function handlePlay() {
      if (tracked.current) return // only count first play per page load
      tracked.current = true
      fetch(`/api/projects/${slug}/play`, { method: 'POST' }).catch(() => {})
    }

    video.addEventListener('play', handlePlay)
    return () => video.removeEventListener('play', handlePlay)
  }, [slug])

  return (
    <div ref={wrapperRef}>
      {children}
    </div>
  )
}
