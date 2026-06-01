'use client'

import { AppProviders } from '@/components/app/AppProviders'
import AuthPage from '@/views/AuthPage'

export default function LoginPage() {
  return (
    <AppProviders>
      <AuthPage />
    </AppProviders>
  )
}
