import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Artwork } from '@/lib/types'

export const revalidate = 60

export default async function ArtworkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('artwork')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!data) notFound()
  const artwork = data as Artwork

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/artwork"
        className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> Artwork
      </Link>

      <div className="mb-6">
        <h1 className="text-4xl text-white mb-2" style={{ fontFamily: 'Peralta, serif' }}>
          {artwork.title}
        </h1>
        {(artwork.medium || artwork.year) && (
          <p className="text-white/40 text-sm">
            {[artwork.medium, artwork.year].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-white/5 mb-8">
        <Image
          src={artwork.image_url}
          alt={artwork.title}
          width={1200}
          height={1200}
          className="w-full h-auto"
          priority
        />
      </div>

      {artwork.description && (
        <p className="text-white/70 leading-relaxed">{artwork.description}</p>
      )}
    </div>
  )
}
