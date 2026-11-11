import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Soft delete — keep thread intact, body replaced with [removed]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('comments') as any)
    .update({ is_deleted: true, body: '[removed]', author_name: '[removed]' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
