'use client'

import { useEditor, EditorContent, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { ScreenplayBlock } from '@/components/admin/extensions/ScreenplayBlock'
import { HeraldicBlock } from '@/components/admin/extensions/HeraldicBlock'
import { VideoEmbedNode } from '@/components/admin/extensions/VideoEmbed'
import { ImageGridNode } from '@/components/admin/extensions/ImageGrid'
import { FigureNode } from '@/components/admin/extensions/FigureNode'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import {
  Bold, Italic, Strikethrough, Code, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Link as LinkIcon,
  Undo, Redo, Code2, Film, Images, Clapperboard,
  Table as TableIcon, RowsIcon, Columns3, Trash2, ImagePlus, Shield,
} from 'lucide-react'
import { useCallback } from 'react'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-violet-600 text-white'
          : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
      }`}
    >
      {children}
    </button>
  )
}

export default function Editor({ content, onChange, placeholder = 'Write something…' }: EditorProps) {
  const editor = useEditor({
    immediatelyRender: false,  // prevents empty-HTML flash on SSR mount
    extensions: [
      StarterKit,
      ScreenplayBlock,
        HeraldicBlock,
      VideoEmbedNode,
      ImageGridNode,
      FigureNode,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-violet-400 underline' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      // Guard: don't overwrite real content with an empty-mount flash
      if (html && html !== '<p></p>') onChange(html)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-zinc max-w-none min-h-[400px] focus:outline-none p-5',
      },
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  // Reactively check if cursor is inside a table — updates on every selection change
  const isInTable = useEditorState({
    editor,
    selector: ({ editor: e }) => e?.can().deleteTable() ?? false,
  })

  if (!editor) return null

  return (
    <div className="border border-zinc-700 rounded-xl bg-zinc-900">
      {/* Row 1 — text formatting */}
      <div className="flex flex-wrap gap-0.5 p-2 border-b border-zinc-700 bg-zinc-800 rounded-t-xl">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code"><Code size={15} /></ToolbarButton>
        <div className="w-px bg-zinc-700 mx-1 self-stretch" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 size={15} /></ToolbarButton>
        <div className="w-px bg-zinc-700 mx-1 self-stretch" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list"><List size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list"><ListOrdered size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block"><Code2 size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Divider"><Minus size={15} /></ToolbarButton>
        <div className="w-px bg-zinc-700 mx-1 self-stretch" />
        <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Link"><LinkIcon size={15} /></ToolbarButton>
        <div className="w-px bg-zinc-700 mx-1 self-stretch" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo"><Undo size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo"><Redo size={15} /></ToolbarButton>
      </div>

      {/* Row 2 — insert blocks */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-zinc-700 bg-zinc-900">
        <span className="text-[10px] text-zinc-600 uppercase tracking-wide mr-1">Insert:</span>
        <ToolbarButton onClick={() => editor.chain().focus().insertContent({ type: 'figure', attrs: { src: '', caption: '' } }).run()} active={false} title="Image with caption"><ImagePlus size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().insertContent({ type: 'imageGrid', attrs: { srcs: [], cols: 2 } }).run()} active={false} title="Image grid"><Images size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().insertContent({ type: 'videoEmbed', attrs: { src: '' } }).run()} active={false} title="Video embed"><Film size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().insertContent({ type: 'screenplayBlock', attrs: { lines: [{ id: Date.now().toString(), type: 'scene', text: '' }] } }).run()} active={false} title="Screenplay block"><Clapperboard size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().insertContent({ type: 'heraldic', attrs: { imageUrl: 'https://pqaqwpclwutngudlgxzf.supabase.co/storage/v1/object/public/media/projects/stanley-heraldic.png' } }).run()} active={false} title="Heraldic achievement"><Shield size={15} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} active={false} title="Table"><TableIcon size={15} /></ToolbarButton>
        {isInTable && (
          <>
            <div className="w-px bg-zinc-700 mx-1 self-stretch" />
            <span className="text-[10px] text-zinc-600 uppercase tracking-wide mr-0.5">Table:</span>
            <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} active={false} title="Add row"><RowsIcon size={15} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteRow().run()} active={false} title="Delete row"><Trash2 size={12} className="rotate-90" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()} active={false} title="Add column"><Columns3 size={15} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteColumn().run()} active={false} title="Delete column"><Trash2 size={12} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} active={false} title="Delete table"><Trash2 size={15} /></ToolbarButton>
          </>
        )}
      </div>

      {/* Editor content — scrolls internally so toolbar stays visible */}
      <div style={{ minHeight: '400px', maxHeight: '70vh', overflowY: 'auto' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
