import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ClockIcon, SparklesIcon } from '@/components/ui/icons'
import { cn } from '@/lib'
import type { GeneratedHooksRow } from '@/types/ai-generation'

type HookHistoryPanelProps = {
  history: GeneratedHooksRow[]
  isLoading: boolean
  activeId?: string | null
  onSelect: (row: GeneratedHooksRow) => void
  className?: string
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function HookHistoryPanel({
  history,
  isLoading,
  activeId,
  onSelect,
  className,
}: HookHistoryPanelProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <EmptyState
        title="Noch kein Verlauf"
        description="Deine Hook-Generierungen erscheinen hier — wiederverwendbar mit einem Klick."
        icon={<ClockIcon className="size-5 text-violet-400/70" aria-hidden />}
        size="compact"
        className="border-zinc-800/50"
      />
    )
  }

  return (
    <ul className={cn('space-y-2', className)}>
      {history.map((row) => {
        const hookCount = row.generated_hooks_json?.length ?? 0
        const isActive = activeId === row.id

        return (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onSelect(row)}
              className={cn(
                'w-full rounded-xl border px-4 py-3 text-left transition-smooth',
                isActive
                  ? 'border-violet-500/40 bg-violet-500/10'
                  : 'border-zinc-800/70 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/40',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-200">{row.topic}</p>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    {row.tone} · {row.platform} · {hookCount} Hooks
                  </p>
                </div>
                <span className="shrink-0 text-[10px] tabular-nums text-zinc-600">
                  {formatDate(row.created_at)}
                </span>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

type HookSavedPanelProps = {
  hooks: Array<{ id: string; hook_text: string; topic: string | null; saved_at: string }>
  isLoading: boolean
  onCopy: (text: string) => void
  onRemove: (id: string) => void
  className?: string
}

export function HookSavedPanel({
  hooks,
  isLoading,
  onCopy,
  onRemove,
  className,
}: HookSavedPanelProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    )
  }

  if (hooks.length === 0) {
    return (
      <EmptyState
        title="Keine gespeicherten Hooks"
        description="Speichere deine besten Hooks — sie landen hier für schnellen Zugriff."
        icon={<SparklesIcon className="size-5 text-violet-400/70" aria-hidden />}
        size="compact"
        className="border-zinc-800/50"
      />
    )
  }

  return (
    <ul className={cn('space-y-2', className)}>
      {hooks.map((hook) => (
        <li
          key={hook.id}
          className="rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-3"
        >
          <p className="text-sm leading-relaxed text-zinc-200">{hook.hook_text}</p>
          {hook.topic && (
            <p className="mt-1 text-[10px] uppercase tracking-widest text-zinc-600">
              {hook.topic}
            </p>
          )}
          <div className="mt-2 flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onCopy(hook.hook_text)}>
              Kopieren
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onRemove(hook.id)}>
              Entfernen
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
