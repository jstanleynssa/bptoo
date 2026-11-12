'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Loader2, Check } from 'lucide-react'
import Image from 'next/image'

interface MediaFile {
  created_at?: string | null
  name: string
  id: string
  publicUrl: string
  metadata: { size: number; mimetype: string }
}

interface MediaPickerProps {
  onSelect?: (url: string) => void             // single-select mode
  onSelectMultiple?: (urls: string[]) => void  // multi-select mode
  onClose: () => void
}

export default function MediaPicker({ onSelect, onSelectMultiple, onClose }: MediaPickerProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const supabase = createClient()
  const isMulti = !!onSelectMultiple

  const load = useCallback(async () => {
    const folders = ['', 'artwork', 'posts', 'projects', 'gallery', 'uploads', 'attachments', 'got-game']
    const allFiles: MediaFile[] = []
    for (const folder of folders) {
      const prefix = folder ? `${folder}/` : ''
      const { data } = await supabase.storage.from('media').list(folder, {
        limit: 200,
        sortBy: { column: 'created_at', order: 'desc' },
      })
      ;(data ?? [])
        .filter(f => f.name !== '.emptyFolderPlaceholder' && f.metadata?.mimetype?.startsWith('image/'))
        .forEach(f => {
          const path = prefix + f.name
          allFiles.push({
            ...f, id: f.id ?? path, name: path,
            publicUrl: supabase.storage.from('media').getPublicUrl(path).data.publicUrl,
            metadata: f.metadata as { size: number; mimetype: string },
          } as unknown as MediaFile)
        })
    }
    // Sort globally newest-first so recent uploads from any folder surface at the top
    allFiles.sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
      return bTime - aTime
    })
    setFiles(allFiles)
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  function toggle(url: string) {
    if (!isMulti) {
      // Single select: immediately confirm
      onSelect?.(url)
      onClose()
      return
    }
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(url)) next.delete(url)
      else next.add(url)
      return next
    })
  }

  function confirm() {
    if (isMulti) {
      onSelectMultiple?.(Array.from(selected))
      onClose()
    } else if (selected.size === 1) {
      onSelect?.(Array.from(selected)[0])
      onClose()
    }
  }

  const count = selected.size

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <h2 className="font-semibold text-white">
            Media Library
            {isMulti && <span className="ml-2 text-xs text-zinc-500 font-normal">Click to select multiple</span>}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-zinc-500">
              <Loader2 size={20} className="animate-spin mr-2" /> Loading…
            </div>
          ) : files.length === 0 ? (
            <p className="text-center py-16 text-zinc-500">No images in your media library yet.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {files.map(file => {
                const isSelected = selected.has(file.publicUrl)
                return (
                  <button key={file.id} type="button" onClick={() => toggle(file.publicUrl)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected ? 'border-violet-500 scale-95' : 'border-transparent hover:border-zinc-600'
                    }`}>
                    <Image src={file.publicUrl} alt={file.name} fill className="object-cover" sizes="140px" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-violet-600/30 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {isMulti && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-800 shrink-0">
            <span className="text-sm text-zinc-500">
              {count > 0 ? `${count} image${count > 1 ? 's' : ''} selected` : 'Click images to select them'}
            </span>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">Cancel</button>
              <button onClick={confirm} disabled={count === 0}
                className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 rounded-lg font-medium transition-colors disabled:opacity-40">
                Add {count > 0 ? count : ''} image{count !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
