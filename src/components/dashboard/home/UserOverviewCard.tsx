import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { CrownIcon } from '@/components/ui/icons'
import { useDashboardData } from '@/hooks/useDashboardData'
import { cn } from '@/lib'

export function UserOverviewCard() {
  const { user, hasProAccess, statusLabel, remainingLabel, planLabel } =
    useDashboardData()

  if (!user) return null

  return (
    <Card hover className="animate-fade-in overflow-hidden">
      <div
        className="pointer-events-none h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent"
        aria-hidden
      />
      <CardBody className="py-6 sm:py-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl gradient-accent text-lg font-bold text-white shadow-lg shadow-violet-900/30 ring-1 ring-white/10">
              {user.avatarInitials}
              {hasProAccess && (
                <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-fuchsia-500 ring-2 ring-zinc-900">
                  <CrownIcon className="size-2.5 text-white" aria-hidden />
                </span>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-white">{user.name}</h2>
                {hasProAccess && (
                  <Badge variant="pro">
                    <CrownIcon className="mr-1 inline size-3" aria-hidden />
                    Pro
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <StatPill label="Plan" value={planLabel} />
            <StatPill label="Status" value={statusLabel} highlight={hasProAccess} />
            <StatPill label="Credits" value={remainingLabel} className="col-span-2" />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

function StatPill({
  label,
  value,
  highlight = false,
  className,
}: {
  label: string
  value: string
  highlight?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-800/60 bg-zinc-950/50 px-4 py-3 transition-smooth hover:border-zinc-700/60',
        highlight && 'border-violet-500/20 bg-violet-500/5',
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold tracking-tight text-white">{value}</p>
    </div>
  )
}
