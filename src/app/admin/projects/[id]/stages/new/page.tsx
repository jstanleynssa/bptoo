import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import StageForm from '@/components/admin/StageForm'

export default async function NewStagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project } = await (supabase.from('projects') as any).select('id, slug').eq('id', id).single()
  if (!project) notFound()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: stages } = await (supabase.from('project_stages') as any).select('order_num').eq('project_id', id)
  const nextOrder = stages?.length ? Math.max(...(stages as any[]).map((s: any) => s.order_num)) + 1 : 1
  return <StageForm projectId={id} projectSlug={project.slug} existingOrderNums={(stages ?? []).map((s: any) => s.order_num)}
    stage={{ project_id: id, title: '', order_num: nextOrder, date: null, content: null, cover_image_url: null, hours_spent: null }} />
}
