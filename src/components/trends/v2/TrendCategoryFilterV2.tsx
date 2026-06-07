import { cn } from '@/lib'
import type { TrendCategoryFilterV2 } from '@/lib/trend-v2'
import { TREND_CATEGORIES_V2, TREND_CATEGORY_V2_LABELS } from '@/types/trend-v2'

type TrendCategoryFilterV2Props = {
  category: TrendCategoryFilterV2
  onCategoryChange: (category: TrendCategoryFilterV2) => void
  counts?: Partial<Record<TrendCategoryFilterV2, number>>
  disabled?: boolean
  className?: string
}

const FILTER_ITEMS: { id: TrendCategoryFilterV2; label: string }[] = [
  { id: 'all', label: 'Alle' },
  ...TREND_CATEGORIES_V2.map((id) => ({
    id,
    label: TREND_CATEGORY_V2_LABELS[id],
  })),
]

export function TrendCategoryFilterV2({
  category,
  onCategoryChange,
  counts,
  disabled = false,
  className,
}: TrendCategoryFilterV2Props) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
        Kategorie
      </p>
      <div className="ti-v2-filter-scroll flex gap-2 overflow-x-auto flex-nowrap pb-0.5 snap-x snap-mandatory scrollbar-hide touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTER_ITEMS.map((item) => {
          const count = counts?.[item.id]
          const isActive = category === item.id

          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isActive}
              disabled={disabled}
              onClick={() => onCategoryChange(item.id)}
              className={cn(
                'shrink-0 snap-start rounded-full px-3.5 py-2 text-[11px] font-semibold transition-smooth touch-manipulation',
                'disabled:cursor-not-allowed disabled:opacity-50',
                isActive
                  ? 'bg-violet-500/15 text-violet-100 ring-1 ring-inset ring-violet-500/40 shadow-[0_0_24px_-10px_rgba(139,92,246,0.55)]'
                  : 'bg-zinc-900/70 text-zinc-500 ring-1 ring-zinc-800/70 hover:text-zinc-300',
              )}
            >
              {item.label}
              {typeof count === 'number' && count > 0 && (
                <span className={cn('ml-1.5 tabular-nums', isActive ? 'text-violet-300/80' : 'text-zinc-600')}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
