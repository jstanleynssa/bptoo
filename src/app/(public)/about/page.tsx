import { createClient } from '@/lib/supabase/server'

interface AboutBlock {
  id: number
  heading: string
  body_html: string
  sort_order: number
}

export const revalidate = 60

export default async function AboutPage() {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('about_blocks') as any)
    .select('id, heading, body_html, sort_order')
    .order('sort_order')

  const blocks: AboutBlock[] = data ?? []
  const [intro, ...sections] = blocks

  return (
    <div className="max-w-2xl">
      <h1 className="text-5xl text-white mb-10 leading-tight" style={{ fontFamily: 'Peralta, serif' }}>About</h1>

      {intro && (
        <div
          className="space-y-6 text-white/70 text-lg leading-relaxed prose prose-invert prose-zinc max-w-none"
          dangerouslySetInnerHTML={{ __html: intro.body_html }}
        />
      )}

      {sections.length > 0 && (
        <div className="border-t border-white/10 mt-12 pt-10 space-y-10">
          {sections.map(block => (
            <div key={block.id}>
              {block.heading && (
                <h2 className="text-2xl text-white mb-4" style={{ fontFamily: 'Peralta, serif' }}>
                  {block.heading}
                </h2>
              )}
              <div
                className="text-white/70 leading-relaxed prose prose-invert prose-zinc max-w-none [&_a]:text-[#FACD40] [&_a:hover]:text-white [&_a]:transition-colors"
                dangerouslySetInnerHTML={{ __html: block.body_html }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
