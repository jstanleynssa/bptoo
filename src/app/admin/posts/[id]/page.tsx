import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PostForm from '@/components/admin/PostForm'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: post }, { data: categories }] = await Promise.all([
    supabase.from('posts').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('name'),
  ])

  if (!post) notFound()

  return <PostForm post={post} categories={categories ?? []} />
}
