import { cn } from '@/lib'
import type { TrendCategoryFilter, TrendPlatformFilter } from '@/lib/trend-signals'

export type { TrendCategoryFilter, TrendPlatformFilter }

const PLATFORMS: { id: TrendPlatformFilter; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'youtube', label: 'YouTube' },
]

const CATEGORIES: { id: TrendCategoryFilter; label: string }[] = [
  { id: 'all', label: 'Alle Nischen' },
  { id: 'ecommerce', label: 'E-Commerce' },
  { id: 'ai', label: 'AI' },
  { id: 'local', label: 'Local Business' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'finance', label: 'Finance' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'saas', label: 'SaaS' },
]

type TrendFilterBarProps = {
  platform: TrendPlatformFilter
  category: TrendCategoryFilter
  onPlatformChange: (platform: TrendPlatformFilter) => void
  onCategoryChange: (category: TrendCategoryFilter) => void
  disabled?: boolean
  className?: string
}

export function TrendFilterBar({
  platform,
  category,
  onPlatformChange,
  onCategoryChange,
  disabled = false,
  className,
}: TrendFilterBarProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Plattform
        </p>
        <div className="flex gap-2 overflow-x-auto pb-0.5 scroll-smooth-mobile [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PLATFORMS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={platform === item.id}
              disabled={disabled}
              onClick={() => onPlatformChange(item.id)}
              className={cn(
                'shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-smooth touch-manipulation',
                'disabled:cursor-not-allowed disabled:opacity-50',
                platform === item.id
                  ? 'bg-violet-500/15 text-violet-200 ring-1 ring-inset ring-violet-500/35 shadow-[0_0_24px_-10px_rgba(139,92,246,0.55)]'
                  : 'bg-zinc-900/60 text-zinc-400 ring-1 ring-zinc-800/60 hover:text-zinc-200',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Nische / Kategorie
        </p>
        <div className="flex gap-2 overflow-x-auto pb-0.5 scroll-smooth-mobile [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              disabled={disabled}
              onClick={() => onCategoryChange(item.id)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-smooth touch-manipulation',
                'disabled:cursor-not-allowed disabled:opacity-50',
                category === item.id
                  ? 'border-violet-500/35 bg-violet-500/12 text-violet-200'
                  : 'border border-zinc-800/70 bg-zinc-950/50 text-zinc-500 hover:border-violet-500/20 hover:text-zinc-300',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
