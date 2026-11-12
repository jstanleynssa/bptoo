'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { X, Plus } from 'lucide-react'

type LineType = 'scene' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition'

interface ScreenplayLine {
  id: string
  type: LineType
  text: string
}

const LINE_CYCLE: LineType[] = ['action', 'scene', 'character', 'dialogue', 'parenthetical', 'transition']

const LINE_CONFIG: Record<LineType, {
  label: string
  style: React.CSSProperties
  placeholder: string
  transform?: (s: string) => string
}> = {
  scene: {
    label: 'Scene',
    placeholder: 'INT. LOCATION - DAY',
    transform: s => s.toUpperCase(),
    style: { fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' },
  },
  action: {
    label: 'Action',
    placeholder: 'Action description…',
    style: { marginBottom: '0.25rem' },
  },
  character: {
    label: 'Character',
    placeholder: 'CHARACTER NAME',
    transform: s => s.toUpperCase(),
    style: { marginLeft: '37%', textTransform: 'uppercase', fontWeight: 600, marginBottom: 0 },
  },
  dialogue: {
    label: 'Dialogue',
    placeholder: 'What they say…',
    style: { marginLeft: '20%', marginRight: '15%', marginBottom: '0.25rem' },
  },
  parenthetical: {
    label: 'Paren',
    placeholder: '(beat)',
    style: { marginLeft: '28%', marginRight: '25%', fontStyle: 'italic', marginBottom: 0 },
  },
  transition: {
    label: 'Trans',
    placeholder: 'CUT TO:',
    transform: s => s.toUpperCase(),
    style: { textAlign: 'right', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' },
  },
}

function uid() { return Math.random().toString(36).slice(2) }

function parseLines(raw: unknown): ScreenplayLine[] {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : [{ id: uid(), type: 'scene' as LineType, text: '' }]
  } catch {
    return [{ id: uid(), type: 'scene' as LineType, text: '' }]
  }
}

import type { ReactNodeViewProps } from '@tiptap/react'
function ScreenplayView({ node, updateAttributes, deleteNode, view, getPos }: ReactNodeViewProps) {
  // Local state — same pattern as ImageGrid to handle Tiptap v3 atom node re-render issues
  const [lines, setLines] = useState<ScreenplayLine[]>(() => parseLines(node.attrs.lines))
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const refs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  // Sync inward on undo/redo
  useEffect(() => { setLines(parseLines(node.attrs.lines)) }, [node.attrs.lines])

  // Auto-resize all textareas after lines load
  useEffect(() => {
    Object.values(refs.current).forEach(el => {
      if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
    })
  }, [lines])

  function persist(newLines: ScreenplayLine[]) {
    // Direct dispatch — bypasses selection-based updateAttributes global command
    const pos = typeof getPos === 'function' ? getPos() : undefined
    if (typeof pos === 'number' && view) {
      view.dispatch(view.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, lines: newLines }))
    } else {
      updateAttributes({ lines: newLines })
    }
  }

  function update(newLines: ScreenplayLine[]) {
    setLines(newLines)
    persist(newLines)
  }

  function setLine(id: string, text: string) {
    update(lines.map(l => l.id === id ? { ...l, text } : l))
  }

  function setType(id: string, type: LineType) {
    update(lines.map(l => l.id === id ? { ...l, type } : l))
  }

  function addLine(afterId: string, type: LineType = 'action') {
    const idx = lines.findIndex(l => l.id === afterId)
    const newLine: ScreenplayLine = { id: uid(), type, text: '' }
    const newLines = [...lines.slice(0, idx + 1), newLine, ...lines.slice(idx + 1)]
    update(newLines)
    setTimeout(() => refs.current[newLine.id]?.focus(), 20)
  }

  function removeLine(id: string) {
    if (lines.length === 1) { deleteNode(); return }
    const idx = lines.findIndex(l => l.id === id)
    const newLines = lines.filter(l => l.id !== id)
    update(newLines)
    const focusIdx = Math.max(0, idx - 1)
    setTimeout(() => refs.current[newLines[focusIdx]?.id]?.focus(), 20)
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>, line: ScreenplayLine) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const next: Record<LineType, LineType> = {
        scene: 'action', action: 'action', character: 'dialogue',
        dialogue: 'character', parenthetical: 'dialogue', transition: 'scene',
      }
      addLine(line.id, next[line.type])
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const idx = LINE_CYCLE.indexOf(line.type)
      const nextType = LINE_CYCLE[(idx + 1) % LINE_CYCLE.length]
      setType(line.id, nextType)
    }
    if (e.key === 'Backspace' && line.text === '') {
      e.preventDefault()
      removeLine(line.id)
    }
  }

  return (
    <NodeViewWrapper>
      <div
        className="my-6 rounded-xl border border-zinc-200 bg-[#FEFDF8] overflow-hidden"
        style={{ fontFamily: '"Courier Prime", monospace', fontSize: '13px', lineHeight: '1.6', color: '#1a1a1a' }}
        contentEditable={false}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 border-b border-zinc-200">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Screenplay</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">Tab = cycle type · Enter = new line · Shift+Enter = break</span>
            <button onClick={deleteNode} className="p-0.5 text-zinc-400 hover:text-red-500 transition-colors"><X size={14} /></button>
          </div>
        </div>

        {/* Lines */}
        <div className="px-10 py-6">
          {lines.map(line => {
            const cfg = LINE_CONFIG[line.type]
            return (
              <div key={line.id} className="relative group flex gap-2" style={{ minHeight: '1.6em' }}>
                {/* Type badge */}
                {focusedId === line.id && (
                  <div className="absolute -left-8 top-0.5">
                    <select
                      value={line.type}
                      onChange={e => setType(line.id, e.target.value as LineType)}
                      className="text-[10px] text-zinc-400 bg-transparent border-0 outline-none cursor-pointer"
                      title="Line type"
                    >
                      {LINE_CYCLE.map(t => (
                        <option key={t} value={t}>{LINE_CONFIG[t].label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Text input */}
                <textarea
                  ref={el => { refs.current[line.id] = el }}
                  value={line.text}
                  placeholder={focusedId === line.id ? cfg.placeholder : ''}
                  onFocus={() => setFocusedId(line.id)}
                  onBlur={() => setFocusedId(null)}
                  onChange={e => setLine(line.id, e.target.value)}
                  onKeyDown={e => onKeyDown(e, line)}
                  onInput={e => {
                    const el = e.currentTarget
                    el.style.height = 'auto'
                    el.style.height = el.scrollHeight + 'px'
                  }}
                  rows={1}
                  className="w-full bg-transparent border-0 outline-none resize-none overflow-hidden placeholder-zinc-300"
                  style={{
                    ...cfg.style,
                    fontFamily: '"Courier Prime", monospace',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    color: '#1a1a1a',
                    height: 'auto',
                  }}
                />
              </div>
            )
          })}

          {/* Add line */}
          <button
            onClick={() => addLine(lines[lines.length - 1].id)}
            className="mt-2 flex items-center gap-1 text-xs text-zinc-300 hover:text-zinc-500 transition-colors"
          >
            <Plus size={12} /> Add line
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export const ScreenplayBlock = Node.create({
  name: 'screenplayBlock',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      // rendered: false → new saves won't get corrupted lines="" attr.
      // parseHTML reads data-lines explicitly — overrides the fallback that reads
      // the corrupted legacy lines="[object Object],..." attr in existing saved HTML.
      lines: {
        default: [{ id: 'initial', type: 'scene', text: '' }],
        rendered: false,
        parseHTML: (el: HTMLElement | string) => {
          if (typeof el === 'string') return null
          const raw = el.getAttribute('data-lines')
          if (!raw) return null
          try { return JSON.parse(raw) } catch { return null }
        },
      },
    }
  },
  parseHTML() {
    return [{
      tag: 'div[data-screenplay]',
      getAttrs: (dom: HTMLElement | string) => {
        if (typeof dom === 'string') return {}
        return { lines: JSON.parse(dom.getAttribute('data-lines') || '[]') }
      },
    }]
  },
  renderHTML({ HTMLAttributes, node }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-screenplay': '',
      'data-lines': JSON.stringify(node.attrs.lines),
    })]
  },
  addNodeView() {
    return ReactNodeViewRenderer(ScreenplayView)
  },
})
