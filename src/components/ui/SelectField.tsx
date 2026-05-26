import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib'

const selectStyles =
  'w-full appearance-none rounded-xl border border-zinc-800/80 bg-zinc-950/80 px-4 py-2.5 text-sm text-zinc-100 transition-smooth focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/15 disabled:cursor-not-allowed disabled:opacity-50'

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
        <select id={fieldId} className={cn(selectStyles, 'pr-10')} {...props}>
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
