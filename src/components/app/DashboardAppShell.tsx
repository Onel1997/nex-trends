'use client'

import { AppProviders } from '@/components/app/AppProviders'
import { HomePage } from '@/views/HomePage'

/** Shared shell for all authenticated creator-app Next.js routes. */
export function DashboardAppShell() {
  return (
    <AppProviders>
      <HomePage />
    </AppProviders>
  )
}
