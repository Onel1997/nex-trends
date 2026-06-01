'use client'

import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib'

type LandingRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  /** Fade distance in px (default 18) */
  distance?: number
}

export function LandingReveal({
  children,
  className,
  delay = 0,
  distance = 18,
}: LandingRevealProps) {
  const reducedMotion = usePrefersReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>({
    rootMargin: '0px 0px 2% 0px',
    threshold: 0,
    once: true,
  })

  const visible = reducedMotion || inView

  return (
    <div
      ref={ref}
      className={cn('landing-reveal', visible && 'landing-reveal--visible', className)}
      style={
        {
          '--landing-reveal-delay': `${delay}ms`,
          '--landing-reveal-y': `${distance}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}
