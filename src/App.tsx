import { SubscriptionProvider } from '@/context/SubscriptionContext'
import { ToastProvider } from '@/context/ToastContext'
import { useSubscription } from '@/hooks/useSubscription'
import { CheckoutHandler } from '@/components/app/CheckoutHandler'
import LandingPage from '@/pages/LandingPage'
import { HomePage } from '@/pages/HomePage'

function AppContent() {
  const { session, isAuthLoading } = useSubscription()

  if (isAuthLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="relative mx-auto size-10" aria-hidden>
            <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-violet-500 border-r-fuchsia-500" />
          </div>
          <p className="mt-4 text-sm text-zinc-400">NexTrends wird geladen …</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {session && <CheckoutHandler />}
      {session ? <HomePage /> : <LandingPage />}
    </>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <SubscriptionProvider>
        <AppContent />
      </SubscriptionProvider>
    </ToastProvider>
  )
}
