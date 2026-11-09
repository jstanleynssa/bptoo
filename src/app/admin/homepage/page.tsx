'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { Save, Loader2 } from 'lucide-react'

// Load editor client-side only
const Editor = dynamic(() => import('@/components/admin/Editor'), { ssr: false })

interface Block {
  id: number
  label: string
  heading: string
  body_html: string
}

function BlockEditor({ block, onSave }: { block: Block; onSave: (b: Block) => Promise<void> }) {
  const [label, setLabel] = useState(block.label)
  const [heading, setHeading] = useState(block.heading)
  const [body, setBody] = useState(block.body_html)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  async function save() {
    setSaving(true)
    await onSave({ ...block, label, heading, body_html: body })
    setDirty(false)
    setSaving(false)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Block {block.id}</span>
        <button
          onClick={save}
          disabled={saving || !dirty}
          className="flex items-center gap-2 px-4 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Save
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Label <span className="normal-case text-zinc-700">(small uppercase text above heading)</span></label>
          <input
            type="text"
            value={label}
            onChange={e => { setLabel(e.target.value); setDirty(true) }}
            className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Heading</label>
          <input
            type="text"
            value={heading}
            onChange={e => { setHeading(e.target.value); setDirty(true) }}
            className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Body</label>
          <Editor
            content={body}
            onChange={html => { setBody(html); setDirty(true) }}
            placeholder="Write the block content…"
          />
        </div>
      </div>
    </div>
  )
}

export default function HomepagePage() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('homepage_blocks') as any).select('*').order('id')
    setBlocks(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function saveBlock(block: Block) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('homepage_blocks') as any)
      .update({ label: block.label, heading: block.heading, body_html: block.body_html, updated_at: new Date().toISOString() })
      .eq('id', block.id)
    if (error) toast.error(error.message)
    else toast.success(`Block ${block.id} saved`)
    setBlocks(prev => prev.map(b => b.id === block.id ? block : b))
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Homepage Blocks</h1>
        <p className="text-zinc-400 text-sm mt-1">Edit the three content sections on the homepage. Changes go live immediately.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-500">
          <Loader2 size={18} className="animate-spin mr-2" /> Loading…
        </div>
      ) : (
        <div className="space-y-6">
          {blocks.map(block => (
            <BlockEditor key={block.id} block={block} onSave={saveBlock} />
          ))}
        </div>
      )}
    </div>
  )
}
