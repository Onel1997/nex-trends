import type { ReactNode } from 'react'
import { cn } from '@/lib'

type BadgeProps = {
  children: ReactNode
  variant?: 'default' | 'pro' | 'success' | 'warning' | 'muted'
  className?: string
}

const variants = {
  default: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
  pro: 'border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-200',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  muted: 'border-zinc-700 bg-zinc-800/80 text-zinc-400',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
