import { SubscriptionProvider } from '@/context/SubscriptionContext'
import { ToastProvider } from '@/context/ToastContext'
import { Spinner } from '@/components/ui/Spinner'
import { useSubscription } from '@/hooks/useSubscription'
import { CheckoutHandler } from '@/components/app/CheckoutHandler'
import LandingPage from '@/pages/LandingPage'
import { HomePage } from '@/pages/HomePage'

function AppContent() {
  const { session, isAuthLoading } = useSubscription()

  if (isAuthLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center ambient-glow bg-zinc-950">
        <Spinner size="lg" label="NexTrends wird geladen …" />
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
