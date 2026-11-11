'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Images } from 'lucide-react'
import MediaPicker from '@/components/admin/MediaPicker'

import type { ReactNodeViewProps } from '@tiptap/react'

export interface ImageItem {
  src: string
  caption: string
}

/** Parse the `images` attribute, handling both the new object format and
 *  the old plain-string-array format for backward compat. */
export function parseImages(raw: unknown): ImageItem[] {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!Array.isArray(parsed)) return []
    return (parsed as unknown[]).flatMap(item => {
      if (typeof item === 'string') return [{ src: item, caption: '' }]
      if (item && typeof item === 'object' && 'src' in item) {
        const o = item as { src: string; caption?: string }
        return [{ src: o.src, caption: o.caption ?? '' }]
      }
      return []
    })
  } catch { return [] }
}

function ImageGridView({ node, updateAttributes, deleteNode, editor, getPos }: ReactNodeViewProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  // Local state drives rendering immediately — updateAttributes persists to Tiptap.
  // Tiptap v3 + React 19: attr-only changes on atom nodes don't always trigger a
  // NodeView re-render, so we can't rely on node.attrs as the display source of truth.
  const [images, setImages] = useState<ImageItem[]>(() => parseImages(node.attrs.images))
  const [cols, setCols] = useState<number>(() => {
    const raw = node.attrs.cols
    return typeof raw === 'string' ? parseInt(raw) || 2 : (raw as number) ?? 2
  })
  const [ratio, setRatio] = useState<string>(() => (node.attrs.ratio as string) ?? 'sq')
  const [caption, setCaption] = useState<string>(() => (node.attrs.caption as string) ?? '')

  // Sync inward if Tiptap ever does push a fresh node (e.g. undo/redo)
  useEffect(() => { setImages(parseImages(node.attrs.images)) }, [node.attrs.images])
  useEffect(() => {
    const raw = node.attrs.cols
    setCols(typeof raw === 'string' ? parseInt(raw) || 2 : (raw as number) ?? 2)
  }, [node.attrs.cols])
  useEffect(() => { setRatio((node.attrs.ratio as string) ?? 'sq') }, [node.attrs.ratio])
  useEffect(() => { setCaption((node.attrs.caption as string) ?? '') }, [node.attrs.caption])

  // Direct ProseMirror dispatch — bypasses the global updateAttributes command which
  // searches within tr.selection.ranges and silently no-ops when focus has moved to
  // a modal (e.g. MediaPicker). setNodeMarkup at the node's known position always works.
  function setAttrs(attrs: Record<string, unknown>) {
    if (editor && typeof getPos === 'function') {
      const pos = getPos()
      if (typeof pos === 'number') {
        const { state } = editor.view
        const current = state.doc.nodeAt(pos)
        if (current) {
          editor.view.dispatch(state.tr.setNodeMarkup(pos, undefined, { ...current.attrs, ...attrs }))
          return
        }
      }
    }
    // Fallback for edge cases where editor/getPos unavailable
    updateAttributes(attrs)
  }

  function addImages(urls: string[]) {
    const next = [...images, ...urls.map(src => ({ src, caption: '' }))]
    setImages(next)
    setAttrs({ images: next })
    setPickerOpen(false)
  }

  function removeImage(idx: number) {
    const next = images.filter((_, i) => i !== idx)
    setImages(next)
    setAttrs({ images: next })
  }

  function updateImageCaption(idx: number, cap: string) {
    const next = images.map((img, i) => i === idx ? { ...img, caption: cap } : img)
    setImages(next)
    setAttrs({ images: next })
  }

  function handleSetCols(n: number) {
    setCols(n)
    setAttrs({ cols: n })
  }

  function handleSetRatio(v: string) {
    setRatio(v)
    setAttrs({ ratio: v })
  }

  function handleCaption(v: string) {
    setCaption(v)
    setAttrs({ caption: v })
  }

  return (
    <NodeViewWrapper>
      <div className="my-6 rounded-xl border border-zinc-200 overflow-hidden" contentEditable={false}>
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 border-b border-zinc-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <Images size={12} /> Image Grid
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-zinc-400 mr-3">
              Ratio:
              {[['sq','Square'],['vid','Video'],['port','Portrait'],['free','Natural']].map(([v, l]) => (
                <button key={v} onClick={() => handleSetRatio(v)}
                  className={`px-1.5 py-0.5 rounded text-xs transition-colors ${ratio === v ? 'bg-violet-600 text-white' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'}`}>
                  {l}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              Cols:
              {[1, 2, 3, 4].map(n => (
                <button key={n} onClick={() => handleSetCols(n)}
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
          {images.length === 0 ? (
            <button onClick={() => setPickerOpen(true)}
              className="w-full py-8 text-sm text-zinc-400 hover:text-zinc-600 text-center border-2 border-dashed border-zinc-200 rounded-lg transition-colors">
              Click to add images from library
            </button>
          ) : ratio === 'free' ? (
            <div style={{ columns: cols, gap: '8px' }}>
              {images.map((img, i) => (
                <div key={i} className="mb-3 break-inside-avoid group">
                  <div className="relative rounded-lg overflow-hidden bg-zinc-100">
                    <Image src={img.src} alt={img.caption} width={400} height={400}
                      className="w-full h-auto object-cover block group-hover:scale-105 transition-transform duration-300" sizes="200px" />
                    <button onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-1 bg-zinc-900/70 hover:bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-all text-white">
                      <X size={12} />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 to-transparent pt-6 px-2 pb-1.5">
                      <input type="text" value={img.caption}
                        onChange={e => updateImageCaption(i, e.target.value)}
                        placeholder="Caption…"
                        className="w-full text-xs text-white/90 placeholder-white/40 bg-transparent focus:outline-none focus:placeholder-white/70 italic transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setPickerOpen(true)}
                className="w-full mb-2 py-6 rounded-lg border-2 border-dashed border-zinc-200 hover:border-violet-400 flex items-center justify-center text-zinc-400 hover:text-violet-500 transition-colors text-sm break-inside-avoid">
                + Add
              </button>
            </div>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {images.map((img, i) => (
                <div key={i} className="group">
                  <div className={`relative rounded-lg overflow-hidden bg-zinc-100 ${ratio === 'sq' ? 'aspect-square' : ratio === 'vid' ? 'aspect-video' : ratio === 'port' ? 'aspect-[3/4]' : ''}`}>
                    <Image src={img.src} alt={img.caption} fill className="object-cover" sizes="400px" />
                    <button onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-1 bg-zinc-900/70 hover:bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-all text-white">
                      <X size={12} />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 to-transparent pt-8 px-2 pb-1.5">
                      <input type="text" value={img.caption}
                        onChange={e => updateImageCaption(i, e.target.value)}
                        placeholder="Caption…"
                        className="w-full text-xs text-white/90 placeholder-white/40 bg-transparent focus:outline-none focus:placeholder-white/70 italic transition-colors" />
                    </div>
                  </div>
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

      {/* Grid-level caption */}
      <div className="px-3 pb-3" contentEditable={false}>
        <input
          type="text"
          value={caption}
          onChange={e => handleCaption(e.target.value)}
          placeholder="Add a grid caption…"
          className="w-full text-xs text-zinc-500 placeholder-zinc-700 bg-transparent border-0 border-t border-zinc-200 pt-2 focus:outline-none focus:text-zinc-700 italic"
        />
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
    // Per-attribute parseHTML is essential in Tiptap v3: it runs AFTER and
    // OVERRIDES the node-level getAttrs for each individual attr. Without
    // explicit parseHTML here, Tiptap falls back to dom.getAttribute(attrName)
    // which produces null/wrong values for our data-* attributes.
    return {
      images: {
        default: [],
        renderHTML: () => null,
        parseHTML: (el: HTMLElement | string) => {
          if (typeof el === 'string') return []
          const imagesRaw = el.getAttribute('data-images')
          if (imagesRaw) return parseImages(imagesRaw)
          // Backward compat: data-srcs may be a JSON array, JSON string, or absent
          const srcsRaw = el.getAttribute('data-srcs') || ''
          const plainSrcs = el.getAttribute('srcs') || ''
          const toParse = srcsRaw || (plainSrcs ? JSON.stringify(plainSrcs) : '[]')
          try {
            const parsed = JSON.parse(toParse)
            const list: string[] = Array.isArray(parsed)
              ? parsed
              : typeof parsed === 'string'
                ? parsed.split(',').map((s: string) => s.trim()).filter(Boolean)
                : []
            if (list.length) return list.map(src => ({ src, caption: '' }))
          } catch {}
          if (plainSrcs) {
            return plainSrcs.split(',').map((s: string) => s.trim()).filter(Boolean).map(src => ({ src, caption: '' }))
          }
          return []
        },
      },
      cols: {
        default: 2,
        renderHTML: () => null,
        parseHTML: (el: HTMLElement | string) => {
          if (typeof el === 'string') return 2
          const v = el.getAttribute('data-cols') || el.getAttribute('cols') || '2'
          return parseInt(v) || 2
        },
      },
      ratio: {
        default: 'sq',
        renderHTML: () => null,
        parseHTML: (el: HTMLElement | string) => {
          if (typeof el === 'string') return 'sq'
          return el.getAttribute('data-ratio') || el.getAttribute('ratio') || 'sq'
        },
      },
      caption: {
        default: '',
        renderHTML: () => null,
        parseHTML: (el: HTMLElement | string) => {
          if (typeof el === 'string') return ''
          return el.getAttribute('data-caption') || el.getAttribute('caption') || ''
        },
      },
    }
  },
  parseHTML() {
    // Simple tag match — per-attribute parseHTML above handles all attr extraction.
    return [{ tag: 'div[data-image-grid]' }]
  },
  renderHTML({ HTMLAttributes, node }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-image-grid': '',
      'data-images': JSON.stringify(node.attrs.images),
      'data-cols': String(node.attrs.cols),
      'data-ratio': String(node.attrs.ratio || 'sq'),
      'data-caption': String(node.attrs.caption || ''),
    })]
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageGridView)
  },
})
