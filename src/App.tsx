import { useEffect, useState } from 'react'
import { useMobileKeyboardViewport } from '@/hooks/useMobileKeyboardViewport'
import { SubscriptionProvider } from '@/context/SubscriptionContext'
import { ToastProvider } from '@/context/ToastContext'
import { ErrorBoundary } from '@/components/app/ErrorBoundary'
import { isAdminPath } from '@/lib/admin-navigation'
import { isLoginPath } from '@/lib/auth'
import { isBrowser } from '@/lib/runtime'
import LandingPage from '@/views/LandingPage'
import { AdminPage } from '@/views/AdminPage'
import AuthPage from '@/views/AuthPage'

/** Auth guards disabled — always render public landing unless on admin/login paths. */
function AppContent() {
  const [onAdminRoute, setOnAdminRoute] = useState(() =>
    isBrowser() ? isAdminPath() : false,
  )
  const [onLoginRoute, setOnLoginRoute] = useState(() =>
    isBrowser() ? isLoginPath() : false,
  )

  useEffect(() => {
    const syncRoute = () => {
      setOnAdminRoute(isAdminPath())
      setOnLoginRoute(isLoginPath())
    }
    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  if (onAdminRoute) {
    return <AdminPage />
  }

  if (onLoginRoute) {
    return <AuthPage />
  }

  return <LandingPage />
}

export default function App() {
  useMobileKeyboardViewport()

  return (
    <ErrorBoundary>
      <ToastProvider>
        <SubscriptionProvider skipAuthBootstrap>
          <AppContent />
        </SubscriptionProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
