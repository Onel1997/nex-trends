import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '@/context/ToastContext'
import { copyToClipboard } from '@/lib/clipboard'
import { getRecentCopies, recordHookCopy } from '@/lib/hook-analytics'

const COPY_FEEDBACK_MS = 2000
const COPY_COOLDOWN_MS = 700

export function useHookClipboard() {
  const { showToast } = useToast()
  const [copiedHook, setCopiedHook] = useState<string | null>(null)
  const [recentCopies, setRecentCopies] = useState(() => getRecentCopies())
  const copyTimerRef = useRef<number | null>(null)
  const cooldownRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
    }
  }, [])

  const copyHook = useCallback(
    async (text: string) => {
      const now = Date.now()
      const lastCopy = cooldownRef.current.get(text) ?? 0
      if (now - lastCopy < COPY_COOLDOWN_MS) return

      const ok = await copyToClipboard(text)
      if (!ok) {
        showToast({ type: 'error', title: 'Kopieren fehlgeschlagen' })
        return
      }

      cooldownRef.current.set(text, now)
      setCopiedHook(text)
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
      copyTimerRef.current = window.setTimeout(() => setCopiedHook(null), COPY_FEEDBACK_MS)

      const store = recordHookCopy(text)
      setRecentCopies(store.recentCopies)

      showToast({
        type: 'success',
        title: '✓ Hook kopiert',
        durationMs: COPY_FEEDBACK_MS,
      })
    },
    [showToast],
  )

  return { copiedHook, copyHook, recentCopies }
}
