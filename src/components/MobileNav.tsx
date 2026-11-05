'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

interface NavLink { href: string; label: string }

interface MobileNavProps {
  links: NavLink[]
  logoHref?: string
  dark?: boolean  // true = dark bg (inner pages), false = yellow (homepage)
}

export default function MobileNav({ links, dark = false }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  const bg = dark ? 'bg-[#0A0A0A]' : 'bg-[#FACD40]'
  const text = dark ? 'text-white' : 'text-black'
  const sub = dark ? 'text-white/60' : 'text-black/60'
  const border = dark ? 'border-white/10' : 'border-black/10'

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className={`md:hidden p-2 rounded-lg ${sub} hover:${text} transition-colors`}
        aria-label="Toggle menu"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className={`md:hidden absolute top-full left-0 right-0 z-50 ${bg} border-t ${border} shadow-xl`}>
          <nav className="flex flex-col px-6 py-4 gap-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`py-3 text-base font-medium ${sub} hover:${text} border-b ${border} last:border-0 transition-colors`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
