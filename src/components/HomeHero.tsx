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

export default function SiteNav() {
  return (
    <nav className="relative sticky top-0 z-50 flex items-center justify-between px-6 md:px-8 py-5"
      style={{ backgroundColor: '#FACD40' }}>
      <span className="text-2xl text-black" style={{ fontFamily: 'Peralta, serif' }}>
        bptoo
      </span>

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
