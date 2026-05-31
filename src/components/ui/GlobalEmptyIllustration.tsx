import { cn } from '@/lib'

type GlobalEmptyIllustrationProps = {
  variant?: 'library' | 'history' | 'videos' | 'activity'
  className?: string
}

export function GlobalEmptyIllustration({
  variant = 'library',
  className,
}: GlobalEmptyIllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('mx-auto w-full text-violet-400/80', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="nex-empty-grad" x1="40" y1="20" x2="160" y2="120">
          <stop stopColor="#8b5cf6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#d946ef" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <rect
        x="30"
        y="24"
        width="140"
        height="92"
        rx="16"
        stroke="url(#nex-empty-grad)"
        strokeWidth="1.5"
        fill="rgb(139 92 246 / 0.06)"
      />
      {variant === 'videos' && (
        <path
          d="M88 58 L112 70 L88 82 Z"
          fill="currentColor"
          opacity="0.7"
        />
      )}
      {variant === 'history' && (
        <>
          <circle cx="70" cy="58" r="6" fill="currentColor" opacity="0.5" />
          <circle cx="100" cy="70" r="6" fill="currentColor" opacity="0.35" />
          <circle cx="130" cy="58" r="6" fill="currentColor" opacity="0.2" />
        </>
      )}
      {variant === 'activity' && (
        <path
          d="M52 88 L78 68 L102 78 L148 52"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.55"
        />
      )}
      {(variant === 'library' || variant === 'history') && (
        <>
          <rect x="52" y="48" width="72" height="8" rx="4" fill="currentColor" opacity="0.35" />
          <rect x="52" y="64" width="96" height="6" rx="3" fill="currentColor" opacity="0.2" />
          <rect x="52" y="78" width="84" height="6" rx="3" fill="currentColor" opacity="0.15" />
        </>
      )}
      <circle cx="100" cy="70" r="48" stroke="url(#nex-empty-grad)" strokeWidth="1" opacity="0.25" />
    </svg>
  )
}
