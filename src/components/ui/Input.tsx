import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import {
  formControlClassName,
  formControlTextareaClassName,
} from '@/lib/form-field-styles'
import { cn } from '@/lib'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  inputClassName?: string
}

export function Input({ className, inputClassName, ...props }: InputProps) {
  return (
    <input
      className={cn(formControlClassName, 'min-h-11 py-2.5', className, inputClassName)}
      {...props}
    />
  )
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={cn(formControlTextareaClassName, className)} {...props} />
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
        className={cn(
          formControlClassName,
          'min-h-12 py-3 pl-11 pr-4 sm:min-h-11 sm:py-2.5',
          inputClassName,
        )}
        {...props}
      />
    </div>
  )
}
