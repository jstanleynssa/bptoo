'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { useState } from 'react'
import Image from 'next/image'
import { X, Images } from 'lucide-react'
import MediaPicker from '@/components/admin/MediaPicker'

import type { ReactNodeViewProps } from '@tiptap/react'
function ImageGridView({ node, updateAttributes, deleteNode }: ReactNodeViewProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const rawSrcs = node.attrs.srcs
  const srcs: string[] = (() => {
    try {
      const parsed = typeof rawSrcs === 'string' ? JSON.parse(rawSrcs) : rawSrcs
      return Array.isArray(parsed) ? parsed : []
    } catch { return [] }
  })()
  const rawCols = node.attrs.cols
  const cols = typeof rawCols === 'string' ? parseInt(rawCols) || 2 : (rawCols as number) ?? 2

  function addImages(urls: string[]) {
    updateAttributes({ srcs: [...srcs, ...urls] })
    setPickerOpen(false)
  }

  function removeImage(idx: number) {
    updateAttributes({ srcs: srcs.filter((_, i) => i !== idx) })
  }

  function setCols(n: number) {
    updateAttributes({ cols: n })
  }

  return (
    <NodeViewWrapper>
      <div className="my-6 rounded-xl border border-zinc-200 overflow-hidden" contentEditable={false}>
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 border-b border-zinc-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <Images size={12} /> Image Grid
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              Cols:
              {[1, 2, 3].map(n => (
                <button key={n} onClick={() => setCols(n)}
                  className={`w-5 h-5 rounded text-xs transition-colors ${cols === n ? 'bg-violet-600 text-white' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'}`}>
                  {n}
                </button>
              ))}
            </div>
            <button onClick={() => setPickerOpen(true)} className="text-xs text-violet-500 hover:text-violet-700 transition-colors">+ Add</button>
            <button onClick={deleteNode} className="p-0.5 text-zinc-400 hover:text-red-500 transition-colors"><X size={14} /></button>
          </div>
        </div>

        <div className="p-3">
          {srcs.length === 0 ? (
            <button onClick={() => setPickerOpen(true)}
              className="w-full py-8 text-sm text-zinc-400 hover:text-zinc-600 text-center border-2 border-dashed border-zinc-200 rounded-lg transition-colors">
              Click to add images from library
            </button>
          ) : (
            <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {srcs.map((src, i) => (
                <div key={i} className="relative group aspect-video rounded-lg overflow-hidden bg-zinc-100">
                  <Image src={src} alt="" fill className="object-cover" sizes="400px" />
                  <button onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-zinc-900/70 hover:bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-all text-white">
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button onClick={() => setPickerOpen(true)}
                className="aspect-video rounded-lg border-2 border-dashed border-zinc-200 hover:border-violet-400 flex items-center justify-center text-zinc-400 hover:text-violet-500 transition-colors text-sm">
                + Add
              </button>
            </div>
          )}
        </div>
      </div>

      {pickerOpen && (
        <MediaPicker onSelectMultiple={addImages} onClose={() => setPickerOpen(false)} />
      )}
    </NodeViewWrapper>
  )
}

export const ImageGridNode = Node.create({
  name: 'imageGrid',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      srcs: { default: [] },
      cols: { default: 2 },
    }
  },
  parseHTML() {
    return [{
      tag: 'div[data-image-grid]',
      getAttrs: (dom: HTMLElement) => ({
        srcs: JSON.parse(dom.getAttribute('data-srcs') || '[]'),
        cols: parseInt(dom.getAttribute('data-cols') || '2'),
      }),
    }]
  },
  renderHTML({ HTMLAttributes, node }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-image-grid': '',
      'data-srcs': JSON.stringify(node.attrs.srcs),
      'data-cols': String(node.attrs.cols),
    })]
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageGridView)
  },
})
