import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import ContentRenderer from '@/components/ContentRenderer'
import CommentsSection from '@/components/CommentsSection'

export const revalidate = 60

export default async function ProjectStagePage({
  params,
}: {
  params: Promise<{ slug: string; order: string }>
}) {
  const { slug, order } = await params
  const orderNum = parseInt(order)
  if (isNaN(orderNum)) notFound()

  const supabase = await createClient()

  const [projectRes, stageRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('projects') as any).select('id, title, slug, cover_image_url, status').eq('slug', slug).single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('project_stages') as any)
      .select('*')
      .eq('order_num', orderNum)
      .single(),
  ])

  if (!projectRes.data || projectRes.data.status !== 'published') notFound()
  const project = projectRes.data as { id: string; title: string; slug: string; cover_image_url: string | null }

  // Re-fetch stage joined to this project
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: stageData } = await (supabase.from('project_stages') as any)
    .select('*').eq('project_id', project.id).eq('order_num', orderNum).single()

  if (!stageData) notFound()
  const stage = stageData as {
    id: string; title: string; order_num: number; date: string | null;
    content: string | null; cover_image_url: string | null; hours_spent: number | null
  }

  // Fetch prev/next stages + total count
  const [prevRes, nextRes, countRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('project_stages') as any).select('order_num, title').eq('project_id', project.id).eq('order_num', orderNum - 1).maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('project_stages') as any).select('order_num, title').eq('project_id', project.id).eq('order_num', orderNum + 1).maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('project_stages') as any).select('id', { count: 'exact', head: true }).eq('project_id', project.id),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prevStage = (prevRes.data ?? null) as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nextStage = (nextRes.data ?? null) as any
  const stageTotal = countRes.count ?? 0

  const coverImage = stage.cover_image_url || project.cover_image_url

  return (
    <article className="max-w-2xl mx-auto">
      {/* Back to project */}
      <Link href={`/projects/${slug}`}
        className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={14} /> {project.title}
      </Link>

      {/* Stage header */}
      <div className="mb-8">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-2">
          Stage {stage.order_num}{stageTotal > 0 ? ` of ${stageTotal}` : ''}
        </p>
        <h1 className="text-3xl text-white leading-tight mb-3" style={{ fontFamily: 'Peralta, serif' }}>
          {stage.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-white/40 text-sm">
          {stage.date && (
            <span className="flex items-center gap-1.5">
              <Calendar size={12} /> {format(new Date(stage.date), 'MMMM d, yyyy')}
            </span>
          )}
          {stage.hours_spent && (
            <span className="flex items-center gap-1.5">
              <Clock size={12} /> {stage.hours_spent}h on this stage
            </span>
          )}
        </div>
      </div>

      {/* Cover image */}
      {coverImage && (
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 bg-white/5">
          <Image src={coverImage} alt={stage.title} fill className="object-cover" priority />
        </div>
      )}

      {/* Content */}
      {stage.content && (
        <ContentRenderer
          html={stage.content}
          className="prose prose-invert prose-zinc max-w-none
            prose-headings:font-bold
            prose-a:text-[#FACD40] prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl"
        />
      )}

      {/* Stage navigation */}
      <nav className="mt-16 pt-8 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4">
          {prevStage ? (
            <Link href={`/projects/${slug}/stage/${prevStage.order_num}`}
              className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <span className="flex items-center gap-1.5 text-xs text-white/30 uppercase tracking-wider mb-2">
                <ArrowLeft size={11} /> Stage {prevStage.order_num}
              </span>
              <p className="text-sm text-white/80 group-hover:text-white transition-colors leading-snug">{prevStage.title}</p>
            </Link>
          ) : (
            <Link href={`/projects/${slug}`}
              className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <span className="flex items-center gap-1.5 text-xs text-white/30 uppercase tracking-wider mb-2">
                <ArrowLeft size={11} /> Overview
              </span>
              <p className="text-sm text-white/80 group-hover:text-white transition-colors leading-snug">{project.title}</p>
            </Link>
          )}
          {nextStage ? (
            <Link href={`/projects/${slug}/stage/${nextStage.order_num}`}
              className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-right">
              <span className="flex items-center gap-1.5 text-xs text-white/30 uppercase tracking-wider mb-2 justify-end">
                Stage {nextStage.order_num} <ArrowRight size={11} />
              </span>
              <p className="text-sm text-white/80 group-hover:text-white transition-colors leading-snug">{nextStage.title}</p>
            </Link>
          ) : <div />}
        </div>
      </nav>

      <div className="mt-16">
        <CommentsSection contentType="project" contentSlug={`${slug}-stage-${orderNum}`} />
      </div>
    </article>
  )
}
