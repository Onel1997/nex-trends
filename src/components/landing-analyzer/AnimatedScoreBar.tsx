import { memo, useEffect, useState } from 'react'
import { getCroScoreTone } from '@/lib/landing-audit-score'
import { cn } from '@/lib'

type AnimatedScoreBarProps = {
  score: number
  animate: boolean
  className?: string
}

function AnimatedScoreBarInner({ score, animate, className }: AnimatedScoreBarProps) {
  const [width, setWidth] = useState(animate ? 0 : score)
  const tone = getCroScoreTone(score)

  useEffect(() => {
    if (!animate) {
      setWidth(score)
      return
    }
    const frame = requestAnimationFrame(() => setWidth(score))
    return () => cancelAnimationFrame(frame)
  }, [score, animate])

  return (
    <div
      className={cn(
        'lp-score-bar-track mt-2.5 h-2 overflow-hidden rounded-full bg-zinc-800/90 sm:h-2.5',
        className,
      )}
      role="progressbar"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          'lp-score-bar-fill h-full rounded-full bg-gradient-to-r transition-[width] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
          tone.barClass,
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

export const AnimatedScoreBar = memo(AnimatedScoreBarInner)
