import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, Folder, Image, Plus } from 'lucide-react'

async function getCounts(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [posts, projects, artwork] = await Promise.all([
    supabase.from('posts').select('id, status'),
    supabase.from('projects').select('id, status'),
    supabase.from('artwork').select('id, status'),
  ])

  const count = (rows: { status: string }[] | null, status?: string) =>
    (rows || []).filter(r => !status || r.status === status).length

  return {
    posts: { total: count(posts.data), published: count(posts.data, 'published'), draft: count(posts.data, 'draft') },
    projects: { total: count(projects.data), published: count(projects.data, 'published'), draft: count(projects.data, 'draft') },
    artwork: { total: count(artwork.data), published: count(artwork.data, 'published'), draft: count(artwork.data, 'draft') },
  }
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const counts = await getCounts(supabase)

  const cards = [
    { label: 'Posts', icon: FileText, href: '/admin/posts', newHref: '/admin/posts/new', ...counts.posts },
    { label: 'Projects', icon: Folder, href: '/admin/projects', newHref: '/admin/projects/new', ...counts.projects },
    { label: 'Artwork', icon: Image, href: '/admin/artwork', newHref: '/admin/artwork/new', ...counts.artwork },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">Welcome back. Here's what's going on.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {cards.map(({ label, icon: Icon, href, newHref, total, published, draft }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-zinc-300">
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </div>
              <Link
                href={newHref}
                className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                <Plus size={13} /> New
              </Link>
            </div>
            <div className="text-3xl font-bold mb-3">{total}</div>
            <div className="flex gap-4 text-sm">
              <span className="text-emerald-400">{published} published</span>
              <span className="text-zinc-500">{draft} draft</span>
            </div>
            <Link
              href={href}
              className="mt-4 block text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              View all →
            </Link>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">Quick create</h2>
        <div className="flex gap-3 flex-wrap">
          {cards.map(({ label, newHref, icon: Icon }) => (
            <Link
              key={label}
              href={newHref}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm hover:border-violet-500 hover:text-violet-300 transition-colors"
            >
              <Plus size={14} />
              New {label.slice(0, -1)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
