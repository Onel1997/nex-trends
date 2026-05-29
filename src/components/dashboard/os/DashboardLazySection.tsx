import { memo, useEffect, useRef, useState, type ReactNode } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib'

type DashboardLazySectionProps = {
  children: ReactNode
  className?: string
  minHeight?: string
  skeleton?: ReactNode
}

function DefaultSectionSkeleton({ minHeight }: { minHeight: string }) {
  return (
    <div className="dashboard-os-lazy-placeholder w-full min-w-0" style={{ minHeight }}>
      <Skeleton className="h-full min-h-[inherit] w-full rounded-[var(--dash-radius-lg)]" />
    </div>
  )
}

function DashboardLazySectionInner({
  children,
  className,
  minHeight = '8rem',
  skeleton,
}: DashboardLazySectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '140px 0px', threshold: 0.01 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={cn('dashboard-os-lazy-section w-full min-w-0', className)}>
      {visible ? (
        children
      ) : (
        skeleton ?? <DefaultSectionSkeleton minHeight={minHeight} />
      )}
    </div>
  )
}

export const DashboardLazySection = memo(DashboardLazySectionInner)
