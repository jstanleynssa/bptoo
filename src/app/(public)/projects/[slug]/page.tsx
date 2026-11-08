import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Download } from 'lucide-react'
import ToolBadge from '@/components/ToolBadge'
import { format } from 'date-fns'
import ContentRenderer from '@/components/ContentRenderer'
import VideoPlayTracker from '@/components/VideoPlayTracker'
import CommentsSection from '@/components/CommentsSection'
import type { Project } from '@/lib/types'

interface Attachment { name: string; url: string; type: string }

const STATUS_LABELS: Record<string, { label: string; emoji: string }> = {
  done:      { label: 'Done',      emoji: '✅' },
  building:  { label: 'Building',  emoji: '🔨' },
  paused:    { label: 'Paused',    emoji: '⏸' },
  scheming:  { label: 'Scheming',  emoji: '🤔' },
  adrift:    { label: 'Adrift',    emoji: '🌊' },
  abandoned: { label: 'Abandoned', emoji: '🪦' },
}

const FILE_ICONS: Record<string, string> = {
  pdf: '📄', doc: '📝', docx: '📝', mp4: '🎬', mov: '🎬', zip: '📦',
}
function getIcon(type: string) { return FILE_ICONS[type] ?? '📎' }

function videoEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return url
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase.from('projects').select('*').eq('slug', slug).eq('status', 'published').single()
  if (!data) notFound()
  const project = data as Project
  const statusInfo = project.project_status ? STATUS_LABELS[project.project_status] : null
  const attachments = (project.attachments as unknown as Attachment[]) ?? []
  const gallery = project.images ?? []
  const embedUrl = project.video_url ? videoEmbedUrl(project.video_url) : null

  return (
    <article className="max-w-3xl mx-auto">
      <Link href="/projects" className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-10 transition-colors">
        <ArrowLeft size={14} /> Back to projects
      </Link>

      {/* Status + hours */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {statusInfo && (
          <span className="text-sm px-3 py-1 rounded-full bg-white/10 text-white/60">
            {statusInfo.emoji} {statusInfo.label}
          </span>
        )}
        {project.hours_spent && (
          <span className="text-sm px-3 py-1 rounded-full bg-white/10 text-white/60">
            ⏱ {project.hours_spent % 1 === 0 ? project.hours_spent : Number(project.hours_spent).toFixed(1)}h invested
          </span>
        )}
        {project.project_date && (
          <span className="text-sm px-3 py-1 rounded-full bg-white/10 text-white/60">
            {format(new Date(project.project_date), 'MMMM yyyy')}
          </span>
        )}
      </div>

      <h1 className="text-4xl text-white mb-4 leading-tight" style={{ fontFamily: 'Peralta, serif' }}>
        {project.title}
      </h1>
      {project.description && <p className="text-xl text-white/60 leading-relaxed mb-6">{project.description}</p>}

      {/* Play counter — always show when project has any video */}
      {(project.video_url || project.content?.includes('video-embed')) && (
        <div className="mb-4">
          <span className="text-sm text-white/40">▶ {(project.video_plays ?? 0).toLocaleString()} {project.video_plays === 1 ? 'play' : 'plays'}</span>
        </div>
      )}

      {/* Tools used */}
      {project.tools?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {project.tools.map(t => <ToolBadge key={t} toolId={t} />)}
        </div>
      )}

      {(project.url || project.github_url) && (
        <div className="flex gap-3 mb-10">
          {project.url && (
            <a href={project.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#FACD40] text-black rounded-lg text-sm font-medium hover:bg-[#FACD40]/80 transition-colors">
              <ExternalLink size={14} /> Visit
            </a>
          )}
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
              GitHub
            </a>
          )}
        </div>
      )}

      {project.cover_image_url && (
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-12 bg-white/5">
          <Image src={project.cover_image_url} alt={project.title} fill className="object-cover" priority />
        </div>
      )}

      {project.content && (
        <ContentRenderer
          html={project.content}
          videoPlaySlug={project.slug}
          className="prose prose-invert prose-zinc max-w-none mb-16
            prose-headings:font-bold
            prose-a:text-[#FACD40] prose-a:no-underline hover:prose-a:underline
            prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-img:rounded-xl"
        />
      )}

      {embedUrl && (
        <section className="mb-16">
          <h2 className="text-2xl text-white mb-5" style={{ fontFamily: 'Peralta, serif' }}>Video</h2>
          {project.video_url?.match(/\.(mp4|webm|ogg)$/i) ? (
            <VideoPlayTracker slug={project.slug}>
              <video controls className="w-full rounded-2xl aspect-video bg-black"><source src={embedUrl} /></video>
            </VideoPlayTracker>
          ) : (
            <iframe src={embedUrl} className="w-full aspect-video rounded-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          )}
        </section>
      )}

      {gallery.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl text-white mb-5" style={{ fontFamily: 'Peralta, serif' }}>Gallery</h2>
          <div className="grid grid-cols-2 gap-3">
            {gallery.map((src, i) => (
              <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-white/5">
                <Image src={src} alt={`${project.title} — ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="400px" />
              </div>
            ))}
          </div>
        </section>
      )}

      {attachments.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl text-white mb-5" style={{ fontFamily: 'Peralta, serif' }}>Downloads</h2>
          <div className="space-y-2">
            {attachments.map(att => (
              <a key={att.url} href={att.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
                <span className="text-2xl">{getIcon(att.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{att.name}</p>
                  <p className="text-xs text-white/30 uppercase">{att.type}</p>
                </div>
                <Download size={16} className="text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </section>
      )}
      <CommentsSection contentType="project" contentSlug={slug} />
    </article>
  )
}
