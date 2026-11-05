import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import type { Artwork } from '@/lib/types'

export default async function ArtworkPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('artwork').select('*').eq('status', 'published').order('sort_order').order('created_at', { ascending: false })
  const artworks = (data ?? []) as Artwork[]

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-5xl text-white mb-3" style={{ fontFamily: 'Peralta, serif' }}>Artwork</h1>
        <p className="text-white/50">Things I've made with my hands and with pixels.</p>
      </div>

      {!artworks.length ? (
        <p className="text-white/40 text-center py-20">Gallery coming soon.</p>
      ) : (
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {artworks.map(a => (
            <Link key={a.id} href={`/artwork/${a.slug}`} className="group block break-inside-avoid">
              <div className="relative rounded-xl overflow-hidden bg-white/5">
                <Image src={a.image_url} alt={a.title} width={600} height={600}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div>
                    <p className="font-medium text-white">{a.title}</p>
                    {a.medium && <p className="text-white/60 text-sm">{a.medium}{a.year ? ` · ${a.year}` : ''}</p>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
