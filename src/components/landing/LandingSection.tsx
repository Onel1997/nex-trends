'use client'

import type { ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type LandingSectionGlow = 'none' | 'top' | 'center' | 'bottom'

type LandingSectionProps = {
  id?: string
  children: ReactNode
  className?: string
  innerClassName?: string
  glow?: LandingSectionGlow
  bordered?: boolean
  ariaLabelledBy?: string
}

export function LandingSection({
  id,
  children,
  className,
  innerClassName,
  glow = 'none',
  bordered = true,
  ariaLabelledBy,
}: LandingSectionProps) {
  const reducedMotion = usePrefersReducedMotion()
  const { ref, inView } = useInView<HTMLElement>({
    rootMargin: '0px 0px 2% 0px',
    threshold: 0,
    once: true,
  })

  const visible = reducedMotion || inView

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        'landing-section-premium relative isolate z-[1] px-4 py-[4.5rem] sm:px-6 sm:py-20 lg:px-8 lg:py-28',
        bordered && 'border-t border-white/[0.04]',
        visible && 'landing-section-premium--visible',
        className,
      )}
    >
      {glow !== 'none' ? (
        <div
          className={cn(
            'landing-section-glow pointer-events-none absolute inset-0 z-0',
            glow === 'top' && 'landing-section-glow--top',
            glow === 'center' && 'landing-section-glow--center',
            glow === 'bottom' && 'landing-section-glow--bottom',
          )}
          aria-hidden
        />
      ) : null}

      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/15 to-transparent',
          !bordered && 'hidden',
        )}
        aria-hidden
      />

      <div className={cn('relative z-[1] mx-auto w-full max-w-6xl', innerClassName)}>{children}</div>
    </section>
  )
}
