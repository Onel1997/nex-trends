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
    <div className={cn('mb-5 flex items-center gap-3 sm:mb-6', className)}>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
      >
        <span aria-hidden>←</span>
        Dashboard
      </button>
      <span className="hidden text-sm text-zinc-600 sm:inline">/</span>
      <span className="hidden truncate text-sm font-medium text-zinc-400 sm:inline">
        {label}
      </span>
    </div>
  )
}
