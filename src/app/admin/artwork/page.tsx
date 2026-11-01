import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import type { Artwork } from '@/lib/types'

export default async function AdminArtworkPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('artwork').select('*').order('sort_order').order('created_at', { ascending: false })
  const artworks = (data ?? []) as Artwork[]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Artwork</h1>
          <p className="text-zinc-400 text-sm mt-1">{artworks.length} pieces</p>
        </div>
        <Link href="/admin/artwork/new" className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add artwork
        </Link>
      </div>
      {!artworks.length ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="mb-4">No artwork yet.</p>
          <Link href="/admin/artwork/new" className="text-violet-400 hover:text-violet-300">Upload your first piece →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {artworks.map(a => (
            <Link key={a.id} href={`/admin/artwork/${a.id}`} className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-800 hover:border-violet-500 transition-colors">
              <Image src={a.image_url} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <div>
                  <p className="text-sm font-medium text-white truncate">{a.title}</p>
                  {a.medium && <p className="text-xs text-zinc-400">{a.medium}</p>}
                </div>
                <div className="absolute top-2 right-2">
                  <div className={`w-2 h-2 rounded-full ${a.status === 'published' ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
