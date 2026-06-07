'use client'

import { cn } from '@/lib'

type UserAvatarProps = {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'size-8 text-[10px]',
  md: 'size-10 text-xs',
  lg: 'size-14 text-lg',
}

function initialsFromName(name: string): string {
  return (
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'NT'
  )
}

export function UserAvatar({ name, avatarUrl, size = 'md', className }: UserAvatarProps) {
  const initials = initialsFromName(name)

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={cn(
          'shrink-0 rounded-xl object-cover ring-1 ring-white/10',
          sizeClasses[size],
          className,
        )}
        referrerPolicy="no-referrer"
      />
    )
  }

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl gradient-accent font-bold text-white shadow-lg shadow-violet-900/25 ring-1 ring-white/10',
        sizeClasses[size],
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  )
}
