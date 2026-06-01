'use client'

import { useEffect, type ReactNode } from 'react'
import { logSupabaseEnvStatus } from '@/lib/env'
import { ToastProvider } from '@/context/ToastContext'

/** Lightweight providers for marketing/auth pages (toasts without full dashboard context). */
export function RootProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    logSupabaseEnvStatus('root')
  }, [])

  return <ToastProvider>{children}</ToastProvider>
}
