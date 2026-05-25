import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useSubscription } from '@/hooks/useSubscription'
import { navigateToTool } from '@/lib/navigation'

export function BillingSuccessPage() {
  const { refreshProfile } = useSubscription()

  useEffect(() => {
    void refreshProfile()
    const id = window.setInterval(() => void refreshProfile(), 2000)
    return () => window.clearInterval(id)
  }, [refreshProfile])

  return (
    <div className="flex min-h-svh items-center justify-center ambient-glow bg-zinc-950 px-4">
      <div className="nex-os-polish w-full max-w-md rounded-2xl border border-emerald-500/25 bg-zinc-950/90 p-8 text-center shadow-[0_0_60px_-16px_rgba(52,211,153,0.35)] backdrop-blur-xl">
        <p className="text-4xl" aria-hidden>
          ✓
        </p>
        <h1 className="mt-3 text-xl font-semibold text-white">Payment successful</h1>
        <p className="dashboard-os-muted mt-2 text-sm">
          Your plan is activating. Credits and premium tools unlock within a few seconds.
        </p>
        <Button
          variant="pro"
          className="btn-glow-pro mt-6 w-full"
          onClick={() => navigateToTool('dashboard')}
        >
          Open dashboard
        </Button>
        <Button
          variant="ghost"
          className="mt-2 w-full"
          onClick={() => navigateToTool('billing')}
        >
          View billing
        </Button>
      </div>
    </div>
  )
}
