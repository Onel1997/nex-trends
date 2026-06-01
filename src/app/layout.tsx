import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NexTrends — AI Marketing Suite für TikTok & Instagram',
  description:
    'NexTrends — Entdecke virale Trends, generiere scroll-stoppende Hooks & Ad Copy mit KI. Die All-in-One Marketing Suite für TikTok & Instagram. Kostenlos starten.',
  keywords: [
    'AI Marketing',
    'TikTok Trends',
    'Instagram Content',
    'Ad Copy Generator',
    'Hook Generator',
    'Trend Scouting',
    'NexTrends',
  ],
  authors: [{ name: 'NexTrends' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    title: 'NexTrends — AI Marketing Suite für TikTok & Instagram',
    description:
      'Entdecke virale Trends, generiere Hooks & Ad Copy mit KI. Kostenlos starten — in 30 Sekunden startklar.',
    siteName: 'NexTrends',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexTrends — AI Marketing Suite für TikTok & Instagram',
    description: 'Virale Trends in Umsatz verwandeln. KI-Tools für Creator & Brands.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="theme-color" content="#09090b" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
