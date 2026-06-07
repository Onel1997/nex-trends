import type { Metadata, Viewport } from 'next'
import { RootProviders } from '@/components/app/RootProviders'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

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

/** Runs before React — forwards OAuth return params to /auth/callback when middleware is skipped. */
const OAUTH_BOOTSTRAP_SCRIPT = `(function(){try{var u=new URL(location.href);var p=(u.pathname||'/').replace(/\\/+$/,'')||'/';if(p==='/auth/callback')return;if(!u.searchParams.has('code')&&!u.searchParams.get('error')&&!u.searchParams.get('error_description'))return;var t=new URL('/auth/callback',u.origin);['code','state','error','error_description'].forEach(function(k){var v=u.searchParams.get(k);if(v)t.searchParams.set(k,v);});location.replace(t.toString());}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: OAUTH_BOOTSTRAP_SCRIPT }} />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="theme-color" content="#09090b" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  )
}
