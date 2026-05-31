import { useCallback, useState } from 'react'
import { DeleteAccountModal } from '@/components/settings/DeleteAccountModal'
import { CreditsUsageCard } from '@/components/credits/CreditsUsageCard'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TrustIndicator } from '@/components/ui/TrustIndicator'
import {
  CrownIcon,
  LogOutIcon,
  SettingsIcon,
  TrashIcon,
} from '@/components/ui/icons'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useDashboardData } from '@/hooks/useDashboardData'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib'

const REDUCED_MOTION_KEY = 'nextrends_reduced_motion'

function readReducedMotion(): boolean {
  try {
    return localStorage.getItem(REDUCED_MOTION_KEY) === '1'
  } catch {
    return false
  }
}

export function SettingsPage() {
  const {
    user,
    hasProAccess,
    isAdmin,
    planLabel,
    statusLabel,
    remainingLabel,
    resetDateLabel,
    manageSubscription,
    openStripeCheckout,
  } = useDashboardData()

  const { resetOnboarding } = useOnboarding()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(readReducedMotion)

  const toggleReducedMotion = useCallback(() => {
    setReducedMotion((prev) => {
      const next = !prev
      localStorage.setItem(REDUCED_MOTION_KEY, next ? '1' : '0')
      document.documentElement.classList.toggle('nex-reduced-motion', next)
      return next
    })
  }, [])

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <header>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
          <SettingsIcon className="size-3.5 text-violet-400" aria-hidden />
          Settings
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Einstellungen
        </h1>
        <p className="mt-2 text-sm text-zinc-500">Account, Abo, Credits und Präferenzen.</p>
        <TrustIndicator className="mt-4" compact />
      </header>

      <Card variant="glass" className="glass-premium">
        <CardHeader>
          <h2 className="text-sm font-semibold text-white">Profil</h2>
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

      <CreditsUsageCard />

      <Card variant="glass">
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
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Credits</span>
            <span className="font-medium text-zinc-200">{remainingLabel}</span>
          </div>
          {!isAdmin && resetDateLabel && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Erneuerung</span>
              <span className="font-medium text-zinc-200">{resetDateLabel}</span>
            </div>
          )}
          {isAdmin ? null : hasProAccess ? (
            <Button variant="secondary" fullWidth onClick={manageSubscription} className="btn-press">
              Abo verwalten
            </Button>
          ) : (
            <Button
              variant="pro"
              fullWidth
              onClick={() => void openStripeCheckout()}
              className="btn-glow-pro btn-press"
            >
              Upgrade to Pro
            </Button>
          )}
        </CardBody>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <h2 className="text-sm font-semibold text-white">Präferenzen</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-200">Design</p>
              <p className="text-xs text-zinc-500">Dark Premium — optimiert für Creator Workflows</p>
            </div>
            <Badge variant="default">Aktiv</Badge>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-200">Reduzierte Animationen</p>
              <p className="text-xs text-zinc-500">Weniger Bewegung für bessere Performance</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={reducedMotion}
              onClick={toggleReducedMotion}
              className={cn(
                'relative h-7 w-12 shrink-0 rounded-full border transition-smooth',
                reducedMotion
                  ? 'border-violet-500/50 bg-violet-500/30'
                  : 'border-zinc-700 bg-zinc-800/80',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform',
                  reducedMotion ? 'translate-x-5' : 'translate-x-0.5',
                )}
              />
            </button>
          </label>

          <Button variant="ghost" size="sm" onClick={resetOnboarding}>
            Onboarding erneut anzeigen
          </Button>
        </CardBody>
      </Card>

      <Card variant="glass">
        <CardBody className="space-y-3">
          <Button
            variant="ghost"
            fullWidth
            onClick={() => supabase.auth.signOut()}
            className="btn-press justify-start text-zinc-300 hover:text-white"
          >
            <LogOutIcon className="size-4" aria-hidden />
            Abmelden
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onClick={() => setDeleteModalOpen(true)}
            className="btn-press justify-start text-red-400 hover:text-red-300"
          >
            <TrashIcon className="size-4" aria-hidden />
            Account löschen
          </Button>
        </CardBody>
      </Card>

      <DeleteAccountModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        userEmail={user?.email}
      />
    </div>
  )
}
