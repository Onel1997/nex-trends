import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { CrownIcon } from '@/components/ui/icons'
import { useDashboardData } from '@/hooks/useDashboardData'
import { FREE_MONTHLY_AI_LIMIT, PRO_PRICE_LABEL } from '@/lib/constants'

export function SubscriptionSection() {
  const {
    hasProAccess,
    planLabel,
    statusLabel,
    openUpgradeModal,
    openStripeCheckout,
    manageSubscription,
  } = useDashboardData()

  return (
    <Card className="animate-fade-in animation-delay-200">
      <CardHeader>
        <h3 className="text-sm font-semibold text-white">Subscription</h3>
        <p className="text-xs text-zinc-500">Plan verwalten & upgraden</p>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-zinc-500">Aktueller Plan</p>
              <p className="mt-1 text-lg font-semibold text-white">{planLabel}</p>
            </div>
            <Badge variant={hasProAccess ? 'pro' : 'muted'}>{statusLabel}</Badge>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            {hasProAccess ? (
              <>
                <li>✓ Unbegrenzte Credits</li>
                <li>✓ Alle Premium-Tools</li>
                <li>✓ Priorisierter KI-Zugriff</li>
              </>
            ) : (
              <>
                <li>· {FREE_MONTHLY_AI_LIMIT} Credits / Monat</li>
                <li>· Trend-Scouting</li>
                <li>· Premium-Tools als Vorschau</li>
              </>
            )}
          </ul>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {!hasProAccess && (
            <Button
              variant="pro"
              fullWidth
              onClick={() => void openStripeCheckout()}
            >
              <CrownIcon className="size-4" />
              Upgrade · {PRO_PRICE_LABEL}
            </Button>
          )}
          <button
            type="button"
            onClick={hasProAccess ? manageSubscription : openUpgradeModal}
            className="w-full rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-900"
          >
            {hasProAccess ? 'Abo verwalten' : 'Pläne vergleichen'}
          </button>
        </div>
      </CardBody>
    </Card>
  )
}
