import type { ReactNode } from 'react'
import { cn } from '@/lib'

type CardProps = {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm',
        hover && 'transition-all duration-300 hover:border-zinc-700/80 hover:bg-zinc-900/70',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('border-b border-zinc-800/60 px-5 py-4 sm:px-6', className)}>
      {children}
    </div>
  )
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('p-5 sm:p-6', className)}>{children}</div>
}
