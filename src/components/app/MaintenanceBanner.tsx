import { useAppSettings } from '@/hooks/useAppSettings'

export function MaintenanceBanner() {
  const { settings, loaded } = useAppSettings()

  if (!loaded) return null
  if (!settings.maintenance_mode && !settings.announcement.trim()) return null

  return (
    <div
      className="relative z-50 border-b border-amber-500/30 bg-gradient-to-r from-amber-950/80 via-zinc-950 to-violet-950/60 px-4 py-2.5 text-center text-sm text-amber-100"
      role="status"
    >
      {settings.maintenance_mode && (
        <span className="font-semibold">Wartungsmodus aktiv</span>
      )}
      {settings.maintenance_mode && settings.announcement.trim() && (
        <span className="mx-2 text-amber-500/60">·</span>
      )}
      {settings.announcement.trim() && <span>{settings.announcement}</span>}
    </div>
  )
}
