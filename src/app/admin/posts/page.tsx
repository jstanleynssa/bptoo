export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Post, Category } from '@/lib/types'

type PostRow = Post & { categories: Pick<Category, 'name' | 'color'> | null }

export default async function AdminPostsPage() {
  const supabase = await createServiceClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('*, categories(name, color)')
    .order('updated_at', { ascending: false })

  const rows = (posts ?? []) as PostRow[]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-zinc-400 text-sm mt-1">{rows.length} total</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New post
        </Link>
      </div>

      {!rows.length ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="mb-4">No posts yet.</p>
          <Link href="/admin/posts/new" className="text-violet-400 hover:text-violet-300">
            Write your first post →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(post => (
            <div
              key={post.id}
              className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${post.status === 'published' ? 'bg-emerald-400' : 'bg-zinc-600'}`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium truncate">{post.title}</span>
                  {post.categories && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                      style={{ backgroundColor: `${post.categories.color}22`, color: post.categories.color }}
                    >
                      {post.categories.name}
                    </span>
                  )}
                </div>
                <p className="text-zinc-500 text-sm mt-0.5">
                  {post.status === 'published' ? (
                    <span className="text-emerald-500">Published</span>
                  ) : (
                    <span>Draft</span>
                  )}
                  {' · '}
                  Updated {formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {post.status === 'published' && (
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="p-2 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                    title="View post"
                  >
                    <Eye size={15} />
                  </Link>
                )}
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <Edit size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
