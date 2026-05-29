import type { ReactNode } from 'react'
import { AdCopyEmptyIllustration } from '@/components/ad-copy/AdCopyEmptyIllustration'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  BookmarkIcon,
  ClockIcon,
  SparklesIcon,
} from '@/components/ui/icons'
import { cn } from '@/lib'

type AdCopyEmptyStateProps = {
  action?: ReactNode
  className?: string
  title?: string
  description?: string
  hint?: string
}

function AdCopyEmptyIllustrationWrap({
  variant,
}: {
  variant: 'results' | 'history' | 'saved'
}) {
  return (
    <AdCopyEmptyIllustration
      variant={variant}
      className="mx-auto w-full max-w-[180px] opacity-95"
    />
  )
}

export function AdCopyResultsEmptyState({ action, className, hint }: AdCopyEmptyStateProps) {
  return (
    <EmptyState
      title="Deine Ad Copy wartet"
      description="Beschreibe Produkt, Zielgruppe und Plattform — die AI liefert 5 conversion-starke Varianten mit Headline, Primary Text und CTA."
      illustration={<AdCopyEmptyIllustrationWrap variant="results" />}
      size="compact"
      variant="premium"
      action={
        action ? (
          <div className="flex flex-col items-center gap-3">
            {action}
            {hint && <AdCopyEmptyHint>{hint}</AdCopyEmptyHint>}
          </div>
        ) : undefined
      }
      className={cn('my-2', className)}
    />
  )
}

export function AdCopyHistoryEmptyState({ action, className, hint }: AdCopyEmptyStateProps) {
  return (
    <EmptyState
      title="Noch kein Verlauf"
      description="Jede Generierung wird automatisch gespeichert — lade sie jederzeit wieder oder starte eine neue Variante."
      illustration={<AdCopyEmptyIllustrationWrap variant="history" />}
      size="compact"
      variant="premium"
      action={
        action ? (
          <div className="flex flex-col items-center gap-3">
            {action}
            {hint && <AdCopyEmptyHint>{hint}</AdCopyEmptyHint>}
          </div>
        ) : undefined
      }
      className={cn('my-2', className)}
    />
  )
}

export function AdCopySavedEmptyState({
  action,
  className,
  title = 'Deine Best-of-Sammlung',
  description = 'Tippe auf das Lesezeichen bei einer Ad — gespeicherte Favoriten erscheinen hier sofort.',
  hint,
}: AdCopyEmptyStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      illustration={<AdCopyEmptyIllustrationWrap variant="saved" />}
      size="compact"
      variant="premium"
      action={
        action ? (
          <div className="flex flex-col items-center gap-3">
            {action}
            {hint && <AdCopyEmptyHint>{hint}</AdCopyEmptyHint>}
          </div>
        ) : undefined
      }
      className={cn('my-2', className)}
    />
  )
}

function AdCopyEmptyHint({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-xs text-center text-xs leading-relaxed text-zinc-600">{children}</p>
  )
}

export function AdCopyEmptyStateAction({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <Button variant="secondary" size="md" onClick={onClick} className="min-h-11 px-5 touch-manipulation">
      <SparklesIcon className="size-4" aria-hidden />
      {label}
    </Button>
  )
}

/** Icon-only fallback for tight panels */
export function AdCopyEmptyIcon({
  variant,
}: {
  variant: 'results' | 'history' | 'saved'
}) {
  const icons = {
    results: SparklesIcon,
    history: ClockIcon,
    saved: BookmarkIcon,
  }
  const Icon = icons[variant]
  const color = variant === 'saved' ? 'text-amber-400/90' : 'text-violet-400/90'

  return <Icon className={cn('size-6', color)} aria-hidden />
}
