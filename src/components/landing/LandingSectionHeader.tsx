import { cn } from '@/lib'

type LandingSectionHeaderProps = {
  eyebrow?: string
  title: string
  titleAccent?: string
  description: string
  align?: 'center' | 'left'
  className?: string
}

export function LandingSectionHeader({
  eyebrow,
  title,
  titleAccent,
  description,
  align = 'center',
  className,
}: LandingSectionHeaderProps) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-400">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
        {title}
        {titleAccent && (
          <>
            {' '}
            <span className="text-zinc-500">{titleAccent}</span>
          </>
        )}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:text-lg">
        {description}
      </p>
    </div>
  )
}
