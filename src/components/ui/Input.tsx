import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib'

const fieldStyles =
  'w-full rounded-xl border border-zinc-800/80 bg-zinc-950/80 px-4 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 transition-smooth focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/15 disabled:cursor-not-allowed disabled:opacity-50'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  inputClassName?: string
}

export function Input({ className, inputClassName, ...props }: InputProps) {
  return (
    <input className={cn(fieldStyles, 'min-h-11 py-2.5', className, inputClassName)} {...props} />
  )
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(fieldStyles, 'resize-none px-4 py-3', className)}
      {...props}
    />
  )
}

export function InputWithIcon({
  icon,
  className,
  inputClassName,
  ...props
}: InputProps & { icon: ReactNode }) {
  return (
    <div className={cn('relative', className)}>
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
        {icon}
      </span>
      <input
        className={cn(fieldStyles, 'min-h-12 py-3 pl-11 pr-4 sm:min-h-11', inputClassName)}
        {...props}
      />
    </div>
  )
}
