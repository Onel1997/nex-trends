import type { WeeklyUsagePoint } from '@/types/dashboard'
import { cn } from '@/lib'

type UsageBarChartProps = {
  data: WeeklyUsagePoint[]
}

export function UsageBarChart({ data }: UsageBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const hasActivity = data.some((d) => d.value > 0)

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
        Wochenübersicht
      </p>
      <div className="flex h-36 items-end justify-between gap-2 rounded-xl border border-zinc-800/50 bg-zinc-950/40 px-4 pb-3 pt-5">
        {data.map((point) => {
          const height = Math.max(6, (point.value / max) * 100)
          return (
            <BarColumn
              key={point.label}
              label={point.label}
              height={height}
              value={point.value}
              dimmed={!hasActivity}
            />
          )
        })}
      </div>
    </div>
  )
}

function BarColumn({
  label,
  height,
  value,
  dimmed,
}: {
  label: string
  height: number
  value: number
  dimmed: boolean
}) {
  return (
    <div className="group flex flex-1 flex-col items-center gap-2.5">
      <div className="relative flex h-full w-full max-w-[2.25rem] flex-col justify-end">
        <div
          className={cn(
            'w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-fuchsia-500 transition-all duration-500 ease-out',
            'group-hover:from-violet-500 group-hover:to-fuchsia-400 group-hover:shadow-[0_0_12px_-2px_rgba(139,92,246,0.5)]',
            dimmed && value === 0 && 'from-zinc-800 to-zinc-700 opacity-50',
          )}
          style={{ height: `${height}%` }}
          title={`${value} Analysen`}
        />
        {value > 0 && (
          <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100">
            {value}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium text-zinc-600">{label}</span>
    </div>
  )
}
