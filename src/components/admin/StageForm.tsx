'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { Save, Loader2, Trash2 } from 'lucide-react'
import ImageUpload from '@/components/admin/ImageUpload'

const Editor = dynamic(() => import('@/components/admin/Editor'), { ssr: false })

interface Stage {
  id?: string
  project_id: string
  title: string
  order_num: number
  date: string | null
  content: string | null
  cover_image_url: string | null
  hours_spent: number | null
}

interface StageFormProps {
  stage?: Stage
  projectId: string
  projectSlug: string
  existingOrderNums?: number[]
}

export default function StageForm({ stage, projectId, projectSlug, existingOrderNums = [] }: StageFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState(stage?.title ?? '')
  const [orderNum, setOrderNum] = useState<string>(stage?.order_num?.toString() ?? '1')
  const [date, setDate] = useState(stage?.date ?? '')
  const [content, setContent] = useState(stage?.content ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(stage?.cover_image_url ?? '')
  const [hoursSpent, setHoursSpent] = useState(stage?.hours_spent?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleContent = useCallback((html: string) => setContent(html), [])

  async function save() {
    if (!title.trim()) { toast.error('Title is required'); return }
    setSaving(true)

    const payload = {
      project_id: projectId,
      title: title.trim(),
      order_num: parseInt(orderNum) || 1,
      date: date || null,
      content: content || null,
      cover_image_url: coverImageUrl || null,
      hours_spent: hoursSpent ? parseFloat(hoursSpent) : null,
      updated_at: new Date().toISOString(),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = stage?.id
      ? await (supabase.from('project_stages') as any).update(payload).eq('id', stage.id)
      : await (supabase.from('project_stages') as any).insert(payload)

    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Stage saved')
    router.push(`/admin/projects/${projectId}/stages`)
    router.refresh()
  }

  async function deleteStage() {
    if (!stage?.id || !confirm('Delete this stage? This cannot be undone.')) return
    setDeleting(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('project_stages') as any).delete().eq('id', stage.id)
    toast.success('Stage deleted')
    router.push(`/admin/projects/${projectId}/stages`)
    router.refresh()
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{stage?.id ? 'Edit Stage' : 'New Stage'}</h1>
          <p className="text-zinc-400 text-sm mt-1">
            <a href={`/admin/projects/${projectId}/stages`} className="hover:text-white transition-colors">← Back to stages</a>
          </p>
        </div>
        <div className="flex gap-2">
          {stage?.id && (
            <button onClick={deleteStage} disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-900/40 hover:bg-red-900/70 rounded-xl text-sm text-red-300 transition-colors disabled:opacity-40">
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete
            </button>
          )}
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-medium transition-colors disabled:opacity-40">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
          </button>
        </div>
      </div>

      {/* Title + meta */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Stage Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Foundation Work"
            className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 outline-none" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Stage #</label>
            <input type="number" value={orderNum} onChange={e => setOrderNum(e.target.value)}
              min="1"
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Hours Spent</label>
            <input type="number" value={hoursSpent} onChange={e => setHoursSpent(e.target.value)}
              placeholder="0" step="0.5"
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 outline-none" />
          </div>
        </div>
      </div>

      {/* Cover image */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <label className="block text-xs text-zinc-500 mb-3 uppercase tracking-wider">Cover Image</label>
        <ImageUpload value={coverImageUrl} onChange={setCoverImageUrl} folder="projects" />
      </div>

      {/* Write-up */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Write-up</span>
        </div>
        <div className="p-4">
          <Editor content={content} onChange={handleContent} placeholder="Document this stage of the project…" />
        </div>
      </div>
    </div>
  )
}
