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
        'nex-btn inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
        'transform-gpu transition-smooth',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70',
        'disabled:pointer-events-none disabled:opacity-50',
        'btn-press',
        fullWidth && 'w-full',
        size === 'sm' && 'px-3.5 py-2 text-xs',
        size === 'md' && 'px-4 py-2.5 text-sm',
        size === 'lg' && 'px-6 py-3 text-sm',
        variant === 'primary' && 'nex-btn--primary btn-glow-primary',
        variant === 'secondary' && 'nex-btn--secondary',
        variant === 'ghost' && 'nex-btn--ghost',
        variant === 'pro' && 'nex-btn--pro btn-glow-pro gradient-accent',
        className,
      )}
      {...props}
    >
      {loading && <SpinnerInline size="sm" />}
      {children}
    </button>
  )
}
