import { useEffect, useState } from 'react'
import { cn } from '@/lib'

type EngagementBarProps = {
  score: number
  label?: string
  className?: string
}

export function EngagementBar({ score, label = 'Engagement', className }: EngagementBarProps) {
  const [width, setWidth] = useState(0)
  const clamped = Math.min(100, Math.max(0, score))

  useEffect(() => {
    const t = requestAnimationFrame(() => setWidth(clamped))
    return () => cancelAnimationFrame(t)
  }, [clamped])

  const tone =
    clamped >= 80 ? 'bg-violet-500' : clamped >= 60 ? 'bg-emerald-500' : 'bg-amber-500'

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-medium uppercase tracking-wider text-zinc-500">{label}</span>
        <span className="tabular-nums font-semibold text-zinc-300">{clamped}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800/80">
        <div
          className={cn('h-full rounded-full transition-[width] duration-700 ease-out', tone)}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}
