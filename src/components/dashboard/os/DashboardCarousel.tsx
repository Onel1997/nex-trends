import type { ReactNode } from 'react'
import { cn } from '@/lib'

export type DashboardCarouselItemVariant = 'action' | 'product' | 'product-flagship' | 'media'

type DashboardCarouselProps = {
  children: ReactNode
  /** Tailwind grid classes from breakpoint up (e.g. `sm:grid sm:grid-cols-2`) */
  gridClassName?: string
  /** When set, carousel track becomes `display: contents` from this breakpoint */
  gridFrom?: 'sm' | 'md'
  className?: string
}

type DashboardCarouselItemProps = {
  children: ReactNode
  variant?: DashboardCarouselItemVariant
  className?: string
}

export function DashboardCarousel({
  children,
  gridClassName,
  gridFrom,
  className,
}: DashboardCarouselProps) {
  return (
    <div
      className={cn(
        'dashboard-os-carousel',
        gridClassName,
        className,
      )}
    >
      <div
        className={cn(
          'dashboard-os-carousel__track',
          gridFrom === 'sm' && 'sm:contents sm:overflow-visible sm:pb-0',
          gridFrom === 'md' && 'md:contents md:overflow-visible md:pb-0',
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function DashboardCarouselItem({
  children,
  variant = 'action',
  className,
}: DashboardCarouselItemProps) {
  return (
    <div
      className={cn(
        'dashboard-os-carousel__item min-w-0 max-w-full',
        variant === 'action' && 'dashboard-os-carousel__item--action',
        variant === 'product' && 'dashboard-os-carousel__item--product',
        variant === 'product-flagship' && 'dashboard-os-carousel__item--product-flagship',
        variant === 'media' && 'dashboard-os-carousel__item--media',
        className,
      )}
    >
      {children}
    </div>
  )
}
