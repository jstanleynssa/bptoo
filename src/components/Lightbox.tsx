'use client'

import { useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface LightboxProps {
  src: string
  srcs?: string[]  // full gallery for navigation
  alt?: string
  onClose: () => void
  onNavigate?: (src: string) => void
}

export default function Lightbox({ src, srcs = [], alt, onClose, onNavigate }: LightboxProps) {
  const idx = srcs.indexOf(src)
  const hasPrev = idx > 0
  const hasNext = idx < srcs.length - 1

  const prev = useCallback(() => {
    if (hasPrev && onNavigate) onNavigate(srcs[idx - 1])
  }, [hasPrev, idx, srcs, onNavigate])

  const next = useCallback(() => {
    if (hasNext && onNavigate) onNavigate(srcs[idx + 1])
  }, [hasNext, idx, srcs, onNavigate])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, prev, next])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Close */}
      <button onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
        <X size={20} />
      </button>

      {/* Prev */}
      {hasPrev && (
        <button onClick={e => { e.stopPropagation(); prev() }}
          className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button onClick={e => { e.stopPropagation(); next() }}
          className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <ChevronRight size={24} />
        </button>
      )}

      {/* Image */}
      <div className="relative z-10 max-w-full max-h-full" onClick={e => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt ?? ''}
          className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain shadow-2xl" />
        {alt && <p className="text-center text-white/60 text-sm mt-3">{alt}</p>}
        {srcs.length > 1 && (
          <p className="text-center text-white/30 text-xs mt-1">{idx + 1} / {srcs.length}</p>
        )}
      </div>
    </div>
  )
}
