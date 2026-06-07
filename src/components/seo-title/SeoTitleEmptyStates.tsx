import type { ReactNode } from 'react'
import { SeoTitleEmptyIllustration } from '@/components/seo-title/SeoTitleEmptyIllustration'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { BookmarkIcon, ClockIcon, MagnifyingGlassIcon } from '@/components/ui/icons'
import { cn } from '@/lib'

type Props = {
  action?: ReactNode
  className?: string
  hint?: string
}

function Wrap({ action, hint }: Props) {
  return action ? (
    <div className="flex flex-col items-center gap-3">
      {action}
      {hint && <p className="max-w-xs text-center text-xs text-zinc-600">{hint}</p>}
    </div>
  ) : undefined
}

export function SeoTitleResultsEmptyState({ action, className, hint }: Props) {
  return (
    <EmptyState
      title="Deine SEO-Titel warten"
      description="Gib Keyword oder Thema ein — 5 CTR-starke Titel mit SEO-Score, Lesbarkeit und Suchintention."
      illustration={
        <SeoTitleEmptyIllustration variant="results" className="mx-auto max-w-[180px] opacity-95" />
      }
      size="compact"
      variant="premium"
      action={<Wrap action={action} hint={hint} />}
      className={cn('my-2', className)}
    />
  )
}

export function SeoTitleHistoryEmptyState({ action, className, hint }: Props) {
  return (
    <EmptyState
      title="Noch kein Verlauf"
      description="Jede Generierung wird gespeichert — lade sie wieder oder starte eine neue Variante."
      illustration={
        <SeoTitleEmptyIllustration variant="history" className="mx-auto max-w-[180px] opacity-95" />
      }
      size="compact"
      variant="premium"
      action={<Wrap action={action} hint={hint} />}
      className={cn('my-2', className)}
    />
  )
}

export function SeoTitleSavedEmptyState({ action, className, hint }: Props) {
  return (
    <EmptyState
      title="Deine Top-Titel Sammlung"
      description="Speichere Titel mit dem Lesezeichen — Favoriten erscheinen hier sofort."
      illustration={
        <SeoTitleEmptyIllustration variant="saved" className="mx-auto max-w-[180px] opacity-95" />
      }
      size="compact"
      variant="premium"
      action={<Wrap action={action} hint={hint} />}
      className={cn('my-2', className)}
    />
  )
}

export function SeoTitleEmptyStateAction({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <Button variant="secondary" size="md" onClick={onClick} className="min-h-11 px-5 touch-manipulation">
      <MagnifyingGlassIcon className="size-4" aria-hidden />
      {label}
    </Button>
  )
}

export function SeoTitleEmptyIcons() {
  return { results: MagnifyingGlassIcon, history: ClockIcon, saved: BookmarkIcon }
}
