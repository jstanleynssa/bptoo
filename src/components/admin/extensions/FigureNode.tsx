'use client'

import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { useState } from 'react'
import { X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react'
import type { ReactNodeViewProps } from '@tiptap/react'

const WIDTH_PRESETS = [
  { label: '1/3', value: '33%' },
  { label: '1/2', value: '50%' },
  { label: '2/3', value: '66%' },
  { label: '3/4', value: '75%' },
  { label: 'Full', value: '100%' },
]

function FigureView({ node, updateAttributes, deleteNode }: ReactNodeViewProps) {
  const src = node.attrs.src as string
  const caption = node.attrs.caption as string
  const captionHref = node.attrs.captionHref as string
  const width = (node.attrs.width as string) || '100%'
  const [editing, setEditing] = useState(!src)
  const [draftSrc, setDraftSrc] = useState(src ?? '')
  const [showLink, setShowLink] = useState(!!captionHref)

  function commitSrc() {
    updateAttributes({ src: draftSrc })
    setEditing(false)
  }

  return (
    <NodeViewWrapper>
      <figure style={{ maxWidth: width, margin: '0 auto' }} className="my-6 not-prose" contentEditable={false}>
        {!src || editing ? (
          <div className="border border-zinc-700 rounded-xl overflow-hidden bg-zinc-900">
            <div className="p-4 flex gap-2">
              <input autoFocus type="url" value={draftSrc}
                onChange={e => setDraftSrc(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && commitSrc()}
                placeholder="Paste image URL…"
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:border-violet-500 outline-none" />
              <button onClick={commitSrc} className="px-3 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm transition-colors">Set</button>
              <button onClick={deleteNode} className="p-2 text-zinc-500 hover:text-red-400 transition-colors"><X size={16} /></button>
            </div>
          </div>
        ) : (
          <div className="relative group rounded-xl overflow-hidden bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={caption || ''} className="w-full h-auto block max-w-full rounded-xl" />
            {/* Width presets overlay */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-zinc-900/80 rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-all">
              {WIDTH_PRESETS.map(p => (
                <button key={p.value} onClick={() => updateAttributes({ width: p.value })}
                  className={`text-xs px-1.5 py-0.5 rounded transition-colors ${width === p.value ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'}`}>
                  {p.label}
                </button>
              ))}
            </div>
            <button onClick={() => setEditing(true)}
              className="absolute top-2 right-10 p-1.5 bg-zinc-900/80 rounded-lg text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all" title="Change image">
              <ImageIcon size={14} />
            </button>
            <button onClick={deleteNode}
              className="absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-red-900/80 rounded-lg text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all" title="Remove">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Caption + optional link */}
        <div className="mt-2">
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
      </figure>
    </NodeViewWrapper>
  )
}

export const FigureNode = Node.create({
  name: 'figure',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: '' },
      caption: { default: '' },
      captionHref: { default: '' },
      width: { default: '100%' },
    }
  },

  parseHTML() {
    return [{
      tag: 'figure[data-figure]',
      getAttrs: (dom: HTMLElement) => ({
        src: dom.querySelector('img')?.getAttribute('src') ?? '',
        caption: dom.querySelector('figcaption a, figcaption')?.textContent ?? '',
        captionHref: dom.querySelector('figcaption a')?.getAttribute('href') ?? '',
        width: dom.getAttribute('data-width') ?? '100%',
      }),
    }]
  },

  renderHTML({ node }) {
    const { src, caption, captionHref, width } = node.attrs as { src: string; caption: string; captionHref: string; width: string }
    const figcaption = caption
      ? captionHref
        ? ['figcaption', {}, ['a', { href: captionHref, target: '_blank', rel: 'noopener noreferrer' }, caption]]
        : ['figcaption', {}, caption]
      : null
    return ['figure', { 'data-figure': '', 'data-width': width || '100%' },
      ['img', { src, alt: caption || '' }],
      ...(figcaption ? [figcaption] : []),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(FigureView)
  },
})
