import { cn } from '@/lib/utils'

const AVATAR_GRADIENTS = [
  'from-violet-500 to-purple-700',
  'from-fuchsia-500 to-violet-600',
  'from-purple-400 to-indigo-600',
  'from-violet-600 to-fuchsia-500',
] as const

type TrustedCreatorsBadgeProps = {
  className?: string
}

export function TrustedCreatorsBadge({ className }: TrustedCreatorsBadgeProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 sm:flex-row sm:gap-5',
        className,
      )}
    >
      <div className="flex items-center -space-x-2.5" aria-hidden>
        {AVATAR_GRADIENTS.map((gradient, i) => (
          <span
            key={gradient}
            className={cn(
              'relative inline-flex size-9 shrink-0 items-center justify-center rounded-full',
              'border-2 border-zinc-950 ring-2 ring-violet-500/20 shadow-lg shadow-violet-900/30',
              `bg-gradient-to-br ${gradient}`,
              i > 0 && '-ml-3',
            )}
          >
            <span className="text-[9px] font-bold text-white/90">
              {['NT', 'CR', 'AI', 'MK'][i]}
            </span>
          </span>
        ))}
        <span className="-ml-2 flex size-9 items-center justify-center rounded-full border-2 border-zinc-950 bg-zinc-900 text-[10px] font-semibold text-zinc-400 ring-2 ring-white/10">
          +
        </span>
      </div>

      <div className="text-center sm:text-left">
        <p className="text-sm font-medium text-zinc-300">
          Vertraut von{' '}
          <span className="bg-gradient-to-r from-violet-200 to-purple-300 bg-clip-text font-semibold text-transparent">
            500+ Creators
          </span>
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          TikTok · Instagram · Growth Teams
        </p>
      </div>
    </div>
  )
}
