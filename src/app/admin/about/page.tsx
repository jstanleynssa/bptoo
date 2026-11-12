'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { Save, Loader2 } from 'lucide-react'

const Editor = dynamic(() => import('@/components/admin/Editor'), { ssr: false })

interface AboutBlock {
  id: number
  label: string
  heading: string
  body_html: string
  sort_order: number
}

function BlockEditor({ block, onSave }: { block: AboutBlock; onSave: (b: AboutBlock) => Promise<void> }) {
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
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
          {block.label || `Block ${block.id}`}
        </span>
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
        {heading !== undefined && (
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Section Heading</label>
            <input
              type="text"
              value={heading}
              onChange={e => { setHeading(e.target.value); setDirty(true) }}
              placeholder="Leave blank for the intro block"
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 outline-none transition-colors"
            />
          </div>
        )}
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Content</label>
          <Editor
            content={body}
            onChange={html => { setBody(html); setDirty(true) }}
            placeholder="Write content…"
          />
        </div>
      </div>
    </div>
  )
}

export default function AboutAdminPage() {
  const [blocks, setBlocks] = useState<AboutBlock[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('about_blocks') as any).select('*').order('sort_order')
    setBlocks(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function saveBlock(block: AboutBlock) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('about_blocks') as any)
      .update({ label: block.label, heading: block.heading, body_html: block.body_html, updated_at: new Date().toISOString() })
      .eq('id', block.id)
    if (error) toast.error(error.message)
    else toast.success('Saved')
    setBlocks(prev => prev.map(b => b.id === block.id ? block : b))
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">About Page</h1>
        <p className="text-zinc-400 text-sm mt-1">Edit your about page content. Changes go live immediately after saving.</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-500">
          <Loader2 size={18} className="animate-spin mr-2" /> Loading…
        </div>
      ) : blocks.length === 0 ? (
        <div className="text-zinc-500 text-sm">No blocks found. Run the SQL migration in Supabase to seed content.</div>
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
