'use client'

import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

type UseCountUpOptions = {
  end: number
  duration?: number
  enabled?: boolean
  decimals?: number
}

export function useCountUp({
  end,
  duration = 1400,
  enabled = true,
  decimals = 0,
}: UseCountUpOptions) {
  const reducedMotion = usePrefersReducedMotion()
  const [value, setValue] = useState(reducedMotion ? end : 0)

  useEffect(() => {
    if (reducedMotion || !enabled) {
      setValue(end)
      return
    }

    let frame = 0
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const next = end * easeOutCubic(progress)
      setValue(decimals > 0 ? Math.round(next * 10 ** decimals) / 10 ** decimals : Math.round(next))

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [decimals, duration, enabled, end, reducedMotion])

  return value
}
