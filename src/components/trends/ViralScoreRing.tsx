import { useEffect, useState } from 'react'
import { cn } from '@/lib'
import { getViralScoreTone } from '@/lib/trend-intelligence'

type ViralScoreRingProps = {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animate?: boolean
  className?: string
}

const SIZES = {
  sm: { box: 'size-9', text: 'text-[10px]', r: 16, stroke: 2.5, view: 36 },
  md: { box: 'size-14', text: 'text-xs', r: 24, stroke: 3, view: 56 },
  lg: { box: 'size-20', text: 'text-sm', r: 34, stroke: 3.5, view: 80 },
} as const

export function ViralScoreRing({
  score,
  size = 'sm',
  showLabel = false,
  animate = true,
  className,
}: ViralScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score)
  const tone = getViralScoreTone(score)
  const cfg = SIZES[size]
  const circumference = 2 * Math.PI * cfg.r
  const offset = circumference - (displayScore / 100) * circumference

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score)
      return
    }
    const start = performance.now()
    const duration = 900
    let frame: number

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayScore(Math.round(score * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [score, animate])

  return (
    <div className={cn('relative flex shrink-0 flex-col items-center', className)}>
      <div className={cn('relative flex items-center justify-center', cfg.box)}>
        <svg
          className={cn(cfg.box, '-rotate-90')}
          viewBox={`0 0 ${cfg.view} ${cfg.view}`}
          aria-hidden
        >
          <circle
            cx={cfg.view / 2}
            cy={cfg.view / 2}
            r={cfg.r}
            fill="none"
            strokeWidth={cfg.stroke}
            className="stroke-zinc-800/80"
          />
          <circle
            cx={cfg.view / 2}
            cy={cfg.view / 2}
            r={cfg.r}
            fill="none"
            strokeWidth={cfg.stroke}
            strokeLinecap="round"
            className={cn('transition-[stroke-dashoffset] duration-300', tone.ringClass)}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span
          className={cn(
            'absolute font-bold tabular-nums text-white',
            cfg.text,
            tone.textClass,
          )}
        >
          {displayScore}
        </span>
      </div>
      {showLabel && (
        <span className="mt-1 text-[9px] font-medium uppercase tracking-wider text-zinc-500">
          {tone.label}
        </span>
      )}
    </div>
  )
}
