import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Plus, Pencil } from 'lucide-react'
import { format } from 'date-fns'

export default async function ProjectStagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [projectRes, stagesRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('projects') as any).select('id, title, slug').eq('id', id).single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('project_stages') as any).select('id, title, order_num, date, hours_spent').eq('project_id', id).order('order_num'),
  ])

  if (!projectRes.data) notFound()
  const project = projectRes.data as { id: string; title: string; slug: string }
  const stages = (stagesRes.data ?? []) as { id: string; title: string; order_num: number; date: string | null; hours_spent: number | null }[]

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-zinc-500 mb-1">
            <Link href={`/admin/projects/${id}`} className="hover:text-white transition-colors">← {project.title}</Link>
          </p>
          <h1 className="text-2xl font-bold">Stages</h1>
        </div>
        <Link href={`/admin/projects/${id}/stages/new`}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-medium transition-colors">
          <Plus size={14} /> Add Stage
        </Link>
      </div>

      {stages.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="mb-4">No stages yet.</p>
          <Link href={`/admin/projects/${id}/stages/new`} className="text-violet-400 hover:text-violet-300 transition-colors">Add the first stage →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {stages.map(s => (
            <Link key={s.id} href={`/admin/projects/${id}/stages/${s.id}`}
              className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors group">
              <div>
                <span className="text-xs text-zinc-500 mr-3">Stage {s.order_num}</span>
                <span className="text-sm text-white">{s.title}</span>
                {s.date && <span className="text-xs text-zinc-500 ml-3">{format(new Date(s.date), 'MMM d, yyyy')}</span>}
                {s.hours_spent && <span className="text-xs text-zinc-600 ml-2">· {s.hours_spent}h</span>}
              </div>
              <Pencil size={13} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
