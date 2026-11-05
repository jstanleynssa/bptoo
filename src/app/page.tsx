export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ExternalLink } from 'lucide-react'
import type { Post, Project, Category } from '@/lib/types'
import SiteNav from '@/components/HomeHero'
import RevealSVG from '@/components/RevealSVG'
import LineRevealBlock from '@/components/LineRevealBlock'
import AnimatedBlock from '@/components/AnimatedBlock'
import ScrollSection from '@/components/ScrollSection'
import { formatDistanceToNow } from 'date-fns'

type PostRow = Post & { categories: Pick<Category, 'name' | 'color'> | null }

// hero.svg: 229.12 × 2623.72, displayed at 280px wide → SVG_H ≈ 3207px
const SVG_W = 280
const SVG_H = Math.round(SVG_W * 2623.72 / 229.12)
const STRING_START = 300
const STRING_END = Math.round(SVG_H * 0.88)
const SPAN = STRING_END - STRING_START

const PCT   = [0.18, 0.50, 0.80, 0.90]
const SIDES: ('left' | 'right')[] = ['left', 'right', 'left', 'right']
const BLOCK_Y = PCT.map(p => STRING_START + Math.round(SPAN * p))
const BLOCK_W = 270
const GAP = 24

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: postsData }, { data: projectsData }] = await Promise.all([
    supabase.from('posts').select('id, title, slug, excerpt, cover_image_url, published_at, categories(name, color)')
      .eq('status', 'published').order('published_at', { ascending: false }).limit(3),
    supabase.from('projects').select('id, title, slug, description, cover_image_url, url')
      .eq('status', 'published').eq('featured', true).order('sort_order').limit(4),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentPosts = (postsData ?? []) as any as PostRow[]
  const featuredProjects = (projectsData ?? []) as Project[]
  const latestPost = recentPosts[0]

  return (
    <div style={{ backgroundColor: '#FACD40', minHeight: '100vh' }}>
      <SiteNav />

      {/* Space so brain clears the sticky nav */}
      <div className="hidden md:block" style={{ height: '72px' }} />

      {/* ── Desktop: Illustration + bracketing blocks ── */}
      <div
        data-reveal-container
        className="relative mx-auto hidden md:block"
        style={{ height: `${SVG_H}px`, maxWidth: '960px' }}
      >
        <RevealSVG />

        {/* Block 1 — left */}
        <LineRevealBlock blockY={BLOCK_Y[0]} side={SIDES[0]}
          style={{ position: 'absolute', top: `${BLOCK_Y[0]}px`, transform: 'translateY(-50%)', width: `${BLOCK_W}px`, right: `calc(50% + ${SVG_W / 2 + GAP}px)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://pqaqwpclwutngudlgxzf.supabase.co/storage/v1/object/public/media/jason-stanley-ink.png"
            alt="Jason Stanley" className="w-full mb-5" style={{ mixBlendMode: 'multiply', display: 'block' }} />
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35 mb-3">Introduction</p>
          <h2 className="text-2xl text-black mb-4 leading-snug" style={{ fontFamily: 'Peralta, serif' }}>Nice to meet ya.</h2>
          <p className="text-sm text-black/65 leading-relaxed mb-3">
            Hey — I'm Jason. I'm a husband and dad. I'm also an entrepreneur, builder,
            marketer, writer, and creative based in North Carolina. If I had to narrow
            that down to one word I would call myself a designer.
          </p>
          <p className="text-sm text-black/65 leading-relaxed">
            I have Bipolar II, and I've spent a long time going from ashamed of that to
            feeling like I should be proud of how it shapes the way I think and make things.
            This site is a step forward in that journey. I created it to share my thoughts
            and thought processes, and the results, which may or may not be completely finished.
          </p>
        </LineRevealBlock>

        {/* Block 2 — right */}
        <LineRevealBlock blockY={BLOCK_Y[1]} side={SIDES[1]}
          style={{ position: 'absolute', top: `${BLOCK_Y[1]}px`, transform: 'translateY(-50%)', width: `${BLOCK_W}px`, left: `calc(50% + ${SVG_W / 2 + GAP}px)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://pqaqwpclwutngudlgxzf.supabase.co/storage/v1/object/public/media/waves-ink.png"
            alt="Wave frequency" className="w-full mb-5" style={{ mixBlendMode: 'multiply', display: 'block' }} />
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35 mb-3">The thing itself</p>
          <h2 className="text-2xl text-black mb-4 leading-snug" style={{ fontFamily: 'Peralta, serif' }}>What exactly is Bipolar II?</h2>
          <p className="text-sm text-black/65 leading-relaxed mb-4">
            Bipolar II means recurring depression and at least one hypomanic episode — elevated
            mood that's real and intense, but short of full mania. That's the clinical definition.
            If I had to describe it: imagine surfing a long swell — you don't go very high or low,
            and you generally feel despondent. There is a fair bit of distance between the peaks.
            Then the frequency and amplitude of the waves increase, and now you are really surfing,
            cutting it up — it feels fulfilling. Then the waves slow down again, and you're back.
          </p>
          <p className="text-sm text-black/65 leading-relaxed">
            It's not a lighter version of Bipolar I. The same wiring that makes the lows hard
            makes the highs remarkably generative. I may make connections others miss. I get
            genuinely obsessed with ideas. I feel things deeply enough to make work that means
            something to me — half the time I'll do something just for my own edification.
            Frequently those are the most rewarding projects.
          </p>
        </LineRevealBlock>

        {/* Block 3 — left */}
        <LineRevealBlock blockY={BLOCK_Y[2]} side={SIDES[2]}
          style={{ position: 'absolute', top: `${BLOCK_Y[2]}px`, transform: 'translateY(-50%)', width: `${BLOCK_W}px`, right: `calc(50% + ${SVG_W / 2 + GAP}px)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://pqaqwpclwutngudlgxzf.supabase.co/storage/v1/object/public/media/tree-ink.png"
            alt="Tree" className="w-full mb-5" style={{ mixBlendMode: 'multiply', display: 'block' }} />
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35 mb-3">Creative life</p>
          <h2 className="text-2xl text-black mb-4 leading-snug" style={{ fontFamily: 'Peralta, serif' }}>What I direct my creativity towards.</h2>
          <p className="text-sm text-black/65 leading-relaxed mb-4">
            All directions, honestly. Projects for my kids and family. Things for the
            other roles in my life: coaching, leading Scouts, running a business.
            I read, write, draw (not very well), work in Photoshop (pretty well),
            make videos, and follow my brain down rabbit holes. Business concepts and
            solutions to problems no one ever asked me for. This site is where a lot of that ends up.
          </p>
          <p className="text-sm text-black/65 leading-relaxed">
            Lately I have incorporated A.I. tools into my repertoire. If that feels like a dealbreaker
            for you, no worries — continue on your journey. For my part, I have been using the Adobe
            Creative Suite for, geez — 30+ years! I started out on Adobe Photoshop 2.0.
            26 versions later, here we are. My point being, I've spent my whole life making my own
            creations, and now A.I. lets me combine that experience to help realize visions that
            previously would have been out of reach.
          </p>
        </LineRevealBlock>

        {/* Block 4 — right */}
        <LineRevealBlock blockY={BLOCK_Y[3]} side={SIDES[3]}
          style={{ position: 'absolute', top: `${BLOCK_Y[3]}px`, transform: 'translateY(-50%)', width: `${BLOCK_W}px`, left: `calc(50% + ${SVG_W / 2 + GAP}px)` }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35 mb-3">
            {latestPost ? 'Latest post' : 'Explore'}
          </p>
          {latestPost ? (
            <Link href={`/blog/${latestPost.slug}`} className="group block">
              {latestPost.cover_image_url && (
                <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-black/10">
                  <Image src={latestPost.cover_image_url} alt={latestPost.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              {latestPost.categories && (
                <span className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: latestPost.categories.color }}>
                  {latestPost.categories.name}
                </span>
              )}
              <h2 className="text-xl text-black mb-2 leading-snug group-hover:text-black/60 transition-colors"
                style={{ fontFamily: 'Peralta, serif' }}>{latestPost.title}</h2>
              {latestPost.excerpt && <p className="text-sm text-black/60 leading-relaxed line-clamp-3">{latestPost.excerpt}</p>}
              <span className="inline-flex items-center gap-1 text-xs text-black/40 hover:text-black mt-3 transition-colors">
                Read it <ArrowRight size={12} />
              </span>
            </Link>
          ) : (
            <div className="space-y-3">
              {[{ href: '/blog', label: 'Read the blog' }, { href: '/projects', label: 'See projects' }].map(({ href, label }) => (
                <Link key={href} href={href} className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors">
                  <ArrowRight size={13} /> {label}
                </Link>
              ))}
            </div>
          )}
        </LineRevealBlock>
      </div>

      {/* Connector - desktop only */}
      <div className="hidden md:flex mx-auto justify-center">
        <div className="w-px bg-black/20" style={{ height: '60px' }} />
      </div>


      {/* ── Mobile layout ── */}
      <div className="md:hidden px-6 pb-16 space-y-12">

        {/* Brain illustration */}
        <div className="flex justify-center pt-8 pb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero.svg" alt="bptoo" style={{ width: '220px', height: 'auto', clipPath: 'inset(0 0 90.3% 0)' }} />
        </div>

        {/* Block 1 */}
        <div className="border-t border-black/10 pt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://pqaqwpclwutngudlgxzf.supabase.co/storage/v1/object/public/media/jason-stanley-ink.png"
            alt="Jason Stanley" className="w-32 mb-5" style={{ mixBlendMode: 'multiply' }} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/35 mb-2">Introduction</p>
          <h2 className="text-2xl text-black mb-4" style={{ fontFamily: 'Peralta, serif' }}>Nice to meet ya.</h2>
          <p className="text-sm text-black/65 leading-relaxed mb-3">
            Hey — I'm Jason. I'm a husband and dad. I'm also an entrepreneur, builder,
            marketer, writer, and creative based in North Carolina. If I had to narrow
            that down to one word I would call myself a designer.
          </p>
          <p className="text-sm text-black/65 leading-relaxed">
            I have Bipolar II, and I've spent a long time going from ashamed of that to
            feeling like I should be proud of how it shapes the way I think and make things.
          </p>
        </div>

        {/* Block 2 */}
        <div className="border-t border-black/10 pt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://pqaqwpclwutngudlgxzf.supabase.co/storage/v1/object/public/media/waves-ink.png"
            alt="Wave frequency" className="w-full mb-5" style={{ mixBlendMode: 'multiply' }} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/35 mb-2">The thing itself</p>
          <h2 className="text-2xl text-black mb-4" style={{ fontFamily: 'Peralta, serif' }}>What exactly is Bipolar II?</h2>
          <p className="text-sm text-black/65 leading-relaxed">
            Bipolar II means recurring depression and at least one hypomanic episode — elevated
            mood that's real and intense, but short of full mania. The same wiring that makes
            the lows hard makes the highs remarkably generative. I may make connections others
            miss. I get genuinely obsessed with ideas.
          </p>
        </div>

        {/* Block 3 */}
        <div className="border-t border-black/10 pt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://pqaqwpclwutngudlgxzf.supabase.co/storage/v1/object/public/media/tree-ink.png"
            alt="Tree" className="w-32 mb-5" style={{ mixBlendMode: 'multiply' }} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/35 mb-2">Creative life</p>
          <h2 className="text-2xl text-black mb-4" style={{ fontFamily: 'Peralta, serif' }}>What I direct my creativity towards.</h2>
          <p className="text-sm text-black/65 leading-relaxed">
            All directions — projects for my kids and family, coaching, leading Scouts,
            running a business. I read, write, draw, work in Photoshop, make videos,
            and follow my brain down rabbit holes. This site is where a lot of that ends up.
          </p>
        </div>

        {/* Latest post */}
        {latestPost && (
          <div className="border-t border-black/10 pt-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/35 mb-4">Latest post</p>
            <Link href={`/blog/${latestPost.slug}`} className="group block">
              {latestPost.cover_image_url && (
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-black/10">
                  <Image src={latestPost.cover_image_url} alt={latestPost.title} fill className="object-cover" />
                </div>
              )}
              <h2 className="text-xl text-black mb-2 group-hover:text-black/60 transition-colors" style={{ fontFamily: 'Peralta, serif' }}>
                {latestPost.title}
              </h2>
              {latestPost.excerpt && <p className="text-sm text-black/60 leading-relaxed line-clamp-2">{latestPost.excerpt}</p>}
              <span className="inline-flex items-center gap-1 text-xs text-black/40 mt-3">Read it <ArrowRight size={12} /></span>
            </Link>
          </div>
        )}

        {/* Man at bottom */}
        <div className="flex justify-center pt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/man.svg" alt="A person" style={{ width: '120px', height: 'auto', mixBlendMode: 'multiply' }} />
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-6">
        {featuredProjects.length > 0 && (
          <section className="py-24 border-t border-black/10">
            <ScrollSection>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35 mb-3">Work</p>
                  <h2 className="text-4xl text-black" style={{ fontFamily: 'Peralta, serif' }}>Projects.</h2>
                </div>
                <Link href="/projects" className="flex items-center gap-1 text-sm text-black/40 hover:text-black transition-colors">All <ArrowRight size={14} /></Link>
              </div>
            </ScrollSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {featuredProjects.map((p, i) => (
                <AnimatedBlock key={p.id} delay={i * 0.1} direction={i % 2 === 0 ? 'left' : 'right'}>
                  <Link href={`/projects/${p.slug}`} className="group block bg-black/8 hover:bg-black/12 rounded-xl p-5 transition-colors">
                    {p.cover_image_url && (
                      <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                        <Image src={p.cover_image_url} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl text-black mb-1 group-hover:text-black/60 transition-colors" style={{ fontFamily: 'Peralta, serif' }}>{p.title}</h3>
                        {p.description && <p className="text-black/55 text-sm leading-relaxed line-clamp-2">{p.description}</p>}
                      </div>
                      {p.url && (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="shrink-0 p-1.5 text-black/30 hover:text-black transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </Link>
                </AnimatedBlock>
              ))}
            </div>
          </section>
        )}

        {recentPosts.length > 1 && (
          <section className="py-24 border-t border-black/10">
            <ScrollSection>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35 mb-3">Writing</p>
                  <h2 className="text-4xl text-black" style={{ fontFamily: 'Peralta, serif' }}>From the blog.</h2>
                </div>
                <Link href="/blog" className="flex items-center gap-1 text-sm text-black/40 hover:text-black transition-colors">All <ArrowRight size={14} /></Link>
              </div>
            </ScrollSection>
            <div className="space-y-4">
              {recentPosts.slice(1).map((post, i) => (
                <AnimatedBlock key={post.id} delay={i * 0.1}>
                  <Link href={`/blog/${post.slug}`} className="group flex gap-6 items-start bg-black/8 hover:bg-black/12 rounded-xl p-5 transition-colors">
                    {post.cover_image_url && (
                      <div className="relative shrink-0 w-32 aspect-video rounded-lg overflow-hidden">
                        <Image src={post.cover_image_url} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {post.categories && (
                        <span className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: post.categories.color }}>{post.categories.name}</span>
                      )}
                      <h3 className="text-lg text-black mb-1 group-hover:text-black/60 transition-colors leading-snug" style={{ fontFamily: 'Peralta, serif' }}>{post.title}</h3>
                      {post.excerpt && <p className="text-black/50 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>}
                      <p className="text-black/25 text-xs mt-2">
                        {post.published_at ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true }) : ''}
                      </p>
                    </div>
                  </Link>
                </AnimatedBlock>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="max-w-5xl mx-auto px-6 py-10 flex items-center justify-between text-black/40 text-sm border-t border-black/10">
        <span style={{ fontFamily: 'Peralta, serif' }} className="text-black/60">bptoo</span>
        <span>© {new Date().getFullYear()} Jason Stanley</span>
        <Link href="/admin" className="hover:text-black/60 transition-colors">Admin</Link>
      </footer>
    </div>
  )
}
