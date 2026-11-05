'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'

interface LightboxProps {
  src: string
  alt?: string
  onClose: () => void
}

export default function Lightbox({ src, alt, onClose }: LightboxProps) {
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      {/* Image */}
      <div
        className="relative z-10 max-w-full max-h-full"
        onClick={e => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? ''}
          className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain shadow-2xl"
        />
        {alt && (
          <p className="text-center text-white/60 text-sm mt-3">{alt}</p>
        )}
      </div>
    </div>
  )
}
