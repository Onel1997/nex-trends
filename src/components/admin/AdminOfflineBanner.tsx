import { memo } from 'react'
import { Button } from '@/components/ui/Button'
import {
  ADMIN_API_DEPLOY_COMMANDS,
  ADMIN_API_DEPLOY_DOC,
  ADMIN_API_FUNCTION_NAME,
} from '@/lib/admin-errors'
import { useAdminEdge } from '@/context/AdminEdgeContext'

function AdminOfflineBannerInner() {
  const { isOffline, isChecking, offlineMessage, recheck } = useAdminEdge()

  if (isChecking || !isOffline) return null

  return (
    <div
      className="mb-6 rounded-2xl border border-violet-500/40 bg-gradient-to-r from-violet-950/50 via-zinc-950/80 to-fuchsia-950/40 px-4 py-4 sm:px-5"
      role="alert"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-semibold text-violet-200">
            Edge Function „{ADMIN_API_FUNCTION_NAME}“ ist offline
          </p>
          <p className="text-xs leading-relaxed text-zinc-400">
            {offlineMessage ??
              'Das Admin-Dashboard läuft im eingeschränkten Modus (leere KPIs). Deploy die Function, um Nutzer, Analytics und Einstellungen zu laden.'}
          </p>
          <p className="text-xs text-zinc-500">
            Anleitung: <code className="text-violet-300">{ADMIN_API_DEPLOY_DOC}</code>
          </p>
          <ol className="mt-2 space-y-1 font-mono text-[11px] text-zinc-500">
            {ADMIN_API_DEPLOY_COMMANDS.map((cmd) => (
              <li key={cmd} className="truncate">
                <span className="text-zinc-600">$</span> {cmd}
              </li>
            ))}
          </ol>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0"
          onClick={() => void recheck()}
        >
          Erneut prüfen
        </Button>
      </div>
    </div>
  )
}

export const AdminOfflineBanner = memo(AdminOfflineBannerInner)
