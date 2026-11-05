'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function DeleteCommentButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Remove this comment? It will show as [removed] but keep the thread.')) return
    setLoading(true)
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Comment removed'); router.refresh() }
    else toast.error('Failed to remove')
    setLoading(false)
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      className="shrink-0 p-1.5 text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-50">
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </button>
  )
}
