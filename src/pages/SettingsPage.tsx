import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { CrownIcon } from '@/components/ui/icons'
import { useDashboardData } from '@/hooks/useDashboardData'
import { supabase } from '@/lib/supabase'

export function SettingsPage() {
  const {
    user,
    hasProAccess,
    isAdmin,
    planLabel,
    statusLabel,
    manageSubscription,
    openStripeCheckout,
  } = useDashboardData()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Settings</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Einstellungen</h1>
        <p className="mt-2 text-sm text-zinc-500">Account, Abo und App-Einstellungen.</p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-white">Account</h2>
        </CardHeader>
        <CardBody className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-zinc-500">Name</span>
            <span className="font-medium text-zinc-200">{user?.name ?? '—'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-zinc-500">E-Mail</span>
            <span className="truncate font-medium text-zinc-200">{user?.email ?? '—'}</span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Subscription</h2>
            {isAdmin ? (
              <Badge variant="admin">ADMIN</Badge>
            ) : hasProAccess ? (
              <Badge variant="pro">
                <CrownIcon className="mr-1 inline size-3" aria-hidden />
                Pro
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Plan</span>
            <span className="font-medium text-zinc-200">{planLabel}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Status</span>
            <span className="font-medium text-zinc-200">{statusLabel}</span>
          </div>
          {isAdmin ? null : hasProAccess ? (
            <Button variant="secondary" fullWidth onClick={manageSubscription}>
              Abo verwalten
            </Button>
          ) : (
            <Button variant="pro" fullWidth onClick={() => void openStripeCheckout()}>
              Upgrade to Pro
            </Button>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Button
            variant="ghost"
            fullWidth
            onClick={() => supabase.auth.signOut()}
            className="text-red-400 hover:text-red-300"
          >
            Abmelden
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}
