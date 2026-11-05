'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Loader2, Check } from 'lucide-react'
import Image from 'next/image'

interface MediaFile {
  name: string
  id: string
  publicUrl: string
  metadata: { size: number; mimetype: string }
}

interface MediaPickerProps {
  onSelect: (url: string) => void
  onClose: () => void
}

export default function MediaPicker({ onSelect, onClose }: MediaPickerProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const supabase = createClient()

  const load = useCallback(async () => {
    const { data } = await supabase.storage.from('media').list('', {
      limit: 200,
      sortBy: { column: 'created_at', order: 'desc' },
    })
    const withUrls = (data ?? [])
      .filter(f => f.name !== '.emptyFolderPlaceholder' && f.metadata?.mimetype?.startsWith('image/'))
      .map(f => ({
        ...f,
        publicUrl: supabase.storage.from('media').getPublicUrl(f.name).data.publicUrl,
        metadata: f.metadata as { size: number; mimetype: string },
      })) as MediaFile[]
    setFiles(withUrls)
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function confirm() {
    if (selected) { onSelect(selected); onClose() }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <h2 className="font-semibold text-white">Media Library</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-zinc-500">
              <Loader2 size={20} className="animate-spin mr-2" /> Loading…
            </div>
          ) : files.length === 0 ? (
            <p className="text-center py-16 text-zinc-500">No images in your media library yet.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {files.map(file => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => setSelected(file.publicUrl === selected ? null : file.publicUrl)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selected === file.publicUrl
                      ? 'border-violet-500 scale-95'
                      : 'border-transparent hover:border-zinc-600'
                  }`}
                >
                  <Image src={file.publicUrl} alt={file.name} fill className="object-cover" sizes="140px" />
                  {selected === file.publicUrl && (
                    <div className="absolute inset-0 bg-violet-600/30 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-800 shrink-0">
          <span className="text-sm text-zinc-500">
            {selected ? '1 selected' : 'Click an image to select it'}
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onClick={confirm}
              disabled={!selected}
              className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Use image
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
