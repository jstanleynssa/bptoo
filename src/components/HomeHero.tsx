'use client'

import Link from 'next/link'
import MobileNav from '@/components/MobileNav'

const NAV_LINKS = [
  { href: '/about', label: 'About' },
          { href: '/all', label: 'All' },
  { href: '/blog', label: 'Blog' },
  { href: '/projects', label: 'Projects' },
  { href: '/artwork', label: 'Artwork' },
  { href: '/mood', label: 'The Wave' },
]

export default function SiteNav({ totalHours = 0 }: { totalHours?: number }) {
  return (
    <nav className="relative sticky top-0 z-50 flex items-center justify-between px-6 md:px-8 py-5"
      style={{ backgroundColor: '#FACD40' }}>
      <div className="flex items-baseline gap-3">
        <span className="text-2xl text-black" style={{ fontFamily: 'Peralta, serif' }}>bptoo</span>
        {totalHours > 0 && (
          <div className="relative group hidden md:block">
            <span style={{ fontFamily: 'Peralta, serif', color: '#1a1a1a' }}
              className="text-xs opacity-50 cursor-help whitespace-nowrap">
              {totalHours.toLocaleString()} hours… and counting
            </span>
            <div className="absolute left-0 top-5 z-50 w-64 p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white/70 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl">
              The total hours I have spent on published projects — across art, writing, building, 3D printing, and design.
            </div>
          </div>
        )}
      </div>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map(({ href, label }) => (
          <Link key={href} href={href}
            className="text-sm font-medium text-black/60 hover:text-black transition-colors">
            {label}
          </Link>
        ))}
      </div>

      {/* Mobile hamburger */}
      <MobileNav links={NAV_LINKS} dark={false} />
    </nav>
  )
}
