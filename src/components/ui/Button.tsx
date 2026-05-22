import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'pro'
  fullWidth?: boolean
}

export function Button({
  className,
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 disabled:pointer-events-none disabled:opacity-50',
        fullWidth && 'w-full',
        variant === 'primary' &&
          'bg-violet-600 text-white hover:bg-violet-500 active:bg-violet-700',
        variant === 'secondary' &&
          'border border-zinc-700 bg-zinc-800/80 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800',
        variant === 'pro' &&
          'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-900/40 hover:from-violet-500 hover:to-fuchsia-500',
        className,
      )}
      {...props}
    />
  )
}
