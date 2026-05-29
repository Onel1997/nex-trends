import { memo } from 'react'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib'

type AuditListVariant = 'success' | 'default' | 'accent'

const VARIANT_STYLES: Record<
  AuditListVariant,
  { border: string; bullet: string; title: string; icon?: string }
> = {
  success: {
    border: 'border-emerald-500/20 bg-emerald-500/[0.03]',
    bullet: 'before:bg-emerald-400/90',
    title: 'text-emerald-400/90',
  },
  default: {
    border: 'border-zinc-800/55 bg-zinc-950/35',
    bullet: 'before:bg-zinc-500',
    title: 'text-zinc-500',
  },
  accent: {
    border: 'border-violet-500/22 bg-violet-500/[0.05]',
    bullet: 'before:bg-violet-400',
    title: 'text-violet-400/90',
    icon: '⚡',
  },
}

type LandingAuditListProps = {
  title: string
  items: string[]
  variant: AuditListVariant
  index: number
  animate: boolean
}

function LandingAuditListInner({ title, items, variant, index, animate }: LandingAuditListProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 })
  const styles = VARIANT_STYLES[variant]

  return (
    <div
      ref={ref}
      className={cn(
        'lp-audit-list lp-reveal-section rounded-xl border p-4 sm:p-5',
        styles.border,
        inView && 'lp-reveal-section--visible',
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <h3
        className={cn(
          'flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]',
          styles.title,
        )}
      >
        {styles.icon ? <span aria-hidden>{styles.icon}</span> : null}
        {title}
      </h3>
      <ul className="mt-3.5 space-y-2.5 sm:space-y-3">
        {items.map((item, i) => (
          <li
            key={item}
            className={cn(
              'flex gap-2.5 text-sm leading-relaxed text-zinc-300',
              'before:mt-2 before:size-1.5 before:shrink-0 before:rounded-full before:content-[""]',
              styles.bullet,
              animate && inView && 'lp-audit-list-item',
            )}
            style={animate && inView ? { animationDelay: `${index * 80 + i * 40}ms` } : undefined}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export const LandingAuditList = memo(LandingAuditListInner)
