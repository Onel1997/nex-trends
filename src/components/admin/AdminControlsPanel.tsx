import { memo, useEffect, useState } from 'react'
import { AdminErrorState } from '@/components/admin/AdminErrorState'
import { AdminControlsSkeleton } from '@/components/admin/AdminSkeleton'
import { AdminWarningBanner } from '@/components/admin/AdminWarningBanner'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import {
  fetchAdminSettings,
  resetCreditsGlobally,
  saveAdminSettings,
} from '@/lib/admin-api'
import {
  DEFAULT_ADMIN_SETTINGS,
  EMPTY_ADMIN_SETTINGS_PAYLOAD,
  adminSettingsEqual,
  normalizeAdminSettings,
} from '@/lib/admin-defaults'
import { formatAdminWriteError, logAdminError } from '@/lib/admin-errors'
import { useAdminPanelLoad } from '@/hooks/useAdminPanelLoad'
import type { AdminFeatureFlags, AdminSettings } from '@/types/admin'

const FLAG_LABELS: { key: keyof AdminFeatureFlags; label: string }[] = [
  { key: 'trend_intelligence', label: 'Trend Intelligence' },
  { key: 'hook_generator', label: 'Hook Generator' },
  { key: 'ad_copy', label: 'Ad Copy Generator' },
  { key: 'seo_titles', label: 'SEO Titles' },
  { key: 'landing_analyzer', label: 'Landing Analyzer' },
]

function AdminControlsPanelInner() {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [writeError, setWriteError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { data, loading, warnings, authError, loadId, reload } = useAdminPanelLoad({
    scope: 'AdminControlsPanel',
    reloadKey: 'settings',
    load: fetchAdminSettings,
    empty: EMPTY_ADMIN_SETTINGS_PAYLOAD,
  })

  useEffect(() => {
    if (loadId === 0) return
    const next = normalizeAdminSettings(data.settings)
    setSettings((prev) => (adminSettingsEqual(prev, next) ? prev : next))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync only after successful fetch
  }, [loadId])

  async function handleSave() {
    setSaving(true)
    setWriteError(null)
    setSuccess(null)
    try {
      const saved = await saveAdminSettings({
        maintenance_mode: settings.maintenance_mode,
        announcement: settings.announcement,
        feature_flags: settings.feature_flags,
      })
      const next = normalizeAdminSettings(saved.settings)
      setSettings((prev) => (adminSettingsEqual(prev, next) ? prev : next))
      setSuccess('Einstellungen gespeichert.')
    } catch (err) {
      logAdminError('AdminControlsPanel.save', err)
      setWriteError(formatAdminWriteError(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleResetCredits() {
    setSaving(true)
    setWriteError(null)
    try {
      const result = await resetCreditsGlobally(10)
      setSuccess(`Credits für alle Free-User auf ${result.amount} gesetzt.`)
    } catch (err) {
      logAdminError('AdminControlsPanel.reset', err)
      setWriteError(formatAdminWriteError(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading && loadId === 0) return <AdminControlsSkeleton />
  if (authError) {
    return <AdminErrorState message={authError} onRetry={() => void reload()} />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Admin Controls</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Wartungsmodus, Ankündigungen und Feature-Toggles.
        </p>
      </header>

      <AdminWarningBanner warnings={warnings} />
      {writeError && <AdminErrorState message={writeError} />}
      {success && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
          {success}
        </p>
      )}

      <ControlsForm
        settings={settings}
        saving={saving}
        onSettingsChange={setSettings}
        onSave={() => void handleSave()}
        onResetCredits={() => void handleResetCredits()}
      />
    </div>
  )
}

const ControlsForm = memo(function ControlsForm({
  settings,
  saving,
  onSettingsChange,
  onSave,
  onResetCredits,
}: {
  settings: AdminSettings
  saving: boolean
  onSettingsChange: React.Dispatch<React.SetStateAction<AdminSettings>>
  onSave: () => void
  onResetCredits: () => void
}) {
  return (
    <>
      <Card variant="glass">
        <CardHeader>
          <h2 className="text-sm font-semibold text-white">Maintenance Mode</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span className="text-sm text-zinc-300">Wartungsmodus aktiv</span>
            <input
              type="checkbox"
              checked={settings.maintenance_mode}
              onChange={(e) =>
                onSettingsChange((s) => ({ ...s, maintenance_mode: e.target.checked }))
              }
              className="size-5 rounded border-zinc-600 bg-zinc-900 text-violet-500 focus:ring-violet-500/40"
            />
          </label>
        </CardBody>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <h2 className="text-sm font-semibold text-white">Announcement</h2>
        </CardHeader>
        <CardBody>
          <Textarea
            rows={4}
            value={settings.announcement}
            onChange={(e) =>
              onSettingsChange((s) => ({ ...s, announcement: e.target.value }))
            }
            placeholder="Globale Ankündigung für alle Nutzer …"
          />
        </CardBody>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <h2 className="text-sm font-semibold text-white">Feature Toggles</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {FLAG_LABELS.map(({ key, label }) => (
            <label
              key={key}
              className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-800/50 bg-zinc-950/40 px-3 py-2.5"
            >
              <span className="text-sm text-zinc-300">{label}</span>
              <input
                type="checkbox"
                checked={settings.feature_flags[key] !== false}
                onChange={(e) =>
                  onSettingsChange((s) => ({
                    ...s,
                    feature_flags: {
                      ...s.feature_flags,
                      [key]: e.target.checked,
                    },
                  }))
                }
                className="size-5 rounded border-zinc-600 bg-zinc-900 text-violet-500"
              />
            </label>
          ))}
        </CardBody>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <h2 className="text-sm font-semibold text-white">Global Credits</h2>
        </CardHeader>
        <CardBody className="flex flex-wrap gap-3">
          <Button variant="secondary" loading={saving} onClick={onResetCredits}>
            Alle Free-Credits auf 10 setzen
          </Button>
        </CardBody>
      </Card>

      <Button variant="pro" size="lg" loading={saving} onClick={onSave}>
        Einstellungen speichern
      </Button>
    </>
  )
})

export const AdminControlsPanel = memo(AdminControlsPanelInner)
