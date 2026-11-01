import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import type { Project } from '@/lib/types'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'published')
    .order('sort_order')
    .order('created_at', { ascending: false })

  const projects = (data ?? []) as Project[]

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-3">Projects</h1>
        <p className="text-zinc-400">Things I've built, launched, or am in the middle of.</p>
      </div>

      {!projects.length ? (
        <p className="text-zinc-500 text-center py-20">Projects coming soon.</p>
      ) : (
        <div className="space-y-12">
          {projects.map(p => (
            <div key={p.id} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {p.cover_image_url && (
                <Link href={`/projects/${p.slug}`} className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 group">
                  <Image src={p.cover_image_url} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </Link>
              )}
              <div className={p.cover_image_url ? '' : 'md:col-span-2'}>
                <Link href={`/projects/${p.slug}`}>
                  <h2 className="text-2xl font-bold mb-3 hover:text-violet-400 transition-colors">{p.title}</h2>
                </Link>
                {p.description && <p className="text-zinc-400 leading-relaxed mb-4">{p.description}</p>}
                <div className="flex gap-3">
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors">
                      <ExternalLink size={14} /> Visit
                    </a>
                  )}
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors">
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
