import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import type { Post, Category } from '@/lib/types'

type PostRow = Post & { categories: Pick<Category, 'name' | 'color' | 'slug'> | null }

export default async function BlogPage() {
  const supabase = await createClient()
  const [{ data: postsData }, { data: categoriesData }] = await Promise.all([
    supabase.from('posts').select('*, categories(name, color, slug)').eq('status', 'published').order('published_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
  ])

  const posts = (postsData ?? []) as PostRow[]
  const categories = (categoriesData ?? []) as Category[]

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-5xl text-white mb-3" style={{ fontFamily: 'Peralta, serif' }}>Blog</h1>
        <p className="text-white/50">Thoughts, ideas, and things I'm figuring out.</p>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <Link href="/blog" className="px-3 py-1 rounded-full text-sm bg-[#FACD40] text-black font-medium">All</Link>
          {categories.map(cat => (
            <Link key={cat.id} href={`/blog?category=${cat.slug}`}
              className="px-3 py-1 rounded-full text-sm border border-white/15 text-white/50 hover:border-white/40 hover:text-white transition-colors">
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {!posts.length ? (
        <p className="text-white/40 text-center py-20">Nothing published yet. Check back soon.</p>
      ) : (
        <div className="space-y-10">
          {posts.map(post => (
            <article key={post.id} className="flex gap-8 group">
              {post.cover_image_url && (
                <Link href={`/blog/${post.slug}`} className="shrink-0 w-48 aspect-video relative rounded-xl overflow-hidden bg-white/5">
                  <Image src={post.cover_image_url} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </Link>
              )}
              <div className="flex-1 min-w-0 py-1">
                {post.categories && (
                  <span className="text-xs font-medium mb-2 block" style={{ color: post.categories.color }}>
                    {post.categories.name}
                  </span>
                )}
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-xl text-white mb-2 group-hover:text-white/60 transition-colors leading-snug"
                    style={{ fontFamily: 'Peralta, serif' }}>{post.title}</h2>
                </Link>
                {post.excerpt && <p className="text-white/50 leading-relaxed line-clamp-2">{post.excerpt}</p>}
                <p className="text-white/25 text-sm mt-3">
                  {post.published_at ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true }) : ''}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
