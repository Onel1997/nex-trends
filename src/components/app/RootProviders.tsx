'use client'

import { useEffect, type ReactNode } from 'react'
import { AuthReturnHandler } from '@/components/auth/AuthReturnHandler'
import { logSupabaseEnvStatus } from '@/lib/env'
import { ToastProvider } from '@/context/ToastContext'

/** Lightweight providers for marketing/auth pages (toasts without full dashboard context). */
export function RootProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    logSupabaseEnvStatus('root')
  }, [])

  return (
    <ToastProvider>
      <AuthReturnHandler />
      {children}
    </ToastProvider>
  )
}
