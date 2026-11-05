import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import type { Post, Category } from '@/lib/types'
import ContentRenderer from '@/components/ContentRenderer'
import CommentsSection from '@/components/CommentsSection'

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
      <Link href="/blog" className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-10 transition-colors">
        <ArrowLeft size={14} /> Back to blog
      </Link>

      {post.categories && (
        <Link href={`/blog?category=${post.categories.slug}`}
          className="text-sm font-medium mb-4 block hover:opacity-80 transition-opacity"
          style={{ color: post.categories.color }}>
          {post.categories.name}
        </Link>
      )}

      <h1 className="text-4xl text-white leading-tight mb-4" style={{ fontFamily: 'Peralta, serif' }}>
        {post.title}
      </h1>

      <div className="flex flex-wrap items-center gap-3 text-white/40 text-sm mb-10">
        {post.published_at && <span>{format(new Date(post.published_at), 'MMMM d, yyyy')}</span>}
        {post.hours_spent && (
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/50">
            ⏱ {post.hours_spent % 1 === 0 ? post.hours_spent : Number(post.hours_spent).toFixed(1)}h
          </span>
        )}
      </div>

      {post.cover_image_url && (
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-12 bg-white/5">
          <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      {post.content && (
        <ContentRenderer
          html={post.content}
          className="prose prose-invert prose-zinc max-w-none
            prose-headings:font-bold
            prose-a:text-[#FACD40] prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-[#FACD40] prose-blockquote:text-white/60
            prose-code:text-[#FACD40] prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10
            prose-img:rounded-xl"
        />
      )}
      <CommentsSection contentType="post" contentSlug={slug} />
    </article>
  )
}
