import { SubscriptionPanelSkeleton } from '@/components/ui/loading-states'

type SubscriptionLoadingProps = {
  className?: string
  label?: string
}

export function SubscriptionLoading({
  className,
  label = 'Lade dein Abo …',
}: SubscriptionLoadingProps) {
  return <SubscriptionPanelSkeleton label={label} className={className} />
}
