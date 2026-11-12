import { createClient } from '@/lib/supabase/server'

interface AboutBlock {
  id: number
  heading: string
  body_html: string
  sort_order: number
}

const FALLBACK_BLOCKS: AboutBlock[] = [
  {
    id: 1, heading: '', sort_order: 1,
    body_html: '<p>Hey — I'm Jason. I'm an entrepreneur, builder, and creative based in North Carolina. I have bipolar 2, and I've spent a long time going from ashamed of that fact to genuinely proud of how it shapes the way I think and create.</p><p>Bipolar 2 gets talked about mostly in terms of what it takes from people. I want to talk about what it gives: an ability to make connections others may miss, to get genuinely obsessed with ideas, to feel things deeply enough to make work that means something.</p><p>This site is where I share the output. That means blog posts about ideas I'm chewing on, projects I'm building, and art I'm making. The through-line is authenticity — I'm not performing wellness or pretending I've figured everything out. I'm just making things and being honest about the process.</p>',
  },
  {
    id: 2, heading: 'My grown up job', sort_order: 2,
    body_html: '<p>I run the <a href="https://arpinstitute.com/" target="_blank" rel="noopener noreferrer">Advanced Retirement Planning Institute</a>, a professional education platform for financial advisors.</p><p>I build courses and software, develop business strategy, manage operations, marketing, and everything in between.</p>',
  },
  {
    id: 3, heading: 'bptoo', sort_order: 3,
    body_html: '<p>The domain name is a bit of a wink. "BP too" — bipolar too, bipolar 2, and also just "me too" in a small way. A nod to everyone else who's living with this thing and figuring it out as they go.</p>',
  },
]

export const revalidate = 60

export default async function AboutPage() {
  let blocks: AboutBlock[] = FALLBACK_BLOCKS

  try {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('about_blocks') as any)
      .select('id, heading, body_html, sort_order')
      .order('sort_order')
    if (!error && data && data.length > 0) blocks = data
  } catch {
    // Table not yet created — use fallback content
  }

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
