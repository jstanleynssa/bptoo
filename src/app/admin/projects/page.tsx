import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Project } from '@/lib/types'

export default async function AdminProjectsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('projects').select('*').order('sort_order').order('updated_at', { ascending: false })
  const projects = (data ?? []) as Project[]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-zinc-400 text-sm mt-1">{projects.length} total</p>
        </div>
        <Link href="/admin/projects/new" className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> New project
        </Link>
      </div>
      {!projects.length ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="mb-4">No projects yet.</p>
          <Link href="/admin/projects/new" className="text-violet-400 hover:text-violet-300">Add your first project →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map(p => (
            <div key={p.id} className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
              <div className={`w-2 h-2 rounded-full shrink-0 ${p.status === 'published' ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{p.title}</span>
                  {p.featured && <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">Featured</span>}
                </div>
                <p className="text-zinc-500 text-sm mt-0.5">
                  {p.status === 'published' ? <span className="text-emerald-500">Published</span> : <span>Draft</span>}
                  {' · '}Updated {formatDistanceToNow(new Date(p.updated_at), { addSuffix: true })}
                </p>
              </div>
              <Link href={`/admin/projects/${p.id}`} className="p-2 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors">
                <Edit size={15} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
