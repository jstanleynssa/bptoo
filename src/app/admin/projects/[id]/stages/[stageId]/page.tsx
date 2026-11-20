import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import StageForm from '@/components/admin/StageForm'

export default async function EditStagePage({ params }: { params: Promise<{ id: string; stageId: string }> }) {
  const { id, stageId } = await params
  const supabase = await createClient()
  const [projectRes, stageRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('projects') as any).select('id, slug').eq('id', id).single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('project_stages') as any).select('*').eq('id', stageId).eq('project_id', id).single(),
  ])
  if (!projectRes.data || !stageRes.data) notFound()
  return <StageForm projectId={id} projectSlug={projectRes.data.slug} stage={stageRes.data} />
}
