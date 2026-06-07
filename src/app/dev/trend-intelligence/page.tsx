'use client'

import { AppProviders } from '@/components/app/AppProviders'
import { TrendIntelligencePage } from '@/views/trend-intelligence/TrendIntelligencePage'

/** Dev-only preview — no auth required. Disabled in production. */
export default function DevTrendIntelligencePreviewPage() {
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <AppProviders>
      <div className="min-h-svh overflow-x-hidden bg-zinc-950 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <TrendIntelligencePage />
        </div>
      </div>
    </AppProviders>
  )
}
