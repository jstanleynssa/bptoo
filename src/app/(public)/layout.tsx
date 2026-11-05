import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <header className="border-b border-white/10 sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" style={{ fontFamily: 'Peralta, serif' }}
            className="text-xl text-white hover:text-white/60 transition-colors">
            bptoo
          </Link>
          <nav className="flex items-center gap-8">
            {[
              { href: '/about', label: 'About' },
          { href: '/blog', label: 'Blog' },
              { href: '/projects', label: 'Projects' },
              { href: '/artwork', label: 'Artwork' },
              { href: '/mood', label: 'The Wave' },
                          ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="text-sm text-white/50 hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {children}
      </main>

      <div className="h-2 w-full bg-[#FACD40]" />
      <footer className="max-w-5xl mx-auto px-6 py-10 flex items-center justify-between text-white/30 text-sm">
        <span style={{ fontFamily: 'Peralta, serif' }} className="text-white/60">bptoo</span>
        <span>© {new Date().getFullYear()} Jason Stanley</span>
        <Link href="/admin" className="hover:text-white/60 transition-colors">Admin</Link>
      </footer>
    </div>
  )
}
