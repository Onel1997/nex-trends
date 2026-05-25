import { memo } from 'react'

type AdminWarningBannerProps = {
  warnings: string[]
}

function AdminWarningBannerInner({ warnings }: AdminWarningBannerProps) {
  if (warnings.length === 0) return null

  return (
    <div
      className="rounded-xl border border-amber-500/30 bg-amber-950/25 px-4 py-3 text-sm text-amber-100"
      role="status"
    >
      <p className="font-medium text-amber-200">Teilweise Daten — eingeschränkter Modus</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-amber-100/90">
        {warnings.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </div>
  )
}

export const AdminWarningBanner = memo(AdminWarningBannerInner)
