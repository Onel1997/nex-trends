import { AdminPanelSkeleton } from '@/components/ui/loading-states'

export function AdminLoadingState({ label = 'Admin-Daten werden geladen …' }: { label?: string }) {
  return <AdminPanelSkeleton label={label} />
}
