import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { recordHookSave, recordHookUnsave } from '@/lib/hook-analytics'
import type { SavedHookRow } from '@/types/ai-generation'

function tempId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function useSavedHooks() {
  const [savedHooks, setSavedHooks] = useState<SavedHookRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: queryError } = await supabase
        .from('saved_hooks')
        .select('id, generation_id, hook_text, topic, tone, platform, saved_at')
        .order('saved_at', { ascending: false })
        .limit(100)

      if (queryError) throw queryError
      setSavedHooks((data ?? []) as SavedHookRow[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gespeicherte Hooks konnten nicht geladen werden.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const persistSave = useCallback(
    async (params: {
      hookText: string
      generationId?: string
      topic?: string
      tone?: string
      platform?: string
    }) => {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session?.user.id) {
        throw new Error('Nicht authentifiziert.')
      }

      const { data, error: insertError } = await supabase
        .from('saved_hooks')
        .insert({
          user_id: session.session.user.id,
          generation_id: params.generationId ?? null,
          hook_text: params.hookText,
          topic: params.topic ?? null,
          tone: params.tone ?? null,
          platform: params.platform ?? null,
        })
        .select('id, generation_id, hook_text, topic, tone, platform, saved_at')
        .single()

      if (insertError) throw insertError
      return data as SavedHookRow
    },
    [],
  )

  const deleteSavedHook = useCallback(async (id: string) => {
    if (id.startsWith('temp-')) return
    const { error: deleteError } = await supabase.from('saved_hooks').delete().eq('id', id)
    if (deleteError) throw deleteError
  }, [])

  const toggleSave = useCallback(
    async (params: {
      hookText: string
      generationId?: string
      topic?: string
      tone?: string
      platform?: string
    }): Promise<'saved' | 'removed'> => {
      const existing = savedHooks.find((h) => h.hook_text === params.hookText)

      if (existing) {
        setSavedHooks((prev) => prev.filter((h) => h.id !== existing.id))
        try {
          await deleteSavedHook(existing.id)
          recordHookUnsave(existing.tone ?? undefined)
          return 'removed'
        } catch (err) {
          setSavedHooks((prev) => [existing, ...prev.filter((h) => h.id !== existing.id)])
          throw err
        }
      }

      const optimistic: SavedHookRow = {
        id: tempId(),
        generation_id: params.generationId ?? null,
        hook_text: params.hookText,
        topic: params.topic ?? null,
        tone: params.tone ?? null,
        platform: params.platform ?? null,
        saved_at: new Date().toISOString(),
      }

      setSavedHooks((prev) => [optimistic, ...prev])

      try {
        const row = await persistSave(params)
        setSavedHooks((prev) => prev.map((h) => (h.id === optimistic.id ? row : h)))
        recordHookSave(params.tone, params.platform)
        return 'saved'
      } catch (err) {
        setSavedHooks((prev) => prev.filter((h) => h.id !== optimistic.id))
        throw err
      }
    },
    [savedHooks, persistSave, deleteSavedHook],
  )

  const removeSavedHook = useCallback(
    async (id: string) => {
      const existing = savedHooks.find((h) => h.id === id)
      if (!existing) return

      setSavedHooks((prev) => prev.filter((h) => h.id !== id))
      try {
        await deleteSavedHook(id)
        recordHookUnsave(existing.tone ?? undefined)
      } catch (err) {
        setSavedHooks((prev) => [existing, ...prev])
        throw err
      }
    },
    [savedHooks, deleteSavedHook],
  )

  const isSaved = useCallback(
    (hookText: string) => savedHooks.some((h) => h.hook_text === hookText),
    [savedHooks],
  )

  return {
    savedHooks,
    isLoading,
    error,
    refresh,
    toggleSave,
    removeSavedHook,
    isSaved,
  }
}
