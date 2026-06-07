import type { ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib'

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const { ref, inView } = useInView({ once: true })

  return (
    <div
      ref={ref}
      className={cn('nex-reveal-scroll', inView && 'nex-reveal-scroll--visible', className)}
      style={{ ['--nex-reveal-delay' as string]: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
