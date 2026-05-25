import { HOOK_STYLE_OPTIONS } from '@/lib/hook-styles'
import type { TrendHookStyle } from '@/lib/openai'
import { cn } from '@/lib'

type HookStylePickerProps = {
  value: TrendHookStyle
  onChange: (style: TrendHookStyle) => void
  disabled?: boolean
  className?: string
}

export function HookStylePicker({
  value,
  onChange,
  disabled = false,
  className,
}: HookStylePickerProps) {
  return (
    <div
      className={cn('grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5', className)}
      role="group"
      aria-label="Hook-Stil"
    >
      {HOOK_STYLE_OPTIONS.map((s) => (
        <button
          key={s.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(s.id)}
          className={cn(
            'rounded-xl border px-3 py-2.5 text-left transition-smooth',
            'disabled:pointer-events-none disabled:opacity-50',
            value === s.id
              ? 'border-violet-500/40 bg-violet-500/10 text-violet-100'
              : 'border-zinc-800/80 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200',
          )}
        >
          <span className="block text-xs font-semibold">{s.label}</span>
          <span className="block text-[10px] leading-snug text-zinc-500">{s.desc}</span>
        </button>
      ))}
    </div>
  )
}
