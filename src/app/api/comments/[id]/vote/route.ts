import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { voterId, vote } = body
  if (!voterId || ![-1, 1].includes(vote)) {
    return NextResponse.json({ error: 'Invalid vote' }, { status: 400 })
  }

  const supabase = await createClient()

  // Upsert vote (change existing or create new)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from('comment_votes') as any)
    .select('vote')
    .eq('comment_id', id)
    .eq('voter_id', voterId)
    .single()

  let delta = vote
  if (existing) {
    if (existing.vote === vote) {
      // Clicking same vote removes it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('comment_votes') as any)
        .delete().eq('comment_id', id).eq('voter_id', voterId)
      delta = -vote
    } else {
      // Switching vote
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('comment_votes') as any)
        .update({ vote }).eq('comment_id', id).eq('voter_id', voterId)
      delta = vote * 2 // switching adds 2 points
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('comment_votes') as any)
      .insert({ comment_id: id, voter_id: voterId, vote })
  }

  // Update vote_score on comment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: comment } = await (supabase.from('comments') as any)
    .select('vote_score').eq('id', id).single()

  const newScore = (comment?.vote_score ?? 0) + delta
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('comments') as any)
    .update({ vote_score: newScore }).eq('id', id)

  return NextResponse.json({ score: newScore })
}
