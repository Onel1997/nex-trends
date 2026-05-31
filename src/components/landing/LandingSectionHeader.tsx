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
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-400">
          {eyebrow}
        </p>
      )}
      <h2 className="text-[1.75rem] font-bold leading-[1.12] tracking-[-0.025em] text-white sm:text-4xl lg:text-[2.65rem]">
        {title}
        {titleAccent && (
          <>
            <br className="hidden sm:block" />
            <span className="text-zinc-500"> {titleAccent}</span>
          </>
        )}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:mt-4 sm:text-base lg:text-lg">
        {description}
      </p>
    </div>
  )
}
