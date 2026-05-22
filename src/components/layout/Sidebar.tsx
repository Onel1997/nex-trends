import { Button } from '@/components/ui/Button'
import { CreditIcon, CrownIcon, ToolIcon } from '@/components/ui/icons'
import {
  APP_NAME,
  DEFAULT_CREDITS,
  MAX_CREDITS,
  NAV_TOOLS,
  PRO_PRICE_LABEL,
  type NavToolId,
} from '@/lib'
import { cn } from '@/lib'

type SidebarProps = {
  activeTool: NavToolId
  onSelectTool: (id: NavToolId) => void
  credits?: number
  className?: string
}

export function Sidebar({
  activeTool,
  onSelectTool,
  credits = DEFAULT_CREDITS,
  className,
}: SidebarProps) {
  const creditPercent = Math.min(100, Math.round((credits / MAX_CREDITS) * 100))

  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col border-r border-zinc-800/80 bg-zinc-950',
        className,
      )}
    >
      <div className="border-b border-zinc-800/80 px-4 py-5 lg:px-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-sm font-bold text-white shadow-lg shadow-violet-900/30">
            N
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-white">
              {APP_NAME}
            </p>
            <p className="truncate text-xs text-zinc-500">Marketing AI Suite</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 lg:px-4" aria-label="Werkzeuge">
        <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Werkzeuge
        </p>
        <ul className="space-y-1">
          {NAV_TOOLS.map((tool) => {
            const isActive = activeTool === tool.id
            return (
              <li key={tool.id}>
                <button
                  type="button"
                  onClick={() => onSelectTool(tool.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                    isActive
                      ? 'bg-violet-600/15 text-violet-200 ring-1 ring-inset ring-violet-500/30'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200',
                  )}
                >
                  <ToolIcon
                    toolId={tool.id}
                    className={cn(
                      'size-5 shrink-0',
                      isActive ? 'text-violet-400' : 'text-zinc-500',
                    )}
                  />
                  <span className="leading-snug">{tool.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="space-y-3 border-t border-zinc-800/80 p-4 lg:p-5">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CreditIcon className="size-4 text-violet-400" />
              <span className="text-xs font-medium text-zinc-400">Credits</span>
            </div>
            <span className="text-sm font-semibold text-white">
              {credits}
              <span className="font-normal text-zinc-500"> / {MAX_CREDITS}</span>
            </span>
          </div>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800"
            role="progressbar"
            aria-valuenow={credits}
            aria-valuemin={0}
            aria-valuemax={MAX_CREDITS}
            aria-label="Verbleibende Credits"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all"
              style={{ width: `${creditPercent}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
            Jedes Tool verbraucht 1 Credit. Mit Pro unbegrenzt.
          </p>
        </div>

        <Button variant="pro" fullWidth>
          <CrownIcon className="size-4" />
          Pro-Abo · {PRO_PRICE_LABEL}
        </Button>
      </div>
    </aside>
  )
}
