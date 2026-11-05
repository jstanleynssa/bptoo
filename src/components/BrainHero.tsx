'use client'

import Link from 'next/link'

// brain.svg: 229.12 × 231.63 — nearly square, brain + bptoo wordmark
const BRAIN_DISPLAY_W = 440  // px — fills the viewport nicely

export default function BrainHero() {
  return (
    <section
      className="relative flex flex-col"
      style={{ backgroundColor: '#FACD40', minHeight: '100vh' }}
    >
      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-8 pt-7 pb-4 shrink-0">
        <span className="text-2xl text-black" style={{ fontFamily: 'Peralta, serif' }}>
          bptoo
        </span>
        <div className="flex items-center gap-8">
          {[
            { href: '/blog', label: 'Blog' },
            { href: '/projects', label: 'Projects' },
            { href: '/artwork', label: 'Artwork' },
            { href: '/about', label: 'About' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="text-sm font-medium text-black/60 hover:text-black transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Brain — centered in remaining viewport */}
      <div className="flex-1 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brain.svg"
          alt="bptoo — a bespectacled brain"
          style={{
            width: `${BRAIN_DISPLAY_W}px`,
            height: 'auto',
            display: 'block',
            mixBlendMode: 'multiply',
          }}
          draggable={false}
        />
      </div>

      {/* Scroll hint */}
      <div className="flex flex-col items-center gap-2 pb-8 shrink-0">
        <span className="text-xs font-medium text-black/40 tracking-widest uppercase">Scroll</span>
        <svg width="16" height="20" viewBox="0 0 16 20" fill="none" className="animate-bounce">
          <path d="M8 0v16M2 10l6 6 6-6" stroke="black" strokeOpacity="0.35" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  )
}
