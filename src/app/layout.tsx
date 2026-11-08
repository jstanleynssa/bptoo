import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: 'bptoo', template: '%s | bptoo' },
  description: 'Ideas, art, and the creative chaos of no brakes brain.',
  metadataBase: new URL('https://bptoo.com'),
  openGraph: {
    siteName: 'bptoo',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Peralta&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <div className="min-h-screen">{children}</div>
        <Toaster theme="light" position="bottom-right" />
      </body>
    </html>
  )
}
