import { memo } from 'react'
import { SpinnerInline } from '@/components/ui/Spinner'
import {
  BookmarkIcon,
  CopyIcon,
  DownloadIcon,
} from '@/components/ui/icons'
import type { HookQuickActionId } from '@/hooks/useHookQuickActions'
import { cn } from '@/lib'

type HookQuickActionsProps = {
  onCopyAll: () => void
  onSaveAll: () => void
  onExportTxt: () => void
  loadingAction?: HookQuickActionId | null
  disabled?: boolean
  className?: string
}

type ActionConfig = {
  id: HookQuickActionId
  label: string
  shortLabel: string
  icon: typeof CopyIcon
  onClick: () => void
}

const HookQuickActionButton = memo(function HookQuickActionButton({
  label,
  shortLabel,
  icon: Icon,
  loading,
  disabled,
  onClick,
}: {
  label: string
  shortLabel: string
  icon: typeof CopyIcon
  loading: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={loading}
      className={cn(
        'hook-quick-action-btn group flex min-h-10 flex-1 items-center justify-center gap-1.5',
        'rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-2 py-2 text-[11px] font-semibold',
        'text-zinc-300 transition-smooth touch-manipulation',
        'hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-100',
        'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        loading && 'border-violet-500/25 bg-violet-500/8 text-violet-200',
      )}
    >
      {loading ? (
        <SpinnerInline size="sm" className="size-3.5" />
      ) : (
        <Icon className="size-3.5 shrink-0 text-zinc-500 transition-colors group-hover:text-violet-300" aria-hidden />
      )}
      <span className="truncate sm:hidden">{shortLabel}</span>
      <span className="hidden truncate sm:inline">{label}</span>
    </button>
  )
})

export const HookQuickActions = memo(function HookQuickActions({
  onCopyAll,
  onSaveAll,
  onExportTxt,
  loadingAction = null,
  disabled = false,
  className,
}: HookQuickActionsProps) {
  const isBusy = disabled || loadingAction != null

  const actions: ActionConfig[] = [
    {
      id: 'copy',
      label: 'Alle kopieren',
      shortLabel: 'Kopieren',
      icon: CopyIcon,
      onClick: onCopyAll,
    },
    {
      id: 'save',
      label: 'Alle speichern',
      shortLabel: 'Speichern',
      icon: BookmarkIcon,
      onClick: onSaveAll,
    },
    {
      id: 'export',
      label: 'TXT exportieren',
      shortLabel: 'Export',
      icon: DownloadIcon,
      onClick: onExportTxt,
    },
  ]

  return (
    <div
      className={cn(
        'hook-quick-actions mb-3 overflow-x-clip rounded-xl border border-zinc-800/60',
        'bg-gradient-to-r from-zinc-950/90 via-zinc-950/70 to-zinc-950/90 p-2',
        className,
      )}
      role="toolbar"
      aria-label="Schnellaktionen für Hooks"
    >
      <div className="mb-2 px-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Schnellaktionen
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {actions.map(({ id, label, shortLabel, icon, onClick }) => (
          <HookQuickActionButton
            key={id}
            label={label}
            shortLabel={shortLabel}
            icon={icon}
            loading={loadingAction === id}
            disabled={isBusy && loadingAction !== id}
            onClick={onClick}
          />
        ))}
      </div>
    </div>
  )
})
