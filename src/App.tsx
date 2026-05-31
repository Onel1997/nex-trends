import { useEffect, useState } from 'react'
import { useMobileKeyboardViewport } from '@/hooks/useMobileKeyboardViewport'
import { SubscriptionProvider } from '@/context/SubscriptionContext'
import { ToastProvider } from '@/context/ToastContext'
import { ErrorBoundary } from '@/components/app/ErrorBoundary'
import { Spinner } from '@/components/ui/Spinner'
import { useSubscription } from '@/hooks/useSubscription'
import { CheckoutHandler } from '@/components/app/CheckoutHandler'
import { MaintenanceBanner } from '@/components/app/MaintenanceBanner'
import { isAdminPath } from '@/lib/admin-navigation'
import { isLoginPath } from '@/lib/auth'
import LandingPage from '@/views/LandingPage'
import { HomePage } from '@/views/HomePage'
import { AdminPage } from '@/views/AdminPage'
import AuthPage from '@/views/AuthPage'

function AppContent() {
  const { session, isAuthLoading } = useSubscription()
  const [onAdminRoute, setOnAdminRoute] = useState(() => isAdminPath())
  const [onLoginRoute, setOnLoginRoute] = useState(() => isLoginPath())

  useEffect(() => {
    const syncRoute = () => {
      setOnAdminRoute(isAdminPath())
      setOnLoginRoute(isLoginPath())
    }
    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

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

  if (onLoginRoute && !session) {
    return <AuthPage />
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
    <ErrorBoundary>
      <ToastProvider>
        <SubscriptionProvider>
          <AppContent />
        </SubscriptionProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
