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
        'nex-btn inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold tracking-[-0.01em]',
        'transform-gpu whitespace-nowrap',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/50',
        'disabled:pointer-events-none disabled:opacity-50',
        fullWidth && 'w-full',
        size === 'sm' && 'min-h-8 px-3.5 py-1.5 text-xs',
        size === 'md' && 'min-h-[2.375rem] px-4 py-2 text-sm',
        size === 'lg' && 'min-h-[2.625rem] px-5 py-2.5 text-sm',
        variant === 'primary' && 'nex-btn--primary',
        variant === 'secondary' && 'nex-btn--secondary',
        variant === 'ghost' && 'nex-btn--ghost',
        variant === 'pro' && 'nex-btn--pro',
        className,
      )}
      {...props}
    >
      {loading && <SpinnerInline size="sm" />}
      {children}
    </button>
  )
}
