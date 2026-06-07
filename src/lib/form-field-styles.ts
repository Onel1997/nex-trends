import { cn } from '@/lib/utils'

/**
 * Shared form control styles.
 * `text-base` (16px) on mobile prevents iOS Safari focus zoom; `sm:text-sm` preserves desktop density.
 */
export const formControlClassName = cn(
  'nex-form-control',
  'w-full rounded-xl border border-zinc-800/80 bg-zinc-950/80 px-4',
  'text-base leading-normal text-zinc-100 placeholder:text-zinc-600',
  'sm:text-sm sm:leading-relaxed',
  'transition-smooth',
  'focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/15',
  'disabled:cursor-not-allowed disabled:opacity-50',
)

export const formControlSelectClassName = cn(formControlClassName, 'appearance-none py-2.5')

export const formControlTextareaClassName = cn(
  formControlClassName,
  'touch-manipulation resize-none py-3 [-webkit-overflow-scrolling:touch]',
)
