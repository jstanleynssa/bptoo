'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Editor from '@/components/admin/Editor'
import ImageUpload from '@/components/admin/ImageUpload'
import GalleryUpload from '@/components/admin/GalleryUpload'
import AttachmentUpload, { type Attachment } from '@/components/admin/AttachmentUpload'
import { Project } from '@/lib/types'
import slugify from 'slugify'
import { toast } from 'sonner'
import { Save, Send, Trash2, Loader2, Upload } from 'lucide-react'

const TABS = ['Overview', 'Gallery', 'Video', 'Files'] as const
type Tab = typeof TABS[number]

const STATUS_OPTIONS = [
  { value: 'scheming',  label: 'Scheming',  emoji: '🤔' },
  { value: 'building',  label: 'Building',  emoji: '🔨' },
  { value: 'paused',    label: 'Paused',    emoji: '⏸' },
  { value: 'adrift',    label: 'Adrift',    emoji: '🌊' },
  { value: 'done',      label: 'Done',      emoji: '✅' },
  { value: 'abandoned', label: 'Abandoned', emoji: '🪦' },
]

function videoEmbedUrl(url: string): string | null {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return url
}

export default function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter()
  const isNew = !project

  const [tab, setTab] = useState<Tab>('Overview')
  const [title, setTitle] = useState(project?.title ?? '')
  const [slug, setSlug] = useState(project?.slug ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [content, setContent] = useState(project?.content ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(project?.cover_image_url ?? '')
  const [url, setUrl] = useState(project?.url ?? '')
  const [githubUrl, setGithubUrl] = useState(project?.github_url ?? '')
  const [projectStatus, setProjectStatus] = useState<string>(project?.project_status ?? 'scheming')
  const [featured, setFeatured] = useState(project?.featured ?? false)
  const [status, setStatus] = useState<'draft' | 'published'>(project?.status ?? 'draft')
  const [galleryImages, setGalleryImages] = useState<string[]>(project?.images ?? [])
  const [videoUrl, setVideoUrl] = useState(project?.video_url ?? '')
  const [attachments, setAttachments] = useState<Attachment[]>((project?.attachments as Attachment[]) ?? [])
  const [saving, setSaving] = useState(false)
  const [videoUploading, setVideoUploading] = useState(false)
  const [hoursSpent, setHoursSpent] = useState<string>(project?.hours_spent?.toString() ?? '')

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
      project_status: projectStatus || null,
      hours_spent: hoursSpent ? parseFloat(hoursSpent) : null,
      images: galleryImages,
      video_url: videoUrl || null,
      attachments,
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

  const embedUrl = videoEmbedUrl(videoUrl)

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
          <button type="button" onClick={() => save('draft')} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {status === 'published' ? 'Unpublish' : 'Save draft'}
          </button>
          <button type="button" onClick={() => save('published')} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {status === 'published' ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Title + slug */}
      <div className="space-y-4 mb-6">
        <input type="text" value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="Project title"
          className="w-full px-0 py-2 text-3xl font-bold bg-transparent border-0 border-b border-zinc-800 focus:border-violet-500 outline-none placeholder-zinc-700 transition-colors" />
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-sm shrink-0">bptoo.com/projects/</span>
          <input type="text" value={slug} onChange={e => setSlug(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:border-violet-500 outline-none transition-colors" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800 mb-6">
        {TABS.map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t ? 'bg-zinc-900 text-white border-b-2 border-violet-500' : 'text-zinc-500 hover:text-zinc-300'
            }`}>
            {t}
            {t === 'Gallery' && galleryImages.length > 0 && (
              <span className="ml-1.5 text-xs bg-zinc-700 text-zinc-300 rounded-full px-1.5 py-0.5">{galleryImages.length}</span>
            )}
            {t === 'Files' && attachments.length > 0 && (
              <span className="ml-1.5 text-xs bg-zinc-700 text-zinc-300 rounded-full px-1.5 py-0.5">{attachments.length}</span>
            )}
            {t === 'Video' && videoUrl && <span className="ml-1.5 text-xs text-emerald-400">✓</span>}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {tab === 'Overview' && (
          <>
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
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Project status</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(({ value, label, emoji }) => (
                  <button key={value} type="button" onClick={() => setProjectStatus(value)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                      projectStatus === value ? 'bg-violet-600 border-violet-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                    }`}>
                    {emoji} {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Hours spent <span className="text-zinc-600">(optional)</span></label>
              <div className="flex items-center gap-2">
                <input type="number" min="0" step="0.5" value={hoursSpent}
                  onChange={e => setHoursSpent(e.target.value)}
                  placeholder="e.g. 24"
                  className="w-32 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 outline-none transition-colors" />
                <span className="text-sm text-zinc-500">hours</span>
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
              <label className="block text-sm text-zinc-400 mb-2">Write-up</label>
              <Editor content={content} onChange={setContent} placeholder="Tell the story of this project…" />
            </div>
          </>
        )}

        {tab === 'Gallery' && (
          <div>
            <p className="text-sm text-zinc-500 mb-4">Upload multiple images — character designs, mood board, screenshots, photos. Displayed in a grid on the project page.</p>
            <GalleryUpload images={galleryImages} onChange={setGalleryImages} folder="projects" />
          </div>
        )}

        {tab === 'Video' && (
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Video URL</label>
            <div className="flex gap-2 mb-2">
              <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                placeholder="YouTube, Vimeo, or direct .mp4 URL"
                className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 outline-none placeholder-zinc-600 transition-colors" />
              <label className="flex items-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm text-zinc-300 cursor-pointer transition-colors whitespace-nowrap">
                {videoUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {videoUploading ? 'Uploading…' : 'Upload file'}
                <input type="file" accept="video/*" className="hidden" disabled={videoUploading}
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setVideoUploading(true)
                    const ext = file.name.split('.').pop()
                    const path = `videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
                    const supabase = createClient()
                    const { error } = await supabase.storage.from('media').upload(path, file)
                    if (error) { toast.error(error.message) }
                    else {
                      const url = supabase.storage.from('media').getPublicUrl(path).data.publicUrl
                      setVideoUrl(url)
                      toast.success('Video uploaded')
                    }
                    setVideoUploading(false)
                  }}
                />
              </label>
            </div>
            <p className="text-xs text-zinc-600">Paste a YouTube/Vimeo link, or upload an .mp4, .mov, .webm directly.</p>
            {embedUrl && (
              <div className="mt-5">
                <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-medium">Preview</p>
                {videoUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video controls className="w-full rounded-xl aspect-video bg-black">
                    <source src={embedUrl} />
                  </video>
                ) : (
                  <iframe src={embedUrl} className="w-full aspect-video rounded-xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'Files' && (
          <div>
            <p className="text-sm text-zinc-500 mb-4">Attach files — PDFs, screenplays, documents. Appear as labeled download links on the project page.</p>
            <AttachmentUpload attachments={attachments} onChange={setAttachments} />
          </div>
        )}
      </div>
    </div>
  )
}
