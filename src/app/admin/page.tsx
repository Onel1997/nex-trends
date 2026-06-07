'use client'

import { AppProviders } from '@/components/app/AppProviders'
import { AdminPage } from '@/views/AdminPage'

export default function AdminRoutePage() {
  return (
    <AppProviders>
      <AdminPage />
    </AppProviders>
  )
}
