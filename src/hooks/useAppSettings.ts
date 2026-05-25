import { useCallback, useEffect, useState } from 'react'
import { fetchPublicAppSettings } from '@/lib/app-settings'
import type { AdminSettings } from '@/types/admin'
import { DEFAULT_FEATURE_FLAGS } from '@/types/admin'

const DEFAULT_SETTINGS: AdminSettings = {
  maintenance_mode: false,
  announcement: '',
  feature_flags: DEFAULT_FEATURE_FLAGS,
  updated_at: null,
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setSettings(await fetchPublicAppSettings())
    } catch {
      setSettings(DEFAULT_SETTINGS)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { settings, loaded, refresh }
}
