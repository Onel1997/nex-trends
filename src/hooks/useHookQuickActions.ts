import { useCallback, useState } from 'react'
import { useToast } from '@/context/ToastContext'
import { getHookText } from '@/lib/ai/parse-hooks-response'
import { copyToClipboard } from '@/lib/clipboard'
import { downloadHooksTxt, formatHooksAsText } from '@/lib/hook-export'
import type { PremiumHook } from '@/types/ai-generation'

export type HookQuickActionId = 'copy' | 'save' | 'export'

type UseHookQuickActionsOptions = {
  hooks: PremiumHook[]
  topic?: string
  tone?: string
  platform?: string
  generationId?: string
  isSaved: (hookText: string) => boolean
  saveHookIfNotSaved: (params: {
    hookText: string
    generationId?: string
    topic?: string
    tone?: string
    platform?: string
  }) => Promise<'saved' | 'already_saved'>
  refreshSaved?: () => void | Promise<void>
}

export function useHookQuickActions({
  hooks,
  topic,
  tone,
  platform,
  generationId,
  isSaved,
  saveHookIfNotSaved,
  refreshSaved,
}: UseHookQuickActionsOptions) {
  const { showToast } = useToast()
  const [loadingAction, setLoadingAction] = useState<HookQuickActionId | null>(null)

  const copyAll = useCallback(async () => {
    if (hooks.length === 0 || loadingAction) return

    setLoadingAction('copy')
    try {
      const ok = await copyToClipboard(formatHooksAsText(hooks))
      if (!ok) {
        showToast({ type: 'error', title: 'Kopieren fehlgeschlagen' })
        return
      }

      showToast({
        type: 'success',
        title: '✓ Alle Hooks kopiert',
        message: `${hooks.length} Hooks`,
        durationMs: 2000,
      })
    } finally {
      setLoadingAction(null)
    }
  }, [hooks, loadingAction, showToast])

  const saveAll = useCallback(async () => {
    if (hooks.length === 0 || loadingAction) return

    setLoadingAction('save')
    try {
      const unsaved = hooks.filter((hook) => !isSaved(getHookText(hook)))

      if (unsaved.length === 0) {
        showToast({
          type: 'info',
          title: 'Alle Hooks bereits gespeichert',
          durationMs: 2200,
        })
        return
      }

      let saved = 0
      for (const hook of unsaved) {
        const result = await saveHookIfNotSaved({
          hookText: getHookText(hook),
          generationId,
          topic,
          tone,
          platform,
        })
        if (result === 'saved') saved++
      }

      void refreshSaved?.()

      showToast({
        type: 'success',
        title: '✓ Alle Hooks gespeichert',
        message: saved > 0 ? `${saved} Hooks gespeichert` : undefined,
        durationMs: 2500,
      })
    } catch {
      showToast({ type: 'error', title: 'Speichern fehlgeschlagen' })
    } finally {
      setLoadingAction(null)
    }
  }, [
    hooks,
    loadingAction,
    isSaved,
    saveHookIfNotSaved,
    generationId,
    topic,
    tone,
    platform,
    refreshSaved,
    showToast,
  ])

  const exportTxt = useCallback(async () => {
    if (hooks.length === 0 || loadingAction) return

    setLoadingAction('export')
    try {
      downloadHooksTxt(hooks, topic)
      showToast({
        type: 'success',
        title: '✓ TXT exportiert',
        message: `${hooks.length} Hooks`,
        durationMs: 2000,
      })
    } finally {
      setLoadingAction(null)
    }
  }, [hooks, loadingAction, topic, showToast])

  return {
    copyAll,
    saveAll,
    exportTxt,
    loadingAction,
    isBusy: loadingAction !== null,
  }
}
