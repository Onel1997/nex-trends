import { memo } from 'react'
import { AnimatedScoreBar } from '@/components/landing-analyzer/AnimatedScoreBar'
import { getCroScoreTone } from '@/lib/landing-audit-score'
import { useInView } from '@/hooks/useInView'
import type { LandingAuditCategory } from '@/lib/landing-page-analyzer'
import { cn } from '@/lib'

type CategoryCardProps = {
  cat: LandingAuditCategory
  index: number
  animate: boolean
}

const CategoryCard = memo(function CategoryCard({ cat, index, animate }: CategoryCardProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 })
  const tone = getCroScoreTone(cat.score)
  const shouldAnimate = animate && inView

  return (
    <div
      ref={ref}
      className={cn(
        'lp-audit-category nex-card-interactive rounded-xl border border-zinc-800/50 bg-zinc-950/55 p-4 sm:p-4.5',
        'lp-reveal-section',
        inView && 'lp-reveal-section--visible',
      )}
      style={{ transitionDelay: `${index * 55}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold tracking-tight text-white">{cat.name}</span>
        <span className={cn('text-sm font-bold tabular-nums', tone.textClass)}>{cat.score}</span>
      </div>
      <AnimatedScoreBar score={cat.score} animate={shouldAnimate} />
      <p className="mt-2.5 text-xs leading-relaxed text-zinc-500">{cat.note}</p>
    </div>
  )
})

type LandingAuditCategoryGridProps = {
  categories: LandingAuditCategory[]
  animate: boolean
}

function LandingAuditCategoryGridInner({ categories, animate }: LandingAuditCategoryGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3">
      {categories.map((cat, i) => (
        <CategoryCard key={cat.name} cat={cat} index={i} animate={animate} />
      ))}
    </div>
  )
}

export const LandingAuditCategoryGrid = memo(LandingAuditCategoryGridInner)
