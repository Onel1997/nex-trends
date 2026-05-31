import type { ReactNode } from 'react'
import { cn } from '@/lib'
import { useInView } from '@/hooks/useInView'

type LandingRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function LandingReveal({ children, className, delay = 0 }: LandingRevealProps) {
  const { ref, inView } = useInView({ threshold: 0.08, rootMargin: '0px 0px -6% 0px' })

  return (
    <div
      ref={ref}
      className={cn('landing-reveal', inView && 'landing-reveal--visible', className)}
      style={{ '--landing-reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
