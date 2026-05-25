import { Spinner } from '@/components/ui/Spinner'

export function AdminLoadingState({ label = 'Admin-Daten werden geladen …' }: { label?: string }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-800/50 bg-zinc-900/30">
      <Spinner size="lg" label={label} />
    </div>
  )
}
