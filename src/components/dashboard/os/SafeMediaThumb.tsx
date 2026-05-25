import { useState } from 'react'
import { ClapperboardIcon } from '@/components/ui/icons'
import { cn } from '@/lib'

type SafeMediaThumbProps = {
  src?: string | null
  alt?: string
  fallbackClassName?: string
  className?: string
  variant?: 'trend' | 'video'
}

export function SafeMediaThumb({
  src,
  alt = '',
  fallbackClassName,
  className,
  variant = 'trend',
}: SafeMediaThumbProps) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  if (!showImage) {
    return (
      <div
        className={cn(
          'flex size-full items-center justify-center',
          variant === 'video'
            ? 'bg-gradient-to-br from-violet-950/90 via-zinc-900 to-fuchsia-950/70'
            : 'bg-gradient-to-br from-violet-900/50 via-zinc-900 to-fuchsia-950/50',
          fallbackClassName,
        )}
      >
        {variant === 'video' ? (
          <ClapperboardIcon className="size-10 text-violet-500/40" aria-hidden />
        ) : (
          <div className="size-full bg-gradient-to-br from-violet-800/30 to-fuchsia-900/40" />
        )}
      </div>
    )
  }

  return (
    <img
      src={src!}
      alt={alt}
      className={cn('size-full object-cover object-center', className)}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
