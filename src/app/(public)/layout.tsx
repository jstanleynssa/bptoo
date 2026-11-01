import Link from 'next/link'

const NAV = [
  { href: '/blog', label: 'Blog' },
  { href: '/projects', label: 'Projects' },
  { href: '/artwork', label: 'Artwork' },
  { href: '/about', label: 'About' },
]

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-900 sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight hover:text-violet-400 transition-colors">
            bptoo
          </Link>
          <nav className="flex items-center gap-6">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {children}
      </main>

      <footer className="border-t border-zinc-900 mt-24">
        <div className="max-w-5xl mx-auto px-6 py-10 flex items-center justify-between text-zinc-600 text-sm">
          <span>© {new Date().getFullYear()} Jason Stanley</span>
          <Link href="/admin" className="hover:text-zinc-400 transition-colors">Admin</Link>
        </div>
      </footer>
    </div>
  )
}
