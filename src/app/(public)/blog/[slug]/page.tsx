import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import type { Post, Category } from '@/lib/types'

type PostRow = Post & { categories: Pick<Category, 'name' | 'color' | 'slug'> | null }

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('posts')
    .select('*, categories(name, color, slug)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!data) notFound()
  const post = data as PostRow

  return (
    <article className="max-w-2xl mx-auto">
      <Link href="/blog" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-10 transition-colors">
        <ArrowLeft size={14} /> Back to blog
      </Link>

      {post.categories && (
        <Link
          href={`/blog?category=${post.categories.slug}`}
          className="text-sm font-medium mb-4 block hover:opacity-80 transition-opacity"
          style={{ color: post.categories.color }}
        >
          {post.categories.name}
        </Link>
      )}

      <h1 className="text-4xl font-bold leading-tight mb-4">{post.title}</h1>

      <p className="text-zinc-500 text-sm mb-10">
        {post.published_at ? format(new Date(post.published_at), 'MMMM d, yyyy') : ''}
      </p>

      {post.cover_image_url && (
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-12 bg-zinc-900">
          <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      {post.content && (
        <div
          className="prose prose-invert prose-zinc max-w-none
            prose-headings:font-bold
            prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-violet-500 prose-blockquote:text-zinc-400
            prose-code:text-violet-300 prose-code:bg-zinc-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800
            prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      )}
    </article>
  )
}
