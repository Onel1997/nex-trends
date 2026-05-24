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
        className="pointer-events-none h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600"
        aria-hidden
      />
      <CardBody>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-lg font-bold text-white shadow-lg shadow-violet-900/30">
              {user.avatarInitials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-white">{user.name}</h2>
                {hasProAccess && (
                  <Badge variant="pro">
                    <CrownIcon className="mr-1 inline size-3" aria-hidden />
                    Pro
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-sm text-zinc-400">{user.email}</p>
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
        'rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-3 py-2.5',
        highlight && 'border-violet-500/20 bg-violet-500/5',
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}
