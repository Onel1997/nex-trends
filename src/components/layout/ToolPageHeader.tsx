import { SIDEBAR_ITEMS, type DashboardToolId } from '@/lib'
import { cn } from '@/lib'

type ToolPageHeaderProps = {
  activeTool: DashboardToolId
  onBack: () => void
  className?: string
}

export function ToolPageHeader({ activeTool, onBack, className }: ToolPageHeaderProps) {
  if (activeTool === 'trends') return null

  const label =
    SIDEBAR_ITEMS.find((item) => item.id === activeTool)?.label ?? 'Tool'

  return (
    <div className={cn('mb-6 flex items-center gap-3 sm:mb-8', className)}>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-800/60 bg-zinc-900/50 px-3.5 py-2 text-sm font-medium text-zinc-300 transition-smooth hover:border-zinc-700/80 hover:bg-zinc-800/60 hover:text-white active:scale-[0.98]"
      >
        <span aria-hidden className="text-zinc-500 transition-smooth group-hover:text-zinc-300">
          ←
        </span>
        Dashboard
      </button>
      <span className="hidden text-sm text-zinc-700 sm:inline">/</span>
      <span className="hidden truncate text-sm font-medium text-zinc-400 sm:inline">
        {label}
      </span>
    </div>
  )
}
