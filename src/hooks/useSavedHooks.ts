import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { SavedHookRow } from '@/types/ai-generation'

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

  const saveHook = useCallback(
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

      const row = data as SavedHookRow
      setSavedHooks((prev) => [row, ...prev])
      return row
    },
    [],
  )

  const removeSavedHook = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase.from('saved_hooks').delete().eq('id', id)
    if (deleteError) throw deleteError
    setSavedHooks((prev) => prev.filter((h) => h.id !== id))
  }, [])

  const isSaved = useCallback(
    (hookText: string) => savedHooks.some((h) => h.hook_text === hookText),
    [savedHooks],
  )

  return {
    savedHooks,
    isLoading,
    error,
    refresh,
    saveHook,
    removeSavedHook,
    isSaved,
  }
}
