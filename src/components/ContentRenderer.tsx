'use client'

import { useState } from 'react'
import parse, { Element, type HTMLReactParserOptions } from 'html-react-parser'
import { parseImages } from '@/components/admin/extensions/ImageGrid'
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
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden not-prose">
      <div className="px-4 py-2 bg-zinc-100 border-b border-zinc-200">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Screenplay</span>
      </div>
      <div className="px-10 py-6" style={{ fontFamily: '"Courier Prime", monospace', fontSize: '14px', lineHeight: '1.7', color: '#1a1a1a' }}>
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

function VideoRenderer({ src, onPlay }: { src: string; onPlay?: () => void }) {
  const embed = videoEmbedUrl(src)
  if (!embed) return null
  return (
    <div className="my-8 not-prose">
      {src.match(/\.(mp4|webm|ogg)$/i) ? (
        <video controls className="w-full rounded-2xl aspect-video bg-black" onPlay={onPlay}>
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

function ImageGridRenderer({ images, cols, ratio, onImageClick }: {
  images: { src: string; caption: string }[]
  cols: number
  ratio?: string
  onImageClick: (src: string, all: string[]) => void
}) {
  if (!images.length) return null
  const allSrcs = images.map(img => img.src)
  const ratioClass = ratio === 'sq' ? 'aspect-square' : ratio === 'vid' ? 'aspect-video' : ratio === 'port' ? 'aspect-[3/4]' : ''

  if (ratio === 'free') {
    // Masonry: natural proportions, no cropping
    return (
      <div className="my-8 not-prose" style={{ columns: cols, gap: '8px' }}>
        {images.map((img, i) => (
          <div key={i} className="mb-3 break-inside-avoid">
            <button onClick={() => onImageClick(img.src, allSrcs)}
              className="block w-full rounded-xl overflow-hidden cursor-zoom-in group">
              <Image src={img.src} alt={img.caption || ''} width={600} height={600}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300" sizes="400px" />
            </button>
            {img.caption && (
              <p className="text-xs text-center mt-1.5 opacity-50 italic">{img.caption}</p>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="my-8 not-prose" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '8px' }}>
      {images.map((img, i) => (
        <div key={i}>
          <button onClick={() => onImageClick(img.src, allSrcs)} className={`relative block w-full rounded-xl overflow-hidden bg-black/5 cursor-zoom-in group ${ratioClass}`}>
            <Image src={img.src} alt={img.caption || ''} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="400px" />
          </button>
          {img.caption && (
            <p className="text-xs text-center mt-1.5 opacity-50 italic">{img.caption}</p>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main renderer ────────────────────────────────────────────────────────────

interface ContentRendererProps {
  html: string
  className?: string
  onVideoPlay?: () => void
  videoPlaySlug?: string  // pass slug to auto-call the play API
}

export default function ContentRenderer({ html, className, onVideoPlay, videoPlaySlug }: ContentRendererProps) {
  const handleVideoPlay = onVideoPlay ?? (videoPlaySlug
    ? () => { fetch(`/api/projects/${videoPlaySlug}/play`, { method: 'POST' }).catch(() => {}) }
    : undefined
  )
  const [lightbox, setLightbox] = useState<{ src: string; srcs: string[] } | null>(null)

  const options: HTMLReactParserOptions = {
    replace(domNode) {
      if (!(domNode instanceof Element)) return

      // Figure with caption
      if (domNode.name === 'figure' && domNode.attribs?.['data-figure'] !== undefined) {
        const imgEl = domNode.children?.find((c): c is Element => c instanceof Element && c.name === 'img')
        const captionEl = domNode.children?.find((c): c is Element => c instanceof Element && c.name === 'figcaption')
        const src = imgEl?.attribs?.src ?? ''
        // Caption text may be in a direct text node OR inside an <a> child
        const captionAEl = captionEl?.children?.find((c): c is Element => c instanceof Element && c.name === 'a')
        const textNodes = (captionAEl ?? captionEl)?.children
        const caption = textNodes?.map((c) => ('data' in c ? (c as {data?: string}).data : '') ?? '').join('') ?? ''
        if (!src) return <></>
        return (
          <figure className="my-6 not-prose">
            <img
              src={src}
              alt={caption}
              className="w-full h-auto rounded-xl cursor-zoom-in hover:opacity-90 transition-opacity"
              onClick={() => setLightbox({ src, srcs: [src] })}
              style={{ display: 'block', cursor: 'zoom-in' }}
            />
            {caption && (
              <figcaption className="mt-2 text-center text-sm italic opacity-50">
                {captionAEl?.attribs?.href
                  ? <a href={captionAEl.attribs.href} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80 transition-opacity">{caption}</a>
                  : <>{caption}</>}
              </figcaption>
            )}
          </figure>
        )
      }

      // Inline images — make clickable for lightbox
      if (domNode.name === 'img' && domNode.attribs?.src) {
        const { src, alt, class: cls } = domNode.attribs
        return (
          <img
            src={src}
            alt={alt ?? ''}
            className={`${cls ?? ''} cursor-zoom-in hover:opacity-90 transition-opacity`}
            onClick={() => setLightbox({ src, srcs: [src] })}
            style={{ cursor: 'zoom-in' }}
          />
        )
      }

      // Screenplay block
      if (domNode.attribs?.['data-screenplay'] !== undefined) {
        const linesRaw = domNode.attribs['data-lines'] ?? '[]'
        try {
          const parsed = JSON.parse(linesRaw)
          // Handle double-encoded strings or non-array values
          const lines: ScreenplayLine[] = Array.isArray(parsed)
            ? parsed
            : Array.isArray(JSON.parse(parsed))
              ? JSON.parse(parsed)
              : []
          if (!lines.length) return <></>
          return <ScreenplayRenderer lines={lines} />
        } catch { return <></> }
      }

      // Video embed
      if (domNode.attribs?.['data-video-embed'] !== undefined) {
        const src = domNode.attribs['data-src'] ?? ''
        const videoCaption = domNode.attribs['data-caption'] ?? ''
        const videoCaptionHref = domNode.attribs['data-caption-href'] ?? ''
        return (
          <>
            <VideoRenderer src={src} onPlay={handleVideoPlay} />
            {videoCaption && (
              <p className="text-center text-sm italic opacity-50 -mt-4 mb-6">
                {videoCaptionHref
                  ? <a href={videoCaptionHref} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80 transition-opacity">{videoCaption}</a>
                  : videoCaption}
              </p>
            )}
          </>
        )
      }

      // Image grid
      if (domNode.attribs?.['data-image-grid'] !== undefined) {
        const cols = parseInt(domNode.attribs['data-cols'] ?? '2')
        const ratio = domNode.attribs['data-ratio'] ?? 'sq'
        const gridCaption = domNode.attribs['data-caption'] ?? ''

        // New format: data-images [{src,caption}…]
        // Backward compat: old data-srcs plain URL array
        const imagesRaw = domNode.attribs['data-images']
        const srcsRaw = domNode.attribs['data-srcs']
        let images: { src: string; caption: string }[] = []
        if (imagesRaw) {
          images = parseImages(imagesRaw)
        } else if (srcsRaw) {
          try {
            const parsed = JSON.parse(srcsRaw)
            const srcs: string[] = Array.isArray(parsed)
              ? parsed
              : typeof parsed === 'string'
                ? parsed.split(',').map((s: string) => s.trim()).filter(Boolean)
                : []
            images = srcs.map(src => ({ src, caption: '' }))
          } catch {}
        }

        return (
          <>
            <ImageGridRenderer images={images} cols={cols} ratio={ratio} onImageClick={(src, all) => setLightbox({ src, srcs: all })} />
            {gridCaption && (
              <p className="text-center text-sm italic opacity-50 -mt-4 mb-6">{gridCaption}</p>
            )}
          </>
        )
      }
    },
  }

  return (
    <>
      <div className={className}>
        {parse(html, options)}
      </div>

      {lightbox && (
        <Lightbox
          src={lightbox.src}
          srcs={lightbox.srcs}
          onClose={() => setLightbox(null)}
          onNavigate={src => setLightbox(l => l ? { ...l, src } : null)}
        />
      )}
    </>
  )
}
