import type { WeeklyUsagePoint } from '@/types/dashboard'

type UsageBarChartProps = {
  data: WeeklyUsagePoint[]
}

export function UsageBarChart({ data }: UsageBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Wochenübersicht
      </p>
      <div className="flex h-32 items-end justify-between gap-2 rounded-xl border border-zinc-800/60 bg-zinc-950/40 px-3 pb-3 pt-4">
        {data.map((point) => {
          const height = Math.max(8, (point.value / max) * 100)
          return (
            <BarColumn
              key={point.label}
              label={point.label}
              height={height}
              value={point.value}
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
}: {
  label: string
  height: number
  value: number
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div
        className="group relative w-full max-w-[2rem] rounded-t-md bg-gradient-to-t from-violet-600 to-fuchsia-500 transition-all duration-500 hover:from-violet-500 hover:to-fuchsia-400"
        style={{ height: `${height}%` }}
        title={`${value} Analysen`}
      />
      <span className="text-[10px] font-medium text-zinc-500">{label}</span>
    </div>
  )
}
