'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/admin/ImageUpload'
import { Artwork } from '@/lib/types'
import slugify from 'slugify'
import { toast } from 'sonner'
import { Save, Send, Trash2, Loader2 } from 'lucide-react'

const MEDIUMS = ['Digital', 'Acrylic', 'Oil', 'Watercolor', 'Pencil', 'Ink', 'Mixed Media', 'Photography', 'Other']

export default function ArtworkForm({ artwork }: { artwork?: Artwork }) {
  const router = useRouter()
  const isNew = !artwork

  const [title, setTitle] = useState(artwork?.title ?? '')
  const [slug, setSlug] = useState(artwork?.slug ?? '')
  const [description, setDescription] = useState(artwork?.description ?? '')
  const [imageUrl, setImageUrl] = useState(artwork?.image_url ?? '')
  const [medium, setMedium] = useState(artwork?.medium ?? '')
  const [year, setYear] = useState<string>(artwork?.year?.toString() ?? new Date().getFullYear().toString())
  const [featured, setFeatured] = useState(artwork?.featured ?? false)
  const [status, setStatus] = useState<'draft' | 'published'>(artwork?.status ?? 'draft')
  const [saving, setSaving] = useState(false)

  function handleTitleChange(value: string) {
    setTitle(value)
    if (isNew) setSlug(slugify(value, { lower: true, strict: true }))
  }

  async function save(newStatus?: 'draft' | 'published') {
    if (!imageUrl) { toast.error('An image is required'); return }
    setSaving(true)
    const supabase = createClient()
    const finalStatus = newStatus ?? status

    const payload = {
      title, slug,
      description: description || null,
      image_url: imageUrl,
      medium: medium || null,
      year: year ? parseInt(year) : null,
      featured,
      status: finalStatus,
    }

    let error
    if (isNew) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (supabase.from('artwork') as any).insert(payload).select().single()
      error = res.error
      if (!error && res.data) { router.push(`/admin/artwork/${res.data.id}`); toast.success('Artwork created') }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (supabase.from('artwork') as any).update(payload).eq('id', artwork.id)
      error = res.error
      if (!error) { setStatus(finalStatus); toast.success('Saved'); router.refresh() }
    }
    if (error) toast.error(error.message)
    setSaving(false)
  }

  async function handleDelete() {
    if (!artwork || !confirm('Delete this artwork?')) return
    const supabase = createClient()
    const { error } = await supabase.from('artwork').delete().eq('id', artwork.id)
    if (error) toast.error(error.message)
    else { toast.success('Deleted'); router.push('/admin/artwork') }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{isNew ? 'New artwork' : 'Edit artwork'}</h1>
          <span className={`text-sm ${status === 'published' ? 'text-emerald-400' : 'text-zinc-500'}`}>
            {status === 'published' ? '● Published' : '○ Draft'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button type="button" onClick={handleDelete} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors">
              <Trash2 size={16} />
            </button>
          )}
          <button type="button" onClick={() => save('draft')} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save draft
          </button>
          <button type="button" onClick={() => save('published')} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {status === 'published' ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Image first — it's the main thing */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Image <span className="text-red-400">*</span></label>
          <ImageUpload value={imageUrl} onChange={setImageUrl} folder="artwork" />
        </div>

        <input type="text" value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="Title"
          className="w-full px-0 py-2 text-3xl font-bold bg-transparent border-0 border-b border-zinc-800 focus:border-violet-500 outline-none placeholder-zinc-700 transition-colors" />

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="About this piece…"
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm resize-none focus:border-violet-500 outline-none placeholder-zinc-600 transition-colors" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Medium</label>
            <select value={medium} onChange={e => setMedium(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 outline-none transition-colors">
              <option value="">Select medium</option>
              {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Year</label>
            <input type="number" value={year} onChange={e => setYear(e.target.value)} min="1900" max="2100"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 outline-none transition-colors" />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="accent-violet-500 w-4 h-4" />
          <span className="text-sm text-zinc-400">Feature on homepage</span>
        </label>
      </div>
    </div>
  )
}
