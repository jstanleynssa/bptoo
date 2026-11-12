'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { X } from 'lucide-react'
import { HeraldicAchievement } from '@/components/HeraldicAchievement'
import type { ReactNodeViewProps } from '@tiptap/react'

function HeraldicView({ node, deleteNode }: ReactNodeViewProps) {
  const imageUrl = node.attrs.imageUrl as string
  return (
    <NodeViewWrapper>
      <div className="relative group" contentEditable={false}>
        {/* Editor-only delete button */}
        <button
          onClick={deleteNode}
          className="absolute top-2 right-2 z-50 p-1.5 bg-zinc-900/80 hover:bg-red-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all"
        >
          <X size={14} />
        </button>
        <HeraldicAchievement imageUrl={imageUrl} />
      </div>
    </NodeViewWrapper>
  )
}

export const HeraldicBlock = Node.create({
  name: 'heraldic',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      imageUrl: {
        default: 'https://pqaqwpclwutngudlgxzf.supabase.co/storage/v1/object/public/media/projects/stanley-heraldic.png',
        rendered: false,
        parseHTML: (el: HTMLElement | string) => {
          if (typeof el === 'string') return null
          return el.getAttribute('data-image-url')
        },
      },
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-heraldic]' }]
  },
  renderHTML({ HTMLAttributes, node }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-heraldic': '',
      'data-image-url': node.attrs.imageUrl,
    })]
  },
  addNodeView() {
    return ReactNodeViewRenderer(HeraldicView)
  },
})
