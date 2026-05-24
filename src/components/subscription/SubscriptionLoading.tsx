import { cn } from '@/lib'
import { Spinner } from '@/components/ui/Spinner'

type SubscriptionLoadingProps = {
  className?: string
  label?: string
}

export function SubscriptionLoading({
  className,
  label = 'Lade dein Abo …',
}: SubscriptionLoadingProps) {
  return (
    <Spinner
      size="md"
      label={label}
      className={cn('min-h-[320px]', className)}
    />
  )
}
