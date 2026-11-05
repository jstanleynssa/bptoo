'use client'

import { useState } from 'react'
import parse, { Element, type HTMLReactParserOptions } from 'html-react-parser'
import Image from 'next/image'
import Lightbox from '@/components/Lightbox'

// ── Screenplay renderer ──────────────────────────────────────────────────────

type LineType = 'scene' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition'
interface ScreenplayLine { id: string; type: LineType; text: string }

const LINE_STYLES: Record<LineType, React.CSSProperties> = {
  scene:         { textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4em' },
  action:        { marginBottom: '0.4em' },
  character:     { marginLeft: '37%', textTransform: 'uppercase', fontWeight: 600, marginBottom: 0 },
  dialogue:      { marginLeft: '20%', marginRight: '15%', marginBottom: '0.4em' },
  parenthetical: { marginLeft: '28%', marginRight: '25%', fontStyle: 'italic', marginBottom: 0 },
  transition:    { textAlign: 'right', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4em' },
}

function ScreenplayRenderer({ lines }: { lines: ScreenplayLine[] }) {
  return (
    <div className="my-8 rounded-xl border border-white/10 bg-white/5 overflow-hidden not-prose">
      <div className="px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">Screenplay</span>
      </div>
      <div className="px-10 py-6" style={{ fontFamily: '"Courier Prime", monospace', fontSize: '14px', lineHeight: '1.7', color: 'inherit' }}>
        {lines.map(line => (
          <div key={line.id} style={LINE_STYLES[line.type] ?? {}}>
            {line.text || <span className="opacity-0">·</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Video renderer ───────────────────────────────────────────────────────────

function videoEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return url
}

function VideoRenderer({ src }: { src: string }) {
  const embed = videoEmbedUrl(src)
  if (!embed) return null
  return (
    <div className="my-8 not-prose">
      {src.match(/\.(mp4|webm|ogg)$/i) ? (
        <video controls className="w-full rounded-2xl aspect-video bg-black">
          <source src={embed} />
        </video>
      ) : (
        <iframe src={embed} className="w-full aspect-video rounded-2xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen />
      )}
    </div>
  )
}

// ── Image grid renderer ──────────────────────────────────────────────────────

function ImageGridRenderer({ srcs, cols, onImageClick }: { srcs: string[]; cols: number; onImageClick: (src: string) => void }) {
  if (!srcs.length) return null
  return (
    <div className="my-8 not-prose" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '8px' }}>
      {srcs.map((src, i) => (
        <button key={i} onClick={() => onImageClick(src)} className="relative aspect-video rounded-xl overflow-hidden bg-black/5 cursor-zoom-in group">
          <Image src={src} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="400px" />
        </button>
      ))}
    </div>
  )
}

// ── Main renderer ────────────────────────────────────────────────────────────

interface ContentRendererProps {
  html: string
  className?: string
}

export default function ContentRenderer({ html, className }: ContentRendererProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  const options: HTMLReactParserOptions = {
    replace(domNode) {
      if (!(domNode instanceof Element)) return

      // Inline images — make clickable for lightbox
      if (domNode.name === 'img' && domNode.attribs?.src) {
        const { src, alt, class: cls } = domNode.attribs
        return (
          <img
            src={src}
            alt={alt ?? ''}
            className={`${cls ?? ''} cursor-zoom-in hover:opacity-90 transition-opacity`}
            onClick={() => setLightboxSrc(src)}
            style={{ cursor: 'zoom-in' }}
          />
        )
      }

      // Screenplay block
      if (domNode.attribs?.['data-screenplay'] !== undefined) {
        const linesRaw = domNode.attribs['data-lines'] ?? '[]'
        try {
          const lines: ScreenplayLine[] = JSON.parse(linesRaw)
          return <ScreenplayRenderer lines={lines} />
        } catch { return <></> }
      }

      // Video embed
      if (domNode.attribs?.['data-video-embed'] !== undefined) {
        const src = domNode.attribs['data-src'] ?? ''
        return <VideoRenderer src={src} />
      }

      // Image grid
      if (domNode.attribs?.['data-image-grid'] !== undefined) {
        const srcsRaw = domNode.attribs['data-srcs'] ?? '[]'
        const cols = parseInt(domNode.attribs['data-cols'] ?? '2')
        try {
          const srcs: string[] = JSON.parse(srcsRaw)
          return <ImageGridRenderer srcs={srcs} cols={cols} onImageClick={setLightboxSrc} />
        } catch { return <></> }
      }
    },
  }

  return (
    <>
      <div className={className}>
        {parse(html, options)}
      </div>

      {lightboxSrc && (
        <Lightbox
          src={lightboxSrc}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </>
  )
}
