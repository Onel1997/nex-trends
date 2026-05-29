import { Button } from '@/components/ui/Button'
import { CopyIcon, BookmarkIcon, BookmarkFilledIcon } from '@/components/ui/icons'
import {
  coerceErrorMessage,
  formatHookDisplayText,
} from '@/lib/ai/parse-hooks-response'
import { cn } from '@/lib'

type HookResultsListProps = {
  hooks: string[]
  onCopy: (text: string) => void
  onSave?: (text: string, index: number) => void
  savedHooks?: Set<string>
  isSaving?: string | null
  className?: string
}

export function HookResultsList({
  hooks,
  onCopy,
  onSave,
  savedHooks,
  isSaving,
  className,
}: HookResultsListProps) {
  if (hooks.length === 0) return null

  const displayHooks = hooks
    .map((hook) => formatHookDisplayText(hook))
    .filter((hook) => hook.length > 0)

  if (displayHooks.length === 0) return null

  return (
    <ol className={cn('grid gap-3 sm:grid-cols-1', className)}>
      {displayHooks.map((hook, index) => {
        const isSaved = savedHooks?.has(hook) ?? false
        const saving = isSaving === hook

        return (
          <li
            key={`${index}-${hook.slice(0, 24)}`}
            className={cn(
              'group relative overflow-hidden rounded-2xl border border-zinc-800/70 bg-gradient-to-br from-zinc-950/90 to-zinc-900/40 p-4 sm:p-5',
              'transition-smooth hover:border-violet-500/30 hover:shadow-[0_0_32px_-12px_rgba(139,92,246,0.35)]',
              'animate-fade-in',
            )}
            style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'backwards' }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            >
              <div className="absolute -right-8 -top-8 size-24 rounded-full bg-violet-500/10 blur-2xl" />
            </div>

            <div className="relative flex items-start gap-3">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-xs font-bold tabular-nums text-violet-300 ring-1 ring-violet-500/20"
                aria-hidden
              >
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-relaxed text-zinc-100 sm:text-[15px]">
                  {hook}
                </p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                  Viral Hook · {hook.length} Zeichen
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                {onSave && (
                  <button
                    type="button"
                    disabled={saving || isSaved}
                    onClick={() => onSave(hook, index)}
                    className={cn(
                      'rounded-xl p-2 transition-smooth',
                      isSaved
                        ? 'text-amber-400/90'
                        : 'text-zinc-500 hover:bg-zinc-800/80 hover:text-amber-300',
                      'disabled:opacity-60',
                    )}
                    aria-label={isSaved ? 'Hook gespeichert' : `Hook ${index + 1} speichern`}
                  >
                    {isSaved ? (
                      <BookmarkFilledIcon className="size-4" />
                    ) : (
                      <BookmarkIcon className="size-4" />
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onCopy(hook)}
                  className={cn(
                    'rounded-xl p-2 text-zinc-500 transition-smooth',
                    'hover:bg-violet-500/15 hover:text-violet-200',
                  )}
                  aria-label={`Hook ${index + 1} kopieren`}
                >
                  <CopyIcon className="size-4" />
                </button>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

type HookErrorStateProps = {
  message: string
  onRetry: () => void
  className?: string
}

export function HookErrorState({ message, onRetry, className }: HookErrorStateProps) {
  const displayMessage = coerceErrorMessage(message)

  return (
    <div
      role="alert"
      className={cn(
        'rounded-2xl border border-red-500/25 bg-red-500/5 p-5 text-sm text-red-300/90',
        className,
      )}
    >
      <p className="leading-relaxed">{displayMessage}</p>
      <Button variant="secondary" size="sm" onClick={onRetry} className="mt-3">
        Erneut versuchen
      </Button>
    </div>
  )
}

export function HookGeneratingSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse-soft rounded-2xl border border-zinc-800/50 bg-zinc-950/60 p-5"
        >
          <div className="flex gap-3">
            <div className="size-8 shrink-0 rounded-xl bg-zinc-800/80" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-full rounded-lg bg-zinc-800/70" />
              <div className="h-4 w-3/4 rounded-lg bg-zinc-800/50" />
            </div>
          </div>
        </div>
      ))}
      <p className="text-center text-xs text-violet-400/80 animate-pulse-soft">
        AI generiert 10 virale Hooks …
      </p>
    </div>
  )
}
