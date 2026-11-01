import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ArrowRight } from 'lucide-react'
import type { Post, Project, Artwork, Category } from '@/lib/types'

type PostRow = Post & { categories: Pick<Category, 'name' | 'color'> | null }

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: postsData }, { data: projectsData }, { data: artworkData }] = await Promise.all([
    supabase.from('posts').select('id, title, slug, excerpt, cover_image_url, published_at, categories(name, color)')
      .eq('status', 'published').order('published_at', { ascending: false }).limit(4),
    supabase.from('projects').select('id, title, slug, description, cover_image_url')
      .eq('status', 'published').eq('featured', true).order('sort_order').limit(3),
    supabase.from('artwork').select('id, title, slug, image_url, medium, year')
      .eq('status', 'published').eq('featured', true).order('sort_order').limit(6),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentPosts = (postsData ?? []) as any as PostRow[]
  const featuredProjects = (projectsData ?? []) as Project[]
  const featuredArtwork = (artworkData ?? []) as Artwork[]

  return (
    <div className="space-y-24">
      {/* Hero */}
      <section>
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
            Ideas, art, and the creative chaos of a{' '}
            <span className="text-violet-400">bipolar mind</span>.
          </h1>
          <p className="text-zinc-400 text-xl leading-relaxed">
            I'm Jason. I have bipolar 2, and I've spent a long time learning that it's not something to hide —
            it's something to understand. This is where I share the projects, writing, and art that come out of that.
          </p>
          <div className="flex gap-4 mt-8">
            <Link href="/about" className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors">
              About me
            </Link>
            <Link href="/blog" className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors">
              Read the blog
            </Link>
          </div>
        </div>
      </section>

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Recent writing</h2>
            <Link href="/blog" className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors">
              All posts <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentPosts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                {post.cover_image_url && (
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-zinc-900">
                    <Image src={post.cover_image_url} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div>
                  {post.categories && (
                    <span className="text-xs font-medium mb-2 block" style={{ color: post.categories.color }}>
                      {post.categories.name}
                    </span>
                  )}
                  <h3 className="font-bold text-lg group-hover:text-violet-400 transition-colors leading-snug mb-2">{post.title}</h3>
                  {post.excerpt && <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>}
                  <p className="text-zinc-600 text-xs mt-2">
                    {post.published_at ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true }) : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured projects */}
      {featuredProjects.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Projects</h2>
            <Link href="/projects" className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors">
              All projects <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredProjects.map(p => (
              <Link key={p.id} href={`/projects/${p.slug}`} className="group bg-zinc-900 border border-zinc-800 hover:border-violet-500 rounded-xl overflow-hidden transition-colors">
                {p.cover_image_url && (
                  <div className="relative aspect-video bg-zinc-800">
                    <Image src={p.cover_image_url} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold group-hover:text-violet-400 transition-colors">{p.title}</h3>
                  {p.description && <p className="text-zinc-500 text-sm mt-1 line-clamp-2">{p.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured artwork */}
      {featuredArtwork.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Artwork</h2>
            <Link href="/artwork" className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors">
              Full gallery <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featuredArtwork.map(a => (
              <Link key={a.id} href={`/artwork/${a.slug}`} className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-900">
                <Image src={a.image_url} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-sm font-medium">{a.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
