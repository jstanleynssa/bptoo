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

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <header className="relative border-b border-white/10 sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" style={{ fontFamily: 'Peralta, serif' }}
            className="text-xl text-white hover:text-white/60 transition-colors">
            bptoo
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href}
                className="text-sm text-white/50 hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <MobileNav links={NAV_LINKS} dark={true} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        {children}
      </main>

      <p className="text-center text-white/40 text-sm pb-2" style={{ fontFamily: 'Peralta, serif' }}>
        Bipolar, too. And a whole lot more.
      </p>
      <div className="h-2 w-full bg-[#FACD40]" />
      <footer className="max-w-5xl mx-auto px-6 py-10 flex items-center justify-between text-white/30 text-sm">
        <span style={{ fontFamily: 'Peralta, serif' }} className="text-white/60">bptoo</span>
        <span>© {new Date().getFullYear()} Jason Stanley</span>
        <Link href="/admin" className="hover:text-white/60 transition-colors">Admin</Link>
      </footer>
    </div>
  )
}
