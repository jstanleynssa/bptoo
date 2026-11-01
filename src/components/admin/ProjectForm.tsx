'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Editor from '@/components/admin/Editor'
import ImageUpload from '@/components/admin/ImageUpload'
import { Project } from '@/lib/types'
import slugify from 'slugify'
import { toast } from 'sonner'
import { Save, Send, Trash2, Loader2 } from 'lucide-react'

export default function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter()
  const isNew = !project

  const [title, setTitle] = useState(project?.title ?? '')
  const [slug, setSlug] = useState(project?.slug ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [content, setContent] = useState(project?.content ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(project?.cover_image_url ?? '')
  const [url, setUrl] = useState(project?.url ?? '')
  const [githubUrl, setGithubUrl] = useState(project?.github_url ?? '')
  const [featured, setFeatured] = useState(project?.featured ?? false)
  const [status, setStatus] = useState<'draft' | 'published'>(project?.status ?? 'draft')
  const [saving, setSaving] = useState(false)

  function handleTitleChange(value: string) {
    setTitle(value)
    if (isNew) setSlug(slugify(value, { lower: true, strict: true }))
  }

  async function save(newStatus?: 'draft' | 'published') {
    setSaving(true)
    const supabase = createClient()
    const finalStatus = newStatus ?? status

    const payload = {
      title, slug,
      description: description || null,
      content: content || null,
      cover_image_url: coverImageUrl || null,
      url: url || null,
      github_url: githubUrl || null,
      featured,
      status: finalStatus,
    }

    let error
    if (isNew) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (supabase.from('projects') as any).insert(payload).select().single()
      error = res.error
      if (!error && res.data) { router.push(`/admin/projects/${res.data.id}`); toast.success('Project created') }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (supabase.from('projects') as any).update(payload).eq('id', project.id)
      error = res.error
      if (!error) { setStatus(finalStatus); toast.success('Saved'); router.refresh() }
    }
    if (error) toast.error(error.message)
    setSaving(false)
  }

  async function handleDelete() {
    if (!project || !confirm('Delete this project?')) return
    const supabase = createClient()
    const { error } = await supabase.from('projects').delete().eq('id', project.id)
    if (error) toast.error(error.message)
    else { toast.success('Deleted'); router.push('/admin/projects') }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{isNew ? 'New project' : 'Edit project'}</h1>
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
        <input type="text" value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="Project title"
          className="w-full px-0 py-2 text-3xl font-bold bg-transparent border-0 border-b border-zinc-800 focus:border-violet-500 outline-none placeholder-zinc-700 transition-colors" />

        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-sm shrink-0">bptoo.com/projects/</span>
          <input type="text" value={slug} onChange={e => setSlug(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:border-violet-500 outline-none transition-colors" />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Short description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="One-liner about the project"
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm resize-none focus:border-violet-500 outline-none placeholder-zinc-600 transition-colors" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Live URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">GitHub URL</label>
            <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 outline-none transition-colors" />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="accent-violet-500 w-4 h-4" />
          <span className="text-sm text-zinc-400">Feature on homepage</span>
        </label>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Cover image</label>
          <ImageUpload value={coverImageUrl} onChange={setCoverImageUrl} folder="projects" />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Description / write-up</label>
          <Editor content={content} onChange={setContent} placeholder="Tell the story of this project…" />
        </div>
      </div>
    </div>
  )
}
