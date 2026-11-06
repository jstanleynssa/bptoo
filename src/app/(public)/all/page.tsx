export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import type { Post, Project, Artwork, Category } from '@/lib/types'

type PostRow = Post & { categories: Pick<Category, 'name' | 'color'> | null }

type FeedItem =
  | { kind: 'post';    date: Date; data: PostRow }
  | { kind: 'project'; date: Date; data: Project }
  | { kind: 'artwork'; date: Date; data: Artwork }

const TYPE_STYLES = {
  post:    { label: 'Post',    bg: 'bg-violet-500/20',  text: 'text-violet-300' },
  project: { label: 'Project', bg: 'bg-[#FACD40]/20',   text: 'text-[#FACD40]' },
  artwork: { label: 'Artwork', bg: 'bg-pink-500/20',    text: 'text-pink-300' },
}

export default async function AllPage() {
  const supabase = await createClient()

  const [{ data: postsData }, { data: projectsData }, { data: artworkData }] = await Promise.all([
    supabase.from('posts').select('*, categories(name, color)').eq('status', 'published'),
    supabase.from('projects').select('*').eq('status', 'published'),
    supabase.from('artwork').select('*').eq('status', 'published').eq('in_feed', true),
  ])

  const posts    = (postsData   ?? []) as PostRow[]
  const projects = (projectsData ?? []) as Project[]
  const artworks = (artworkData  ?? []) as Artwork[]

  // Merge into unified feed with dates
  const feed: FeedItem[] = [
    ...posts.map(p => ({
      kind: 'post' as const,
      date: new Date(p.published_at ?? p.created_at),
      data: p,
    })),
    ...projects.map(p => ({
      kind: 'project' as const,
      date: new Date(p.project_date ?? p.created_at),
      data: p,
    })),
    ...artworks.map(a => ({
      kind: 'artwork' as const,
      date: new Date(a.created_at),
      data: a,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-5xl text-white mb-3" style={{ fontFamily: 'Peralta, serif' }}>All</h1>
        <p className="text-white/50">Everything — posts, projects, and artwork in one place.</p>
      </div>

      {feed.length === 0 ? (
        <p className="text-white/40 text-center py-20">Nothing yet — check back soon.</p>
      ) : (
        <div className="space-y-4">
          {feed.map((item, i) => {
            const style = TYPE_STYLES[item.kind]

            if (item.kind === 'post') {
              const p = item.data
              return (
                <Link key={i} href={`/blog/${p.slug}`}
                  className="group flex gap-5 items-start p-5 bg-white/5 hover:bg-white/8 rounded-2xl transition-colors">
                  {p.cover_image_url && (
                    <div className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-white/5">
                      <Image src={p.cover_image_url} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="96px" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>{style.label}</span>
                      {p.categories && <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: p.categories.color }}>{p.categories.name}</span>}
                    </div>
                    <h2 className="text-lg text-white mb-1 leading-snug group-hover:text-white/60 transition-colors" style={{ fontFamily: 'Peralta, serif' }}>{p.title}</h2>
                    {p.excerpt && <p className="text-white/50 text-sm leading-relaxed line-clamp-2">{p.excerpt}</p>}
                    <p className="text-white/25 text-xs mt-2">{formatDistanceToNow(item.date, { addSuffix: true })}</p>
                  </div>
                </Link>
              )
            }

            if (item.kind === 'project') {
              const p = item.data
              return (
                <Link key={i} href={`/projects/${p.slug}`}
                  className="group flex gap-5 items-start p-5 bg-white/5 hover:bg-white/8 rounded-2xl transition-colors">
                  {p.cover_image_url && (
                    <div className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-white/5">
                      <Image src={p.cover_image_url} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="96px" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>{style.label}</span>
                      {p.project_status && <span className="text-[10px] text-white/40 uppercase tracking-wider">{p.project_status}</span>}
                    </div>
                    <h2 className="text-lg text-white mb-1 leading-snug group-hover:text-white/60 transition-colors" style={{ fontFamily: 'Peralta, serif' }}>{p.title}</h2>
                    {p.description && <p className="text-white/50 text-sm leading-relaxed line-clamp-2">{p.description}</p>}
                    <p className="text-white/25 text-xs mt-2">{formatDistanceToNow(item.date, { addSuffix: true })}</p>
                  </div>
                </Link>
              )
            }

            // artwork
            const a = item.data
            return (
              <Link key={i} href={`/artwork/${a.slug}`}
                className="group flex gap-5 items-start p-5 bg-white/5 hover:bg-white/8 rounded-2xl transition-colors">
                <div className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-white/5">
                  <Image src={a.image_url} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="96px" />
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>{style.label}</span>
                    {a.medium && <span className="text-[10px] text-white/40 uppercase tracking-wider">{a.medium}</span>}
                  </div>
                  <h2 className="text-lg text-white mb-1 leading-snug group-hover:text-white/60 transition-colors" style={{ fontFamily: 'Peralta, serif' }}>{a.title}</h2>
                  {a.description && <p className="text-white/50 text-sm leading-relaxed line-clamp-2">{a.description}</p>}
                  <p className="text-white/25 text-xs mt-2">{formatDistanceToNow(item.date, { addSuffix: true })}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
