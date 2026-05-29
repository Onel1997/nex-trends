import { memo, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib'

type AnimatedCounterProps = {
  value: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
  loading?: boolean
}

function AnimatedCounterInner({
  value,
  duration = 900,
  suffix = '',
  prefix = '',
  className,
  loading,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)

  useEffect(() => {
    if (loading) return
    const start = prev.current
    const end = value
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(tick)
      else prev.current = end
    }

    const frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration, loading])

  if (loading) {
    return (
      <span
        className={cn(
          'dashboard-os-counter-skeleton inline-block h-7 w-14 animate-shimmer rounded-lg bg-zinc-800/60 sm:h-8',
          className,
        )}
        aria-hidden
      />
    )
  }

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}

export const AnimatedCounter = memo(AnimatedCounterInner)
