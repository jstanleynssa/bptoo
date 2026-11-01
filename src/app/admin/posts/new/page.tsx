import { createClient } from '@/lib/supabase/server'
import PostForm from '@/components/admin/PostForm'

export default async function NewPostPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')
  return <PostForm categories={categories ?? []} />
}
