import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { isSeoTitleTableUnavailableError, normalizeGeneratedSeoTitleRow } from '@/lib/seo-title-db'
import { recordSeoTitleSave, recordSeoTitleUnsave } from '@/lib/seo-title-analytics'
import type { SavedSeoTitleRow, SeoTitleVariantWithId } from '@/types/seo-title-generation'
import { SEO_TITLE_ROW_SELECT } from '@/types/seo-title-generation'

export function useSavedSeoTitles() {
  const [savedTitles, setSavedTitles] = useState<SavedSeoTitleRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: queryError } = await supabase
        .from('generated_seo_titles')
        .select(SEO_TITLE_ROW_SELECT)
        .eq('is_saved', true)
        .order('created_at', { ascending: false })
        .limit(100)

      if (queryError) {
        if (isSeoTitleTableUnavailableError(queryError)) {
          setSavedTitles([])
          return
        }
        throw queryError
      }

      setSavedTitles((data ?? []).map((row) => normalizeGeneratedSeoTitleRow(row as SavedSeoTitleRow)))
    } catch (err) {
      if (isSeoTitleTableUnavailableError(err)) {
        setSavedTitles([])
        return
      }
      setError(err instanceof Error ? err.message : 'Gespeicherte Titel konnten nicht geladen werden.')
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
      .from('generated_seo_titles')
      .update({ is_saved: isSaved })
      .eq('id', rowId)
      .select(SEO_TITLE_ROW_SELECT)
      .single()

    if (updateError) {
      if (isSeoTitleTableUnavailableError(updateError)) {
        throw new Error('SEO Title Speicher ist noch nicht eingerichtet.')
      }
      throw updateError
    }

    return normalizeGeneratedSeoTitleRow(data as SavedSeoTitleRow)
  }, [])

  const toggleSave = useCallback(
    async (variant: SeoTitleVariantWithId): Promise<'saved' | 'removed'> => {
      const nextSaved = !variant.is_saved && !savedTitles.some((a) => a.id === variant.id)

      if (!nextSaved) {
        setSavedTitles((prev) => prev.filter((a) => a.id !== variant.id))
        try {
          await setSavedState(variant.id, false)
          recordSeoTitleUnsave()
          return 'removed'
        } catch (err) {
          void refresh()
          throw err
        }
      }

      const row = await setSavedState(variant.id, true)
      setSavedTitles((prev) => [row, ...prev.filter((a) => a.id !== row.id)])
      recordSeoTitleSave()
      return 'saved'
    },
    [savedTitles, setSavedState, refresh],
  )

  const removeSavedTitle = useCallback(
    async (id: string) => {
      setSavedTitles((prev) => prev.filter((a) => a.id !== id))
      try {
        await setSavedState(id, false)
        recordSeoTitleUnsave()
      } catch (err) {
        void refresh()
        throw err
      }
    },
    [setSavedState, refresh],
  )

  return {
    savedTitles,
    isLoading,
    error,
    refresh,
    toggleSave,
    removeSavedTitle,
  }
}
