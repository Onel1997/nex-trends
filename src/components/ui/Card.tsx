import type { ReactNode } from 'react'
import { cn } from '@/lib'

type CardProps = {
  children: ReactNode
  className?: string
  hover?: boolean
  variant?: 'default' | 'glass' | 'elevated'
}

const variants = {
  default:
    'rounded-2xl border border-zinc-800/60 bg-zinc-900/40 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] backdrop-blur-xl',
  glass: 'glass-card',
  elevated:
    'rounded-2xl border border-zinc-800/50 bg-zinc-900/50 shadow-lg shadow-black/20 backdrop-blur-xl',
}

export function Card({
  children,
  className,
  hover = false,
  variant = 'default',
}: CardProps) {
  return (
    <div
      className={cn(
        variants[variant],
        'nex-card-interactive',
        hover &&
          'transition-smooth hover:border-zinc-700/70 hover:bg-zinc-900/55 hover:shadow-lg hover:shadow-violet-950/10',
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
    <div
      className={cn(
        'nex-card-header border-b border-zinc-800/50 px-4 py-3.5 sm:px-6 sm:py-5',
        className,
      )}
    >
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
  return <div className={cn('nex-card-body p-4 sm:p-6', className)}>{children}</div>
}
