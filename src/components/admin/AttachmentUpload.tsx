'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export interface Attachment {
  name: string
  url: string
  type: string  // e.g. 'pdf', 'doc', 'video', 'other'
}

interface AttachmentUploadProps {
  attachments: Attachment[]
  onChange: (attachments: Attachment[]) => void
}

const FILE_ICONS: Record<string, string> = {
  pdf: '📄',
  doc: '📝',
  docx: '📝',
  mp4: '🎬',
  mov: '🎬',
  zip: '📦',
}

function getType(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? 'other'
}

function getIcon(type: string): string {
  return FILE_ICONS[type] ?? '📎'
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

export default function AttachmentUpload({ attachments, onChange }: AttachmentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    const newAttachments: Attachment[] = []

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop() ?? 'bin'
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `attachments/${Date.now()}-${safeName}`
      const { error } = await supabase.storage.from('media').upload(path, file)
      if (error) { toast.error(file.name + ': ' + error.message); continue }
      const url = supabase.storage.from('media').getPublicUrl(path).data.publicUrl
      newAttachments.push({ name: file.name, url, type: getType(file.name) })
    }

    onChange([...attachments, ...newAttachments])
    setUploading(false)
    if (newAttachments.length) toast.success(`${newAttachments.length} file${newAttachments.length > 1 ? 's' : ''} attached`)
  }

  function remove(url: string) {
    onChange(attachments.filter(a => a.url !== url))
  }

  function rename(url: string, name: string) {
    onChange(attachments.map(a => a.url === url ? { ...a, name } : a))
  }

  return (
    <div>
      {/* Existing attachments */}
      {attachments.length > 0 && (
        <div className="space-y-2 mb-3">
          {attachments.map(att => (
            <div key={att.url} className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
              <span className="text-xl shrink-0">{getIcon(att.type)}</span>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={att.name}
                  onChange={e => rename(att.url, e.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-none focus:text-white text-zinc-300"
                  title="Click to rename"
                />
                <p className="text-xs text-zinc-600 uppercase">{att.type}</p>
              </div>
              <a href={att.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-zinc-500 hover:text-zinc-300 shrink-0">View</a>
              <button type="button" onClick={() => remove(att.url)}
                className="p-1 text-zinc-600 hover:text-red-400 transition-colors shrink-0">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-zinc-700 hover:border-violet-500 rounded-xl text-sm text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {uploading ? 'Uploading…' : 'Attach files (PDF, video, doc…)'}
      </button>

      <input ref={inputRef} type="file" multiple className="hidden"
        onChange={e => handleFiles(e.target.files)} />
    </div>
  )
}
