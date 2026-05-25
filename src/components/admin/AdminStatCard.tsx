import { cn } from '@/lib'

type AdminStatCardProps = {
  label: string
  value: string | number
  hint?: string
  accent?: 'violet' | 'fuchsia' | 'amber' | 'emerald'
  className?: string
}

const accentStyles = {
  violet: 'from-violet-600/20 to-transparent border-violet-500/25',
  fuchsia: 'from-fuchsia-600/20 to-transparent border-fuchsia-500/25',
  amber: 'from-amber-600/20 to-transparent border-amber-500/25',
  emerald: 'from-emerald-600/20 to-transparent border-emerald-500/25',
}

export function AdminStatCard({
  label,
  value,
  hint,
  accent = 'violet',
  className,
}: AdminStatCardProps) {
  return (
    <div
      className={cn(
        'glass-card relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition-smooth hover:-translate-y-0.5',
        accentStyles[accent],
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-white sm:text-3xl">
        {value}
      </p>
      {hint && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}
