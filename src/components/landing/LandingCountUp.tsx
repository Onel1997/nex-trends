'use client'

import { useCountUp } from '@/hooks/useCountUp'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib'

type LandingCountUpProps = {
  value: string
  className?: string
  duration?: number
}

function parseStatValue(raw: string) {
  const match = raw.match(/^(\d+(?:\.\d+)?)(.*)$/)
  if (!match) return null

  const num = Number(match[1])
  const suffix = match[2] ?? ''
  const decimals = match[1].includes('.') ? match[1].split('.')[1]?.length ?? 1 : 0

  return { num, suffix, decimals }
}

export function LandingCountUp({ value, className, duration = 1400 }: LandingCountUpProps) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.35, once: true })
  const parsed = parseStatValue(value)

  const end = parsed?.num ?? 0
  const animated = useCountUp({
    end,
    duration,
    enabled: inView && parsed !== null,
    decimals: parsed?.decimals ?? 0,
  })

  if (!parsed) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    )
  }

  const display =
    parsed.decimals > 0 ? animated.toFixed(parsed.decimals) : String(animated)

  return (
    <span
      ref={ref}
      className={cn('landing-count-up tabular-nums', inView && 'landing-count-up--active', className)}
    >
      {display}
      {parsed.suffix}
    </span>
  )
}
