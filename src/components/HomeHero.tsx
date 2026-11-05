'use client'

import Link from 'next/link'

// Nav only — used by ScrollNarrative
export default function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-5" style={{ backgroundColor: '#FACD40' }}>
      <span className="text-2xl text-black" style={{ fontFamily: 'Peralta, serif' }}>
        bptoo
      </span>
      <div className="flex items-center gap-8">
        {[
          { href: '/about', label: 'About' },
          { href: '/blog', label: 'Blog' },
          { href: '/projects', label: 'Projects' },
          { href: '/artwork', label: 'Artwork' },
          { href: '/mood', label: 'The Wave' },
                  ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-sm font-medium text-black/60 hover:text-black transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
