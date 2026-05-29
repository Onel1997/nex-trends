import type { SelectHTMLAttributes } from 'react'
import { formControlSelectClassName } from '@/lib/form-field-styles'
import { cn } from '@/lib'

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: { value: string; label: string }[]
  hint?: string
}

export function SelectField({
  label,
  options,
  hint,
  className,
  id,
  ...props
}: SelectFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={className}>
      <label
        htmlFor={fieldId}
        className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-600"
      >
        {label}
      </label>
      <div className="relative">
        <select id={fieldId} className={cn(formControlSelectClassName, 'pr-10')} {...props}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
          aria-hidden
        >
          ▾
        </span>
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-zinc-500">{hint}</p>}
    </div>
  )
}
