'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { X } from 'lucide-react'
import { HeraldicAchievementSVG } from '@/components/HeraldicAchievementSVG'
import type { ReactNodeViewProps } from '@tiptap/react'

const DEFAULT_SVG_URL = 'https://pqaqwpclwutngudlgxzf.supabase.co/storage/v1/object/public/media/projects/stanley-heraldic.svg'

function HeraldicView({ node, deleteNode }: ReactNodeViewProps) {
  const svgUrl = (node.attrs.svgUrl as string) || DEFAULT_SVG_URL
  return (
    <NodeViewWrapper>
      <div className="relative group" contentEditable={false}>
        <button
          onClick={deleteNode}
          className="absolute top-2 right-2 z-50 p-1.5 bg-zinc-900/80 hover:bg-red-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all"
        >
          <X size={14} />
        </button>
        <HeraldicAchievementSVG svgUrl={svgUrl} />
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
      svgUrl: {
        default: DEFAULT_SVG_URL,
        rendered: false,
        parseHTML: (el: HTMLElement | string) => {
          if (typeof el === 'string') return null
          return el.getAttribute('data-svg-url') || DEFAULT_SVG_URL
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
      'data-svg-url': node.attrs.svgUrl,
    })]
  },
  addNodeView() {
    return ReactNodeViewRenderer(HeraldicView)
  },
})
