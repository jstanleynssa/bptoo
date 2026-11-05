import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import type { Project } from '@/lib/types'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('projects').select('*').eq('status', 'published').order('sort_order').order('created_at', { ascending: false })
  const projects = (data ?? []) as Project[]

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-5xl text-white mb-3" style={{ fontFamily: 'Peralta, serif' }}>Projects</h1>
        <p className="text-white/50">Things I've built, launched, or am in the middle of.</p>
      </div>

      {!projects.length ? (
        <p className="text-white/40 text-center py-20">Projects coming soon.</p>
      ) : (
        <div className="space-y-12">
          {projects.map(p => (
            <div key={p.id} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {p.cover_image_url && (
                <Link href={`/projects/${p.slug}`} className="relative aspect-video rounded-2xl overflow-hidden bg-white/5 group">
                  <Image src={p.cover_image_url} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </Link>
              )}
              <div className={p.cover_image_url ? '' : 'md:col-span-2'}>
                <Link href={`/projects/${p.slug}`}>
                  <h2 className="text-2xl text-white mb-3 hover:text-white/60 transition-colors"
                    style={{ fontFamily: 'Peralta, serif' }}>{p.title}</h2>
                </Link>
                {p.description && <p className="text-white/60 leading-relaxed mb-4">{p.description}</p>}
                <div className="flex gap-3">
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
                      <ExternalLink size={14} /> Visit
                    </a>
                  )}
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
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
