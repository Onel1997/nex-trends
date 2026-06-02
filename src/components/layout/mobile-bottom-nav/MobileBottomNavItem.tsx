'use client'

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib'

type MobileBottomNavItemProps = {
  label: string
  icon: LucideIcon
  active: boolean
  onSelect: () => void
}

export function MobileBottomNavItem({
  label,
  icon: Icon,
  active,
  onSelect,
}: MobileBottomNavItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'mobile-bottom-nav__item group relative flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 pt-1 pb-0.5',
        'touch-manipulation transition-[color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'active:scale-[0.94]',
        active ? 'mobile-bottom-nav__item--active' : 'text-zinc-500',
      )}
    >
      <span
        className={cn(
          'mobile-bottom-nav__glow pointer-events-none absolute inset-x-1 top-0.5 h-9 rounded-full opacity-0 transition-opacity duration-300',
          active && 'opacity-100',
        )}
        aria-hidden
      />
      <span
        className={cn(
          'mobile-bottom-nav__icon-wrap relative flex size-9 items-center justify-center rounded-xl transition-[transform,box-shadow,color,background] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          active
            ? 'bg-violet-500/15 text-violet-300 shadow-[0_0_20px_-4px_rgb(139_92_246/0.55)]'
            : 'text-zinc-500 group-hover:text-zinc-300',
        )}
      >
        <Icon
          className={cn(
            'size-[1.35rem] stroke-[1.75] transition-transform duration-300',
            active && 'mobile-bottom-nav__icon--active',
          )}
          aria-hidden
        />
      </span>
      <span
        className={cn(
          'relative max-w-full truncate text-[10px] font-semibold tracking-tight transition-colors duration-300',
          active ? 'text-violet-200' : 'text-zinc-500 group-hover:text-zinc-400',
        )}
      >
        {label}
      </span>
    </button>
  )
}
