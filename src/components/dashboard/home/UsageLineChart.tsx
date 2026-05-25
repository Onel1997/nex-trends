import { useMemo } from 'react'
import type { WeeklyUsagePoint } from '@/types/dashboard'
import { cn } from '@/lib'

type UsageLineChartProps = {
  data: WeeklyUsagePoint[]
  className?: string
}

const W = 320
const H = 120
const PAD = { t: 12, r: 8, b: 24, l: 8 }

export function UsageLineChart({ data, className }: UsageLineChartProps) {
  const { path, areaPath, points, max, total } = useMemo(() => {
    const values = data.map((d) => d.value)
    const maxVal = Math.max(...values, 1)
    const totalVal = values.reduce((a, b) => a + b, 0)
    const innerW = W - PAD.l - PAD.r
    const innerH = H - PAD.t - PAD.b

    const pts = data.map((d, i) => {
      const x = PAD.l + (i / Math.max(data.length - 1, 1)) * innerW
      const y = PAD.t + innerH - (d.value / maxVal) * innerH
      return { x, y, label: d.label, value: d.value }
    })

    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const area =
      line +
      ` L ${pts[pts.length - 1]?.x ?? PAD.l} ${PAD.t + innerH} L ${pts[0]?.x ?? PAD.l} ${PAD.t + innerH} Z`

    return { path: line, areaPath: area, points: pts, max: maxVal, total: totalVal }
  }, [data])

  const hasActivity = total > 0

  return (
    <div className={cn('relative', className)}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xl font-semibold tabular-nums tracking-tight text-white">
            {total}
            <span className="ml-1.5 text-xs font-medium text-zinc-500">credits</span>
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">This week</p>
        </div>
        <span className="rounded-md border border-zinc-700/70 bg-zinc-800/50 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
          Peak {max}
        </span>
      </div>

      <div className="dashboard-os-chart-panel relative overflow-hidden rounded-lg border border-zinc-800/60 bg-zinc-950/50 p-2.5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="usage-line-chart relative z-[1] w-full"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="usage-line-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(139 92 246)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="rgb(139 92 246)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="usage-line-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgb(139 92 246)" />
              <stop offset="50%" stopColor="rgb(217 70 239)" />
              <stop offset="100%" stopColor="rgb(139 92 246)" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={PAD.l}
              x2={W - PAD.r}
              y1={PAD.t + (H - PAD.t - PAD.b) * f}
              y2={PAD.t + (H - PAD.t - PAD.b) * f}
              stroke="rgb(63 63 70 / 0.35)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
          ))}
          <path d={areaPath} fill="url(#usage-line-fill)" className="usage-line-chart__area" />
          <path
            d={path}
            fill="none"
            stroke="url(#usage-line-stroke)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="usage-line-chart__line"
          />
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hasActivity && p.value > 0 ? 4.5 : 3}
              className={cn(
                'usage-line-chart__dot',
                hasActivity && p.value > 0 ? 'fill-violet-500' : 'fill-zinc-700',
              )}
            />
          ))}
        </svg>
        <div className="relative z-[1] mt-2 flex justify-between px-1">
          {data.map((d) => (
            <span key={d.label} className="text-[10px] font-medium text-zinc-600">
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
