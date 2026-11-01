'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/lib/types'
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import slugify from 'slugify'

const PRESET_COLORS = [
  '#8b5cf6', '#ec4899', '#3b82f6', '#f59e0b', '#10b981',
  '#ef4444', '#06b6d4', '#f97316', '#84cc16', '#a78bfa',
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [newDesc, setNewDesc] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addCategory() {
    if (!newName.trim()) return
    setSaving(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error, data } = await (supabase.from('categories') as any).insert({
      name: newName.trim(),
      slug: slugify(newName.trim(), { lower: true, strict: true }),
      color: newColor,
      description: newDesc || null,
    }).select().single()
    if (error) { toast.error(error.message) }
    else { setCategories(c => [...c, data].sort((a, b) => a.name.localeCompare(b.name))); setNewName(''); setNewDesc(''); toast.success('Category added') }
    setSaving(false)
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category? Posts using it will be uncategorized.')) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { setCategories(c => c.filter(x => x.id !== id)); toast.success('Deleted') }
  }

  if (loading) return <div className="text-zinc-500">Loading…</div>

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-zinc-400 text-sm mt-1">Organize your posts into topic buckets</p>
      </div>

      {/* Add new */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">New category</h2>
        <div className="space-y-3">
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Category name"
            onKeyDown={e => e.key === 'Enter' && addCategory()}
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm focus:border-violet-500 outline-none transition-colors" />
          <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)"
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm focus:border-violet-500 outline-none transition-colors" />
          <div>
            <label className="block text-xs text-zinc-500 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setNewColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${newColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <button onClick={addCategory} disabled={saving || !newName.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add category
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
            <div className="flex-1 min-w-0">
              <p className="font-medium">{cat.name}</p>
              {cat.description && <p className="text-zinc-500 text-sm truncate">{cat.description}</p>}
              <p className="text-zinc-600 text-xs">/{cat.slug}</p>
            </div>
            <button onClick={() => deleteCategory(cat.id)} className="p-2 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
