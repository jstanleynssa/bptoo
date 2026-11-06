'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { useState } from 'react'
import Image from 'next/image'
import { X, Image as ImageIcon } from 'lucide-react'
import type { ReactNodeViewProps } from '@tiptap/react'

function FigureView({ node, updateAttributes, deleteNode }: ReactNodeViewProps) {
  const src = node.attrs.src as string
  const caption = node.attrs.caption as string
  const [editing, setEditing] = useState(!src)
  const [draftSrc, setDraftSrc] = useState(src ?? '')

  function commitSrc() {
    updateAttributes({ src: draftSrc })
    setEditing(false)
  }

  return (
    <NodeViewWrapper>
      <figure className="my-6 not-prose" contentEditable={false}>
        {/* Image area */}
        {!src || editing ? (
          <div className="border border-zinc-700 rounded-xl overflow-hidden bg-zinc-900">
            <div className="p-4 flex gap-2">
              <input autoFocus type="url" value={draftSrc}
                onChange={e => setDraftSrc(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && commitSrc()}
                placeholder="Paste image URL…"
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:border-violet-500 outline-none" />
              <button onClick={commitSrc}
                className="px-3 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm transition-colors">
                Set
              </button>
              <button onClick={deleteNode}
                className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="relative group rounded-xl overflow-hidden bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={caption || ''} className="w-full h-auto block max-w-full rounded-xl" />
            <button onClick={() => setEditing(true)}
              className="absolute top-2 right-2 p-1.5 bg-zinc-900/80 rounded-lg text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
              title="Change image">
              <ImageIcon size={14} />
            </button>
            <button onClick={deleteNode}
              className="absolute top-2 right-10 p-1.5 bg-zinc-900/80 hover:bg-red-900/80 rounded-lg text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
              title="Remove">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Caption */}
        <input
          type="text"
          value={caption ?? ''}
          onChange={e => updateAttributes({ caption: e.target.value })}
          placeholder="Caption (optional)…"
          className="mt-2 w-full bg-transparent text-center text-sm text-zinc-500 italic placeholder-zinc-700 focus:outline-none focus:text-zinc-300"
        />
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
    }
  },

  parseHTML() {
    return [{
      tag: 'figure[data-figure]',
      getAttrs: (dom: HTMLElement) => ({
        src: dom.querySelector('img')?.getAttribute('src') ?? '',
        caption: dom.querySelector('figcaption')?.textContent ?? '',
      }),
    }]
  },

  renderHTML({ node }) {
    const { src, caption } = node.attrs as { src: string; caption: string }
    return ['figure', { 'data-figure': '' },
      ['img', { src, alt: caption || '' }],
      ...(caption ? [['figcaption', {}, caption]] : []),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(FigureView)
  },
})
