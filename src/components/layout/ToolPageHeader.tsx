import { getRouteConfig, type DashboardToolId } from '@/lib/routes'
import { cn } from '@/lib'

const HIDDEN_HEADER_TOOLS: DashboardToolId[] = ['dashboard', 'trend-intelligence']

type ToolPageHeaderProps = {
  activeTool: DashboardToolId
  onBack: () => void
  className?: string
}

export function ToolPageHeader({ activeTool, onBack, className }: ToolPageHeaderProps) {
  if (HIDDEN_HEADER_TOOLS.includes(activeTool)) return null

  const label = getRouteConfig(activeTool).label

  return (
    <div className={cn('mb-5 flex items-center gap-3 sm:mb-8', className)}>
      <button
        type="button"
        onClick={onBack}
        className="nex-touch-target inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-800/60 bg-zinc-900/50 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-smooth hover:border-zinc-700/80 hover:bg-zinc-800/60 hover:text-white active:scale-[0.98]"
      >
        <span aria-hidden className="text-zinc-500">←</span>
        Dashboard
      </button>
      <span className="hidden text-sm text-zinc-700 sm:inline">/</span>
      <span className="hidden truncate text-sm font-medium text-zinc-400 sm:inline">
        {label}
      </span>
    </div>
  )
}
