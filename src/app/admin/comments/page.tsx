export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase/server'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import DeleteCommentButton from './DeleteCommentButton'

export default async function AdminCommentsPage() {
  const supabase = await createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: comments } = await (supabase.from('comments') as any)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const rows = (comments ?? []) as {
    id: string; content_type: string; content_slug: string; parent_id: string | null
    author_name: string; author_email: string; body: string
    vote_score: number; is_deleted: boolean; created_at: string
  }[]

  const liveCount = rows.filter(r => !r.is_deleted).length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Comments</h1>
        <p className="text-zinc-400 text-sm mt-1">{liveCount} live · {rows.length} total</p>
      </div>

      {rows.length === 0 ? (
        <p className="text-zinc-500 text-center py-16">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map(c => (
            <div key={c.id}
              className={`p-4 bg-zinc-900 border rounded-xl transition-colors ${c.is_deleted ? 'border-zinc-800 opacity-50' : 'border-zinc-800 hover:border-zinc-700'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm">{c.is_deleted ? '[removed]' : c.author_name}</span>
                    {!c.is_deleted && <span className="text-xs text-zinc-500">{c.author_email}</span>}
                    <span className="text-xs text-zinc-600">
                      on <Link
                        href={`/${c.content_type === 'post' ? 'blog' : 'projects'}/${c.content_slug}`}
                        target="_blank"
                        className="text-violet-400 hover:text-violet-300">
                        {c.content_slug}
                      </Link>
                    </span>
                    {c.parent_id && <span className="text-xs text-zinc-600 italic">reply</span>}
                    <span className={`text-xs px-1.5 py-0.5 rounded ${c.vote_score > 0 ? 'bg-emerald-900/40 text-emerald-400' : c.vote_score < 0 ? 'bg-red-900/40 text-red-400' : 'bg-zinc-800 text-zinc-500'}`}>
                      {c.vote_score > 0 ? '+' : ''}{c.vote_score}
                    </span>
                    <span className="text-xs text-zinc-600">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">{c.body}</p>
                </div>
                {!c.is_deleted && <DeleteCommentButton id={c.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
