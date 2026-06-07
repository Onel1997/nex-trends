import { Button } from '@/components/ui/Button'

type AdminErrorStateProps = {
  message: string
  onRetry?: () => void
}

export function AdminErrorState({ message, onRetry }: AdminErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 text-center">
      <p className="text-sm text-red-200">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Erneut versuchen
        </Button>
      )}
    </div>
  )
}
