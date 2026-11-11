'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Copy, Trash2, Loader2, Check, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { compressImage } from '@/lib/compress-image'
import Image from 'next/image'

interface MediaFile {
  name: string
  id: string
  updated_at: string
  created_at: string
  last_accessed_at: string
  metadata: { size: number; mimetype: string }
  publicUrl: string
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    
    // List root + all known subfolders to find every file in the bucket
    const folders = ['', 'artwork', 'posts', 'projects', 'gallery', 'uploads', 'attachments', 'videos', 'got-game']
    const allFiles: MediaFile[] = []
    
    for (const folder of folders) {
      const prefix = folder ? `${folder}/` : ''
      const { data } = await supabase.storage.from('media').list(folder, {
        limit: 200,
        sortBy: { column: 'created_at', order: 'desc' },
      })
      ;(data ?? [])
        .filter(f => f.name !== '.emptyFolderPlaceholder' && f.metadata)
        .forEach(f => {
          const path = prefix + f.name
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          allFiles.push({ ...f, id: f.id ?? path, name: path, publicUrl: supabase.storage.from('media').getPublicUrl(path).data.publicUrl, metadata: f.metadata as { size: number; mimetype: string } } as MediaFile)
        })
    }
    
    // Sort newest first across all folders
    allFiles.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    setFiles(allFiles)
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function handleUpload(fileList: FileList | null) {
    if (!fileList?.length) return
    setUploading(true)

    const uploads = Array.from(fileList).map(async file => {
      const fileToUpload = file.type.startsWith('image/') ? await compressImage(file) : file
      const ext = fileToUpload.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('media').upload(path, fileToUpload)
      if (error) toast.error(`${file.name}: ${error.message}`)
    })

    await Promise.all(uploads)
    setUploading(false)
    await load()
    toast.success(`${fileList.length} file${fileList.length > 1 ? 's' : ''} uploaded`)
  }

  async function handleDelete(name: string) {
    if (!confirm(`Delete "${name}"? This will break any content that uses it.`)) return
    setDeleting(name)
    const { error } = await supabase.storage.from('media').remove([name])
    if (error) { toast.error(error.message) }
    else { setFiles(f => f.filter(x => x.name !== name)); toast.success('Deleted') }
    setDeleting(null)
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url)
    setCopied(url)
    toast.success('URL copied')
    setTimeout(() => setCopied(null), 2000)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    handleUpload(e.dataTransfer.files)
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-zinc-400 text-sm mt-1">{files.length} files · Supabase Storage</p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input ref={inputRef} type="file" accept="image/*,video/*" multiple className="hidden"
          onChange={e => handleUpload(e.target.files)} />
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="mb-8 border-2 border-dashed border-zinc-800 hover:border-violet-500 rounded-xl p-6 text-center cursor-pointer transition-colors"
      >
        <Upload size={20} className="mx-auto mb-2 text-zinc-600" />
        <p className="text-sm text-zinc-500">Drop files here or click to upload</p>
        <p className="text-xs text-zinc-700 mt-1">Images, videos — any format</p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-500">
          <Loader2 size={20} className="animate-spin mr-2" /> Loading…
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <ImageIcon size={32} className="mx-auto mb-3 opacity-40" />
          <p>No files yet. Upload something to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {files.map(file => (
            <div key={file.id} className="group relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">
              {/* Preview */}
              <div className="relative aspect-square bg-zinc-950">
                {file.metadata.mimetype?.startsWith('image/') ? (
                  <Image
                    src={file.publicUrl}
                    alt={file.name}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                    <ImageIcon size={32} />
                  </div>
                )}
              </div>

              {/* Info + actions */}
              <div className="p-2">
                <p className="text-xs text-zinc-400 truncate mb-1.5" title={file.name}>{file.name}</p>
                <p className="text-xs text-zinc-700 mb-2">{formatSize(file.metadata.size)}</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => copyUrl(file.publicUrl)}
                    className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs transition-colors"
                    title="Copy URL"
                  >
                    {copied === file.publicUrl ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    {copied === file.publicUrl ? 'Copied' : 'Copy URL'}
                  </button>
                  <button
                    onClick={() => handleDelete(file.name)}
                    disabled={deleting === file.name}
                    className="p-1 rounded-lg bg-zinc-800 hover:bg-red-900 text-zinc-500 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    {deleting === file.name ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
