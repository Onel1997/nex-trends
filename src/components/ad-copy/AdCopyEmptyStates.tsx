import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  BookmarkIcon,
  ClockIcon,
  SparklesIcon,
} from '@/components/ui/icons'

type AdCopyEmptyStateProps = {
  action?: ReactNode
  className?: string
  title?: string
  description?: string
}

export function AdCopyResultsEmptyState({ action, className }: AdCopyEmptyStateProps) {
  return (
    <EmptyState
      title="Deine Ad Copy wartet"
      description="Beschreibe Produkt, Zielgruppe und Plattform — die AI liefert 5 conversion-starke Varianten mit Headline, Primary Text und CTA."
      icon={<SparklesIcon className="size-6 text-violet-400/90" aria-hidden />}
      size="compact"
      variant="premium"
      action={action}
      className={className}
    />
  )
}

export function AdCopyHistoryEmptyState({ action, className }: AdCopyEmptyStateProps) {
  return (
    <EmptyState
      title="Noch kein Verlauf"
      description="Jede Generierung wird hier gespeichert — lade sie jederzeit wieder oder generiere neue Varianten."
      icon={<ClockIcon className="size-6 text-violet-400/90" aria-hidden />}
      size="compact"
      variant="premium"
      action={action}
      className={className}
    />
  )
}

export function AdCopySavedEmptyState({
  action,
  className,
  title = 'Deine Best-of-Sammlung',
  description = 'Tippe auf das Lesezeichen bei einer Ad — gespeicherte Favoriten erscheinen hier sofort.',
}: AdCopyEmptyStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<BookmarkIcon className="size-6 text-amber-400/90" aria-hidden />}
      size="compact"
      variant="premium"
      action={action}
      className={className}
    />
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
    <Button variant="secondary" size="md" onClick={onClick} className="min-h-11 px-5">
      <SparklesIcon className="size-4" aria-hidden />
      {label}
    </Button>
  )
}
