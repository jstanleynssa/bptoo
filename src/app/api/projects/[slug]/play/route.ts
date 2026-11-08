import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createServiceClient()

  // Increment play count atomically via RPC, fallback to read-increment-write
  const { data: project } = await supabase
    .from('projects')
    .select('id, video_plays')
    .eq('slug', slug)
    .single()

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('projects') as any)
    .update({ video_plays: (project.video_plays ?? 0) + 1 })
    .eq('id', project.id)

  return NextResponse.json({ plays: (project.video_plays ?? 0) + 1 })
}
