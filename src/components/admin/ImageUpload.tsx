'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2, Library } from 'lucide-react'
import Image from 'next/image'
import MediaPicker from '@/components/admin/MediaPicker'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  bucket?: string
  folder?: string
}

export default function ImageUpload({
  value,
  onChange,
  bucket = 'media',
  folder = 'uploads',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB')
      return
    }

    setUploading(true)
    setError(null)

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: false })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    onChange(data.publicUrl)
    setUploading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-zinc-700 group">
          <div className="relative aspect-video">
            <Image src={value} alt="Cover image" fill className="object-cover" />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-red-600 rounded-lg transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 hover:border-violet-500 rounded-xl p-8 text-center cursor-pointer transition-colors group"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-zinc-400">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-sm">Uploading…</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-500 group-hover:text-zinc-400 transition-colors">
                <Upload size={24} />
                <span className="text-sm">Drop image here or click to upload</span>
                <span className="text-xs">PNG, JPG, GIF, WebP — max 10MB</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2 text-sm text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-colors"
          >
            <Library size={14} /> Browse library
          </button>
        </div>
      )}
      {pickerOpen && (
        <MediaPicker
          onSelect={url => { onChange(url); setPickerOpen(false) }}
          onClose={() => setPickerOpen(false)}
        />
      )}
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
