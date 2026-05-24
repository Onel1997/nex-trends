import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { CrownIcon } from '@/components/ui/icons'
import { useDashboardData } from '@/hooks/useDashboardData'
import { MAX_FREE_CREDITS, PRO_PRICE_LABEL, SIGNUP_CREDITS, WEEKLY_REFILL_CREDITS } from '@/lib/constants'

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
        <h3 className="text-sm font-semibold tracking-tight text-white">Subscription</h3>
        <p className="mt-0.5 text-xs text-zinc-500">Plan verwalten & upgraden</p>
      </CardHeader>
      <CardBody className="space-y-5">
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-600">
                Aktueller Plan
              </p>
              <p className="mt-1.5 text-lg font-semibold tracking-tight text-white">{planLabel}</p>
            </div>
            <Badge variant={hasProAccess ? 'pro' : 'muted'}>{statusLabel}</Badge>
          </div>

          <ul className="mt-5 space-y-2.5 text-sm text-zinc-400">
            {hasProAccess ? (
              <>
                <FeatureItem>Unbegrenzte Credits</FeatureItem>
                <FeatureItem>Alle Premium-Tools</FeatureItem>
                <FeatureItem>Priorisierter KI-Zugriff</FeatureItem>
              </>
            ) : (
              <>
                <FeatureItem muted>
                  {SIGNUP_CREDITS} Credits Start · +{WEEKLY_REFILL_CREDITS} wöchentlich (max.{' '}
                  {MAX_FREE_CREDITS})
                </FeatureItem>
                <FeatureItem muted>Alle KI-Tools mit Credits</FeatureItem>
                <FeatureItem muted>Trend-Scouting inklusive</FeatureItem>
              </>
            )}
          </ul>
        </div>

        <div className="flex flex-col gap-2.5">
          {!hasProAccess && (
            <Button variant="pro" fullWidth onClick={() => void openStripeCheckout()}>
              <CrownIcon className="size-4" />
              Upgrade · {PRO_PRICE_LABEL}
            </Button>
          )}
          <Button
            variant="secondary"
            fullWidth
            onClick={hasProAccess ? manageSubscription : openUpgradeModal}
          >
            {hasProAccess ? 'Abo verwalten' : 'Pläne vergleichen'}
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}

function FeatureItem({
  children,
  muted = false,
}: {
  children: ReactNode
  muted?: boolean
}) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        className={`size-1.5 shrink-0 rounded-full ${muted ? 'bg-zinc-600' : 'bg-emerald-400'}`}
        aria-hidden
      />
      {children}
    </li>
  )
}
