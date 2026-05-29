import { memo } from 'react'
import { CheckIcon } from '@/components/ui/icons'
import { cn } from '@/lib'

type AdCopyCopyToastProps = {
  visible: boolean
  message?: string
  className?: string
}

/** Lightweight copy-success toast — mobile bottom, desktop above sticky bar. */
export const AdCopyCopyToast = memo(function AdCopyCopyToast({
  visible,
  message = 'Ad erfolgreich kopiert',
  className,
}: AdCopyCopyToastProps) {
  if (!visible) return null

  return (
    <div
      className={cn(
        'ad-copy-copy-toast pointer-events-none fixed inset-x-0 z-[90] flex justify-center px-4',
        'bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-6',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="ad-copy-copy-toast__inner flex max-w-sm items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-zinc-950/95 px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300"
          aria-hidden
        >
          <CheckIcon className="size-3.5" />
        </span>
        <p className="text-sm font-semibold tracking-tight text-emerald-50/95">{message}</p>
      </div>
    </div>
  )
})

AdCopyCopyToast.displayName = 'AdCopyCopyToast'
