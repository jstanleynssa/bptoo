'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2, Check, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import slugify from 'slugify'
import { toast } from 'sonner'
import { compressImage } from '@/lib/compress-image'

const MEDIUMS = ['Digital', 'Acrylic', 'Oil', 'Watercolor', 'Pencil', 'Ink', 'Mixed Media', 'Photography', 'Other']

interface ImageItem {
  id: string
  file: File
  preview: string
  title: string
  url?: string        // set after upload
  uploading?: boolean
  done?: boolean
  error?: string
}

function uid() { return Math.random().toString(36).slice(2) }

export default function BatchArtworkPage() {
  const router = useRouter()
  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement>(null)

  // Shared metadata
  const [seriesName, setSeriesName] = useState('')
  const [description, setDescription] = useState('')
  const [medium, setMedium] = useState('')
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [featured, setFeatured] = useState(false)

  // Image queue
  const [images, setImages] = useState<ImageItem[]>([])
  const [submitting, setSubmitting] = useState(false)

  const addFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return
    const items: ImageItem[] = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map((file, i) => ({
        id: uid(),
        file,
        preview: URL.createObjectURL(file),
        title: '',  // filled in after series name is set
      }))
    setImages(prev => {
      const updated = [...prev, ...items]
      // Auto-generate titles based on current series name
      return updated
    })
  }, [])

  // When series name changes, regenerate empty titles
  function handleSeriesNameChange(name: string) {
    setSeriesName(name)
    setImages(prev => prev.map((img, i) => ({
      ...img,
      title: img.title === '' || img.title.match(/^.+ \d+$/) ? `${name} ${i + 1}` : img.title,
    })))
  }

  function removeImage(id: string) {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  function updateTitle(id: string, title: string) {
    setImages(prev => prev.map(img => img.id === id ? { ...img, title } : img))
  }

  async function handleSubmit() {
    if (!images.length) { toast.error('Add at least one image'); return }
    if (!seriesName.trim()) { toast.error('Series name is required'); return }
    setSubmitting(true)

    let created = 0
    let failed = 0

    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      setImages(prev => prev.map(x => x.id === img.id ? { ...x, uploading: true } : x))

      try {
        // Upload to Supabase storage
        const compressed = await compressImage(img.file)
        const ext = compressed.name.split('.').pop()
        const path = `artwork/${Date.now()}-${uid()}.${ext}`
        const { error: uploadErr } = await supabase.storage.from('media').upload(path, compressed)
        if (uploadErr) throw uploadErr

        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
        const title = img.title || `${seriesName} ${i + 1}`
        const slug = slugify(title, { lower: true, strict: true }) + '-' + uid().slice(0, 4)

        // Create artwork entry
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertErr } = await (supabase.from('artwork') as any).insert({
          title,
          slug,
          description: description || null,
          image_url: publicUrl,
          medium: medium || null,
          year: year ? parseInt(year) : null,
          featured,
          status: 'published',
          sort_order: i,
        })
        if (insertErr) throw insertErr

        setImages(prev => prev.map(x => x.id === img.id ? { ...x, uploading: false, done: true, url: publicUrl } : x))
        created++
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setImages(prev => prev.map(x => x.id === img.id ? { ...x, uploading: false, error: msg } : x))
        failed++
      }
    }

    setSubmitting(false)
    if (failed === 0) {
      toast.success(`${created} artwork${created > 1 ? 's' : ''} created`)
      router.push('/admin/artwork')
    } else {
      toast.error(`${failed} failed — ${created} succeeded`)
    }
  }

  const allDone = images.length > 0 && images.every(img => img.done)

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/artwork" className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Batch upload artwork</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Upload a set of images with shared metadata</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: shared metadata */}
        <div className="space-y-5">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Series metadata</h2>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Series name <span className="text-red-400">*</span></label>
            <input type="text" value={seriesName} onChange={e => handleSeriesNameChange(e.target.value)}
              placeholder="e.g. Hardy Boys Character Studies"
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 outline-none transition-colors" />
            <p className="text-xs text-zinc-600 mt-1">Images will be named "Series name 1", "Series name 2"…</p>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="About this series…"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm resize-none focus:border-violet-500 outline-none placeholder-zinc-600 transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Medium</label>
              <select value={medium} onChange={e => setMedium(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 outline-none transition-colors">
                <option value="">Select…</option>
                {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Year</label>
              <input type="number" value={year} onChange={e => setYear(e.target.value)} min="1900" max="2100"
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 outline-none transition-colors" />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="accent-violet-500 w-4 h-4" />
            <span className="text-sm text-zinc-400">Feature all on homepage</span>
          </label>

          {images.length > 0 && (
            <button onClick={handleSubmit} disabled={submitting || allDone}
              className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-colors disabled:opacity-50">
              {submitting
                ? <><Loader2 size={16} className="animate-spin" /> Uploading…</>
                : allDone
                  ? <><Check size={16} /> All done!</>
                  : `Create ${images.length} artwork${images.length > 1 ? 's' : ''}`}
            </button>
          )}
        </div>

        {/* Right: image queue */}
        <div>
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Images</h2>

          {/* Drop zone */}
          <div
            onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 hover:border-violet-500 rounded-xl p-6 text-center cursor-pointer transition-colors mb-4"
          >
            <Upload size={20} className="mx-auto mb-2 text-zinc-600" />
            <p className="text-sm text-zinc-500">Drop images or click to select</p>
            <p className="text-xs text-zinc-700 mt-1">Select multiple files at once</p>
          </div>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => addFiles(e.target.files)} />

          {/* Image list */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {images.map((img, i) => (
              <div key={img.id}
                className={`flex items-center gap-3 p-3 rounded-xl border ${img.error ? 'border-red-900 bg-red-950/20' : img.done ? 'border-emerald-900 bg-emerald-950/20' : 'border-zinc-800 bg-zinc-900'}`}>
                <div className="relative shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-zinc-800">
                  <Image src={img.preview} alt="" fill className="object-cover" sizes="56px" />
                  {img.uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 size={16} className="animate-spin text-white" />
                    </div>
                  )}
                  {img.done && (
                    <div className="absolute inset-0 bg-emerald-900/60 flex items-center justify-center">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={img.title || `${seriesName} ${i + 1}`}
                    onChange={e => updateTitle(img.id, e.target.value)}
                    disabled={img.uploading || img.done}
                    className="w-full bg-transparent text-sm text-zinc-300 focus:outline-none focus:text-white disabled:opacity-60"
                  />
                  {img.error && <p className="text-xs text-red-400 mt-0.5">{img.error}</p>}
                </div>
                {!img.uploading && !img.done && (
                  <button onClick={() => removeImage(img.id)} className="shrink-0 p-1 text-zinc-600 hover:text-red-400 transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
