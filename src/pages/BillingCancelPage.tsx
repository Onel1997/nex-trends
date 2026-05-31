import { Button } from '@/components/ui/Button'
import { navigateToTool } from '@/lib/navigation'

export function BillingCancelPage() {
  return (
    <div className="flex min-h-svh items-center justify-center ambient-glow bg-zinc-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800/60 bg-zinc-950/90 p-8 text-center backdrop-blur-xl">
        <h1 className="text-xl font-semibold text-white">Checkout canceled</h1>
        <p className="dashboard-os-muted mt-2 text-sm">
          No charges were made. You can upgrade anytime from pricing.
        </p>
        <Button
          variant="pro"
          className="mt-6 w-full"
          onClick={() => navigateToTool('pricing')}
        >
          Back to pricing
        </Button>
        <Button
          variant="ghost"
          className="mt-2 w-full"
          onClick={() => navigateToTool('dashboard')}
        >
          Dashboard
        </Button>
      </div>
    </div>
  )
}
