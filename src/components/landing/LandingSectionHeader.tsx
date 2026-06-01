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
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? (
        <p className="landing-eyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/[0.08] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-300 backdrop-blur-md sm:text-[11px]">
          <span className="landing-live-dot size-1.5 rounded-full bg-violet-400" aria-hidden />
          {eyebrow}
        </p>
      ) : null}

      <h2 className="landing-display text-[1.875rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.875rem]">
        {title}
        {titleAccent ? (
          <>
            <br className="hidden sm:block" />
            <span className="font-normal text-zinc-500"> {titleAccent}</span>
          </>
        ) : null}
      </h2>

      <p className="mt-5 text-sm leading-[1.7] text-zinc-400 sm:mt-6 sm:text-base lg:text-lg lg:leading-relaxed">
        {description}
      </p>
    </div>
  )
}
