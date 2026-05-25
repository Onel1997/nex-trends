import { Button } from '@/components/ui/Button'
import { CopyIcon } from '@/components/ui/icons'
import { cn } from '@/lib'

type HookResultsListProps = {
  hooks: string[]
  onCopy: (text: string) => void
  className?: string
}

export function HookResultsList({ hooks, onCopy, className }: HookResultsListProps) {
  if (hooks.length === 0) return null

  return (
    <ol className={cn('space-y-2.5 animate-fade-in', className)}>
      {hooks.map((hook, index) => (
        <li
          key={`${index}-${hook.slice(0, 24)}`}
          className="group flex items-start gap-2 rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-3 sm:p-4"
        >
          <span
            className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-[11px] font-bold tabular-nums text-violet-300"
            aria-hidden
          >
            {index + 1}
          </span>
          <p className="min-w-0 flex-1 text-sm leading-relaxed text-zinc-200">{hook}</p>
          <button
            type="button"
            onClick={() => onCopy(hook)}
            className={cn(
              'shrink-0 rounded-lg p-2 text-zinc-500 transition-smooth',
              'hover:bg-zinc-800 hover:text-white',
              'sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100',
            )}
            aria-label={`Hook ${index + 1} kopieren`}
          >
            <CopyIcon className="size-4" />
          </button>
        </li>
      ))}
    </ol>
  )
}

type HookErrorStateProps = {
  message: string
  onRetry: () => void
  className?: string
}

export function HookErrorState({ message, onRetry, className }: HookErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border border-red-500/25 bg-red-500/5 p-4 text-sm text-red-300/90',
        className,
      )}
    >
      <p className="leading-relaxed">{message}</p>
      <Button variant="secondary" size="sm" onClick={onRetry} className="mt-3">
        Erneut versuchen
      </Button>
    </div>
  )
}
