import { cn } from '@/lib'

type SubscriptionLoadingProps = {
  className?: string
  label?: string
}

export function SubscriptionLoading({
  className,
  label = 'Lade dein Abo …',
}: SubscriptionLoadingProps) {
  return (
    <div
      className={cn(
        'flex min-h-[320px] flex-col items-center justify-center gap-4',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="relative size-10">
        <div
          className="absolute inset-0 rounded-full border-2 border-zinc-800"
          aria-hidden
        />
        <div
          className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-violet-500 border-r-fuchsia-500"
          aria-hidden
        />
      </div>
      <p className="text-sm text-zinc-500">{label}</p>
    </div>
  )
}
