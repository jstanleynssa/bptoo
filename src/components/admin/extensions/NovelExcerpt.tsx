'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { useState, useEffect, useRef } from 'react'
import { X, BookOpen } from 'lucide-react'
import type { ReactNodeViewProps } from '@tiptap/react'

const NOVEL_FONT = "'EB Garamond', Garamond, 'Times New Roman', Georgia, serif"

function NovelExcerptView({ node, updateAttributes, deleteNode, view, getPos }: ReactNodeViewProps) {
  const [bookTitle,     setBookTitle]     = useState<string>(() => (node.attrs.bookTitle     as string) || '')
  const [chapterTitle,  setChapterTitle]  = useState<string>(() => (node.attrs.chapterTitle  as string) || '')
  const [locationLines, setLocationLines] = useState<string>(() => (node.attrs.locationLines as string) || '')
  const [body,          setBody]          = useState<string>(() => (node.attrs.body          as string) || '')
  const [pageNumber,    setPageNumber]    = useState<string>(() => (node.attrs.pageNumber    as string) || '')
  const bodyRef      = useRef<HTMLTextAreaElement>(null)
  const locationRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setBookTitle((node.attrs.bookTitle       as string) || '') }, [node.attrs.bookTitle])
  useEffect(() => { setChapterTitle((node.attrs.chapterTitle as string) || '') }, [node.attrs.chapterTitle])
  useEffect(() => { setLocationLines((node.attrs.locationLines as string) || '') }, [node.attrs.locationLines])
  useEffect(() => { setBody((node.attrs.body                 as string) || '') }, [node.attrs.body])
  useEffect(() => { setPageNumber((node.attrs.pageNumber     as string) || '') }, [node.attrs.pageNumber])

  // Auto-resize textareas after content loads
  useEffect(() => {
    [bodyRef, locationRef].forEach(ref => {
      const el = ref.current
      if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
    })
  }, [body, locationLines])

  function persist(attrs: Record<string, unknown>) {
    const pos = typeof getPos === 'function' ? getPos() : undefined
    if (typeof pos === 'number' && view) {
      view.dispatch(view.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs }))
    } else {
      updateAttributes(attrs)
    }
  }

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  return (
    <NodeViewWrapper>
      {/* Load EB Garamond */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&display=swap');`}</style>

      <div className="my-8 rounded-xl border border-zinc-200 overflow-hidden" contentEditable={false}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 border-b border-zinc-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <BookOpen size={12} /> Novel Excerpt
          </div>
          <button onClick={deleteNode} className="p-0.5 text-zinc-400 hover:text-red-500 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Book page */}
        <div className="bg-white px-16 py-10" style={{ fontFamily: NOVEL_FONT, color: '#1a1a1a', maxWidth: '680px', margin: '0 auto' }}>

          {/* Running head — italic small-caps centered */}
          <div className="text-center mb-14">
            <input type="text" value={bookTitle}
              onChange={e => { setBookTitle(e.target.value); persist({ bookTitle: e.target.value }) }}
              placeholder="BOOK TITLE"
              className="w-full text-center bg-transparent border-0 outline-none"
              style={{ fontFamily: NOVEL_FONT, fontSize: '11px', letterSpacing: '0.15em', fontStyle: 'italic', color: '#999' }} />
          </div>

          {/* Chapter title — bold right-aligned */}
          <div className="text-right mb-20">
            <input type="text" value={chapterTitle}
              onChange={e => { setChapterTitle(e.target.value); persist({ chapterTitle: e.target.value }) }}
              placeholder="chapter title"
              className="w-full text-right bg-transparent border-0 outline-none"
              style={{ fontFamily: NOVEL_FONT, fontSize: '26px', fontWeight: 700, color: '#1a1a1a' }} />
          </div>

          {/* Location block — left-aligned, 3 lines */}
          <div className="mb-10">
            <textarea ref={locationRef} value={locationLines}
              onChange={e => { setLocationLines(e.target.value); persist({ locationLines: e.target.value }) }}
              onInput={e => autoResize(e.currentTarget)}
              placeholder={"Location\nRegion\nSeason, Year"}
              className="w-full bg-transparent border-0 outline-none resize-none overflow-hidden"
              style={{ fontFamily: NOVEL_FONT, fontSize: '14px', lineHeight: '1.65', color: '#1a1a1a' }}
              rows={3} />
          </div>

          {/* Body text */}
          <div className="mb-10">
            <textarea ref={bodyRef} value={body}
              onChange={e => { setBody(e.target.value); persist({ body: e.target.value }) }}
              onInput={e => autoResize(e.currentTarget)}
              placeholder="Begin your excerpt here. Separate paragraphs with a blank line. The first paragraph will display with a drop cap on the live page."
              className="w-full bg-transparent border-0 outline-none resize-none overflow-hidden"
              style={{ fontFamily: NOVEL_FONT, fontSize: '14px', lineHeight: '1.7', textAlign: 'justify', color: '#1a1a1a' }}
              rows={8} />
          </div>

          {/* Page number */}
          <div className="text-center pt-4 border-t border-zinc-100">
            <input type="text" value={pageNumber}
              onChange={e => { setPageNumber(e.target.value); persist({ pageNumber: e.target.value }) }}
              placeholder="1"
              className="text-center bg-transparent border-0 outline-none w-16"
              style={{ fontFamily: NOVEL_FONT, fontSize: '13px', color: '#888' }} />
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export const NovelExcerptNode = Node.create({
  name: 'novelExcerpt',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      bookTitle:     { default: '', rendered: false, parseHTML: (el: HTMLElement | string) => typeof el === 'string' ? null : (el.getAttribute('data-book-title') ?? null) },
      chapterTitle:  { default: '', rendered: false, parseHTML: (el: HTMLElement | string) => typeof el === 'string' ? null : (el.getAttribute('data-chapter-title') ?? null) },
      locationLines: { default: '', rendered: false, parseHTML: (el: HTMLElement | string) => typeof el === 'string' ? null : (el.getAttribute('data-location-lines') ?? null) },
      body:          { default: '', rendered: false, parseHTML: (el: HTMLElement | string) => typeof el === 'string' ? null : (el.getAttribute('data-body') ?? null) },
      pageNumber:    { default: '', rendered: false, parseHTML: (el: HTMLElement | string) => typeof el === 'string' ? null : (el.getAttribute('data-page-number') ?? null) },
    }
  },
  parseHTML() { return [{ tag: 'div[data-novel-excerpt]' }] },
  renderHTML({ HTMLAttributes, node }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-novel-excerpt': '',
      'data-book-title':     node.attrs.bookTitle,
      'data-chapter-title':  node.attrs.chapterTitle,
      'data-location-lines': node.attrs.locationLines,
      'data-body':           node.attrs.body,
      'data-page-number':    node.attrs.pageNumber,
    })]
  },
  addNodeView() { return ReactNodeViewRenderer(NovelExcerptView) },
})
