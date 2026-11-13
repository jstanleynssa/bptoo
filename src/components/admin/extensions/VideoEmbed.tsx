'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { useState } from 'react'
import { X, Video, Check, Link as LinkIcon } from 'lucide-react'

function embedUrl(url: string): string | null {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  if (url.match(/\.(mp4|webm|ogg|mov|m4v|avi)$/i)) return url
  return null
}

import type { ReactNodeViewProps } from '@tiptap/react'
function VideoEmbedView({ node, updateAttributes, deleteNode }: ReactNodeViewProps) {
  const [editing, setEditing] = useState(!(node.attrs.src as string))
  const [draft, setDraft] = useState((node.attrs.src as string) ?? '')
  const [showLink, setShowLink] = useState(!!(node.attrs.captionHref as string))
  const url = node.attrs.src as string
  const caption = node.attrs.caption as string
  const captionHref = node.attrs.captionHref as string
  const embed = embedUrl(url)

  function commit() {
    updateAttributes({ src: draft })
    setEditing(false)
  }

  return (
    <NodeViewWrapper>
      <div className="my-6 rounded-xl border border-zinc-200 overflow-hidden" contentEditable={false}>
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 border-b border-zinc-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <Video size={12} /> Video
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(e => !e)} className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
              {editing ? 'Cancel' : 'Change URL'}
            </button>
            <button onClick={deleteNode} className="p-0.5 text-zinc-400 hover:text-red-500 transition-colors"><X size={14} /></button>
          </div>
        </div>

        {editing ? (
          <div className="p-4 flex gap-2">
            <input
              autoFocus
              type="url"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && commit()}
              placeholder="Paste YouTube, Vimeo, or direct video URL…"
              className="flex-1 px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:border-violet-500 outline-none"
            />
            <button onClick={commit} className="p-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors">
              <Check size={16} />
            </button>
          </div>
        ) : embed ? (
          url.match(/\.(mp4|webm|ogg|mov|m4v|avi)$/i) ? (
            <video controls className="w-full aspect-video bg-black">
              <source src={embed} />
            </video>
          ) : (
            <iframe src={embed} className="w-full aspect-video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          )
        ) : (
          <div className="p-8 text-center text-zinc-400 text-sm cursor-pointer" onClick={() => setEditing(true)}>
            Click to add a video URL
          </div>
        )}

        {/* Caption */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={caption ?? ''}
              onChange={e => updateAttributes({ caption: e.target.value })}
              placeholder="Caption (optional)…"
              className="flex-1 bg-transparent text-center text-sm text-zinc-500 italic placeholder-zinc-700 focus:outline-none focus:text-zinc-300"
            />
            <button
              type="button"
              onClick={() => setShowLink(l => !l)}
              className={`p-1 rounded transition-colors ${showLink || captionHref ? 'text-violet-400' : 'text-zinc-700 hover:text-zinc-500'}`}
              title="Add link to caption"
            >
              <LinkIcon size={12} />
            </button>
          </div>
          {(showLink || captionHref) && (
            <input
              type="url"
              value={captionHref ?? ''}
              onChange={e => updateAttributes({ captionHref: e.target.value })}
              placeholder="Caption link URL (optional)…"
              className="mt-1 w-full bg-transparent text-center text-xs text-violet-400/60 placeholder-zinc-700 focus:outline-none focus:text-violet-400"
            />
          )}
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export const VideoEmbedNode = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  addAttributes() { return { src: { default: '' }, caption: { default: '' }, captionHref: { default: '' } } },
  parseHTML() {
    return [{
      tag: 'div[data-video-embed]',
      getAttrs: (dom: HTMLElement) => ({
        src: dom.getAttribute('data-src') || '',
        caption: dom.getAttribute('data-caption') || '',
        captionHref: dom.getAttribute('data-caption-href') || '',
      }),
    }]
  },
  renderHTML({ HTMLAttributes, node }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-video-embed': '',
      'data-src': node.attrs.src,
      'data-caption': node.attrs.caption || '',
      'data-caption-href': node.attrs.captionHref || '',
    })]
  },
  addNodeView() {
    return ReactNodeViewRenderer(VideoEmbedView)
  },
})
