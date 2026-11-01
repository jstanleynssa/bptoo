import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ArtworkForm from '@/components/admin/ArtworkForm'

export default async function EditArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: artwork } = await supabase.from('artwork').select('*').eq('id', id).single()
  if (!artwork) notFound()
  return <ArtworkForm artwork={artwork} />
}
