import { useEffect, useState } from 'react'
import { useMobileKeyboardViewport } from '@/hooks/useMobileKeyboardViewport'
import { SubscriptionProvider } from '@/context/SubscriptionContext'
import { ToastProvider } from '@/context/ToastContext'
import { Spinner } from '@/components/ui/Spinner'
import { useSubscription } from '@/hooks/useSubscription'
import { CheckoutHandler } from '@/components/app/CheckoutHandler'
import { MaintenanceBanner } from '@/components/app/MaintenanceBanner'
import { isAdminPath } from '@/lib/admin-navigation'
import { isAuthCallbackPath } from '@/lib/auth'
import LandingPage from '@/pages/LandingPage'
import { HomePage } from '@/pages/HomePage'
import { AdminPage } from '@/pages/AdminPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'

function AppContent() {
  const { session, isAuthLoading } = useSubscription()
  const [onAdminRoute, setOnAdminRoute] = useState(() => isAdminPath())

  useEffect(() => {
    const syncRoute = () => setOnAdminRoute(isAdminPath())
    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  if (isAuthCallbackPath()) {
    return <AuthCallbackPage />
  }

  if (isAuthLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center ambient-glow bg-zinc-950">
        <Spinner size="lg" label="NexTrends wird geladen …" />
      </div>
    )
  }

  if (onAdminRoute) {
    return <AdminPage />
  }

  return (
    <>
      {session && <CheckoutHandler />}
      {session && <MaintenanceBanner />}
      {session ? <HomePage /> : <LandingPage />}
    </>
  )
}

export default function App() {
  useMobileKeyboardViewport()

  return (
    <ToastProvider>
      <SubscriptionProvider>
        <AppContent />
      </SubscriptionProvider>
    </ToastProvider>
  )
}
