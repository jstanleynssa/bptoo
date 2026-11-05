'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Editor from '@/components/admin/Editor'
import ImageUpload from '@/components/admin/ImageUpload'
import { Category, Post } from '@/lib/types'
import slugify from 'slugify'
import { toast } from 'sonner'
import { Save, Send, Trash2, Loader2 } from 'lucide-react'

interface PostFormProps {
  post?: Post
  categories: Category[]
}

export default function PostForm({ post, categories }: PostFormProps) {
  const router = useRouter()
  const isNew = !post

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url ?? '')
  const [categoryId, setCategoryId] = useState(post?.category_id ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(post?.status ?? 'draft')
  const [hoursSpent, setHoursSpent] = useState<string>(post?.hours_spent?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function handleTitleChange(value: string) {
    setTitle(value)
    if (isNew) {
      setSlug(slugify(value, { lower: true, strict: true }))
    }
  }

  async function save(newStatus?: 'draft' | 'published') {
    setSaving(true)
    const supabase = createClient()
    const finalStatus = newStatus ?? status

    const payload = {
      title,
      slug,
      excerpt: excerpt || null,
      content: content || null,
      cover_image_url: coverImageUrl || null,
      category_id: categoryId || null,
      hours_spent: hoursSpent ? parseFloat(hoursSpent) : null,
      status: finalStatus,
      published_at: finalStatus === 'published' && !post?.published_at ? new Date().toISOString() : post?.published_at ?? null,
    }

    let error
    if (isNew) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (supabase.from('posts') as any).insert(payload).select().single()
      error = res.error
      if (!error && res.data) {
        router.push(`/admin/posts/${res.data.id}`)
        toast.success('Post created')
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (supabase.from('posts') as any).update(payload).eq('id', post.id)
      error = res.error
      if (!error) {
        setStatus(finalStatus)
        toast.success('Post saved')
        router.refresh()
      }
    }

    if (error) toast.error(error.message)
    setSaving(false)
  }

  async function handleDelete() {
    if (!post || !confirm('Delete this post? This cannot be undone.')) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) {
      toast.error(error.message)
      setDeleting(false)
    } else {
      toast.success('Post deleted')
      router.push('/admin/posts')
    }
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{isNew ? 'New post' : 'Edit post'}</h1>
          {!isNew && (
            <span className={`text-sm mt-1 ${status === 'published' ? 'text-emerald-400' : 'text-zinc-500'}`}>
              {status === 'published' ? '● Published' : '○ Draft'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Delete post"
            >
              {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            </button>
          )}
          <button
            type="button"
            onClick={() => save('draft')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save draft
          </button>
          <button
            type="button"
            onClick={() => save('published')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {status === 'published' ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="Post title"
          className="w-full px-0 py-2 text-3xl font-bold bg-transparent border-0 border-b border-zinc-800 focus:border-violet-500 outline-none placeholder-zinc-700 transition-colors"
        />

        {/* Slug */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-sm shrink-0">bptoo.com/blog/</span>
          <input
            type="text"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder="post-slug"
            className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:border-violet-500 outline-none transition-colors"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Excerpt (optional)</label>
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="A short summary shown in post listings…"
            rows={2}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm resize-none focus:border-violet-500 outline-none placeholder-zinc-600 transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Category</label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 outline-none transition-colors"
          >
            <option value="">No category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Hours spent */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Time spent <span className="text-zinc-600">(optional)</span></label>
          <div className="flex items-center gap-2">
            <input type="number" min="0" step="0.5" value={hoursSpent}
              onChange={e => setHoursSpent(e.target.value)}
              placeholder="e.g. 3.5"
              className="w-32 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 outline-none transition-colors" />
            <span className="text-sm text-zinc-500">hours</span>
          </div>
        </div>

        {/* Cover image */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Cover image</label>
          <ImageUpload value={coverImageUrl} onChange={setCoverImageUrl} folder="posts" />
        </div>

        {/* Content editor */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Content</label>
          <Editor content={content} onChange={setContent} placeholder="Start writing…" />
        </div>
      </div>
    </div>
  )
}
