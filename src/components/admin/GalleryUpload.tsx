'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2, Library, GripVertical } from 'lucide-react'
import Image from 'next/image'
import MediaPicker from '@/components/admin/MediaPicker'
import { toast } from 'sonner'

interface GalleryUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  folder?: string
}

export default function GalleryUpload({ images, onChange, folder = 'gallery' }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    const urls: string[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const ext = file.name.split('.').pop()
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('media').upload(path, file)
      if (error) { toast.error(file.name + ': ' + error.message); continue }
      urls.push(supabase.storage.from('media').getPublicUrl(path).data.publicUrl)
    }

    onChange([...images, ...urls])
    setUploading(false)
    if (urls.length) toast.success(`${urls.length} image${urls.length > 1 ? 's' : ''} added`)
  }

  function remove(url: string) {
    onChange(images.filter(u => u !== url))
  }

  function fromLibrary(url: string) {
    if (!images.includes(url)) onChange([...images, url])
    setPickerOpen(false)
  }

  return (
    <div>
      {/* Existing images */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {images.map(url => (
            <div key={url} className="relative group aspect-video rounded-lg overflow-hidden bg-zinc-800">
              <Image src={url} alt="" fill className="object-cover" sizes="200px" />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute top-1 right-1 p-1 bg-zinc-900/80 hover:bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-all"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add more */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-dashed border-zinc-700 hover:border-violet-500 rounded-xl text-sm text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? 'Uploading…' : 'Upload images'}
        </button>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 border border-zinc-700 hover:border-zinc-500 rounded-xl text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Library size={14} /> Browse library
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => handleFiles(e.target.files)} />

      {pickerOpen && (
        <MediaPicker onSelect={fromLibrary} onClose={() => setPickerOpen(false)} />
      )}
    </div>
  )
}
