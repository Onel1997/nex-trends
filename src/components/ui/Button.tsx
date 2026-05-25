import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib'
import { SpinnerInline } from '@/components/ui/Spinner'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'pro'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-smooth',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70',
        'disabled:pointer-events-none disabled:opacity-50',
        'btn-press active:scale-[0.98]',
        fullWidth && 'w-full',
        size === 'sm' && 'px-3.5 py-2 text-xs',
        size === 'md' && 'px-4 py-2.5 text-sm',
        size === 'lg' && 'px-6 py-3 text-sm',
        variant === 'primary' &&
          'bg-violet-600 text-white shadow-sm shadow-violet-900/25 hover:bg-violet-500 hover:shadow-md hover:shadow-violet-900/30',
        variant === 'secondary' &&
          'border border-zinc-800/80 bg-zinc-900/60 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800/80',
        variant === 'ghost' &&
          'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100',
        variant === 'pro' &&
          'gradient-accent text-white shadow-lg shadow-violet-900/30 hover:shadow-xl hover:shadow-violet-900/40 hover:brightness-110',
        className,
      )}
      {...props}
    >
      {loading && <SpinnerInline size="sm" />}
      {children}
    </button>
  )
}
