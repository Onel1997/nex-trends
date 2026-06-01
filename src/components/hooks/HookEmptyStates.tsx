import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  BookmarkIcon,
  ClockIcon,
  SparklesIcon,
} from '@/components/ui/icons'

type HookEmptyStateProps = {
  action?: ReactNode
  className?: string
  title?: string
  description?: string
}

export function HookResultsEmptyState({ action, className }: HookEmptyStateProps) {
  return (
    <EmptyState
      title="Deine Hooks warten"
      description="Gib deine Nische ein, wähle Ton und Plattform — OpenAI liefert 10 emotionale Scroll-Stopper für TikTok & Instagram Reels."
      icon={<SparklesIcon className="size-6 text-violet-400/90" aria-hidden />}
      size="compact"
      variant="premium"
      action={action}
      className={className}
    />
  )
}

export function HookHistoryEmptyState({ action, className }: HookEmptyStateProps) {
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

export function HookSavedEmptyState({
  action,
  className,
  title = 'Deine Best-of-Sammlung',
  description = 'Tippe auf das Lesezeichen bei einem Hook — gespeicherte Favoriten erscheinen hier sofort.',
}: HookEmptyStateProps) {
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

export function HookEmptyStateAction({
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
