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

export const revalidate = 300 // refresh hours count every 5 minutes

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // Total hours across all published projects
  // Fetch hours directly via REST API (more reliable in layout context than createClient)
  let totalHours = 0
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/projects?select=hours_spent&status=eq.published&hours_spent=not.is.null`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        next: { revalidate: 300 },
      }
    )
    if (res.ok) {
      const data = await res.json() as { hours_spent: number }[]
      totalHours = Math.round(data.reduce((sum, p) => sum + (p.hours_spent ?? 0), 0))
    }
  } catch {}

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <header className="relative border-b border-white/10 sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex flex-col leading-none">
            <Link href="/" style={{ fontFamily: 'Peralta, serif' }}
              className="text-xl text-white hover:text-white/60 transition-colors">
              bptoo
            </Link>
            {totalHours > 0 && (
              <span className="text-[10px] text-white/30 tracking-widest uppercase mt-1">
                {totalHours.toLocaleString()} hours
              </span>
            )}
          </div>

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
