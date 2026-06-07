import type { ReactNode } from 'react'
import { cn } from '@/lib'
import type { PlatformFilter, StatusFilter } from '@/types/ai-video-library'

const PLATFORMS: { id: PlatformFilter; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'youtube', label: 'YouTube' },
]

const STATUSES: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Alle Status' },
  { id: 'completed', label: 'Fertig' },
  { id: 'generating', label: 'Generiert' },
  { id: 'queued', label: 'Warteschlange' },
  { id: 'failed', label: 'Fehlgeschlagen' },
]

type VideoLibraryFiltersProps = {
  platform: PlatformFilter
  status: StatusFilter
  onPlatformChange: (value: PlatformFilter) => void
  onStatusChange: (value: StatusFilter) => void
  className?: string
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-smooth',
        active
          ? 'border-violet-500/50 bg-violet-500/15 text-violet-200 shadow-[0_0_20px_-6px_rgba(139,92,246,0.5)]'
          : 'border-zinc-800/70 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200',
      )}
    >
      {children}
    </button>
  )
}

export function VideoLibraryFilters({
  platform,
  status,
  onPlatformChange,
  onStatusChange,
  className,
}: VideoLibraryFiltersProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((p) => (
          <FilterPill
            key={p.id}
            active={platform === p.id}
            onClick={() => onPlatformChange(p.id)}
          >
            {p.label}
          </FilterPill>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <FilterPill
            key={s.id}
            active={status === s.id}
            onClick={() => onStatusChange(s.id)}
          >
            {s.label}
          </FilterPill>
        ))}
      </div>
    </div>
  )
}
