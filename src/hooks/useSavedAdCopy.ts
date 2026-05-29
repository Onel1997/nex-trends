import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { isAdCopyTableUnavailableError, normalizeGeneratedAdCopyRow } from '@/lib/ad-copy-db'
import { recordAdCopySave, recordAdCopyUnsave } from '@/lib/ad-copy-analytics'
import type { AdCopyVariantWithId, SavedAdCopyRow } from '@/types/ad-copy-generation'
import { AD_COPY_ROW_SELECT } from '@/types/ad-copy-generation'

export function useSavedAdCopy() {
  const [savedAds, setSavedAds] = useState<SavedAdCopyRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storageUnavailable, setStorageUnavailable] = useState(false)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: queryError } = await supabase
        .from('generated_ad_copy')
        .select(AD_COPY_ROW_SELECT)
        .eq('is_saved', true)
        .order('created_at', { ascending: false })
        .limit(100)

      if (queryError) {
        if (isAdCopyTableUnavailableError(queryError)) {
          setStorageUnavailable(true)
          setSavedAds([])
          return
        }
        throw queryError
      }

      setStorageUnavailable(false)
      setSavedAds((data ?? []).map((row) => normalizeGeneratedAdCopyRow(row as SavedAdCopyRow)))
    } catch (err) {
      if (isAdCopyTableUnavailableError(err)) {
        setStorageUnavailable(true)
        setSavedAds([])
        return
      }
      setError(err instanceof Error ? err.message : 'Gespeicherte Ads konnten nicht geladen werden.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const setSavedState = useCallback(async (rowId: string, isSaved: boolean) => {
    if (rowId.startsWith('local-') || rowId.startsWith('temp-')) {
      throw new Error('Speichern erst nach Migration möglich.')
    }

    const { data, error: updateError } = await supabase
      .from('generated_ad_copy')
      .update({ is_saved: isSaved })
      .eq('id', rowId)
      .select(AD_COPY_ROW_SELECT)
      .single()

    if (updateError) {
      if (isAdCopyTableUnavailableError(updateError)) {
        throw new Error('Ad Copy Speicher ist noch nicht eingerichtet.')
      }
      throw updateError
    }

    return normalizeGeneratedAdCopyRow(data as SavedAdCopyRow)
  }, [])

  const toggleSave = useCallback(
    async (variant: AdCopyVariantWithId): Promise<'saved' | 'removed'> => {
      const nextSaved = !variant.is_saved && !savedAds.some((a) => a.id === variant.id)

      if (!nextSaved) {
        setSavedAds((prev) => prev.filter((a) => a.id !== variant.id))
        try {
          await setSavedState(variant.id, false)
          recordAdCopyUnsave(undefined)
          return 'removed'
        } catch (err) {
          void refresh()
          throw err
        }
      }

      try {
        const row = await setSavedState(variant.id, true)
        setSavedAds((prev) => [row, ...prev.filter((a) => a.id !== row.id)])
        recordAdCopySave(undefined, undefined)
        return 'saved'
      } catch (err) {
        throw err
      }
    },
    [savedAds, setSavedState, refresh],
  )

  const removeSavedAd = useCallback(
    async (id: string) => {
      setSavedAds((prev) => prev.filter((a) => a.id !== id))
      try {
        await setSavedState(id, false)
        recordAdCopyUnsave(undefined)
      } catch (err) {
        void refresh()
        throw err
      }
    },
    [setSavedState, refresh],
  )

  const isSaved = useCallback(
    (variant: AdCopyVariantWithId) =>
      variant.is_saved || savedAds.some((a) => a.id === variant.id),
    [savedAds],
  )

  return {
    savedAds,
    isLoading,
    error,
    storageUnavailable,
    refresh,
    toggleSave,
    removeSavedAd,
    isSaved,
  }
}
