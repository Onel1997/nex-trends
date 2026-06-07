'use client'

import type { ReactNode } from 'react'
import { ErrorBoundary, ErrorFallback } from '@/components/app/ErrorBoundary'
import { CheckoutHandler } from '@/components/app/CheckoutHandler'
import { SubscriptionProvider } from '@/context/SubscriptionContext'
import { ToastProvider } from '@/context/ToastContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <SubscriptionProvider>
          <CheckoutHandler />
          <ErrorBoundary
            fallback={
              <ErrorFallback
                compact
                title="Bereich konnte nicht geladen werden"
                message="Ein Teil der App ist abgestürzt. Deine Anmeldung bleibt aktiv — lade die Seite neu oder wechsle zum Dashboard."
                onReload={() => window.location.assign('/dashboard')}
              />
            }
          >
            {children}
          </ErrorBoundary>
        </SubscriptionProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
