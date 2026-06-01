'use client'

import type { ReactNode } from 'react'
import { ErrorBoundary } from '@/components/app/ErrorBoundary'
import { CheckoutHandler } from '@/components/app/CheckoutHandler'
import { SubscriptionProvider } from '@/context/SubscriptionContext'
import { ToastProvider } from '@/context/ToastContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <SubscriptionProvider>
          <CheckoutHandler />
          {children}
        </SubscriptionProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
