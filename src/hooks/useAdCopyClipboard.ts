import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '@/context/ToastContext'
import { copyToClipboard } from '@/lib/clipboard'
import { getAdCopyRecentCopies, recordAdCopyCopy } from '@/lib/ad-copy-analytics'
import { formatAdCopyForClipboard, getAdCopyVariantKey } from '@/lib/ad-copy-display'
import type { AdCopyVariant } from '@/types/ad-copy-generation'

const COPY_FEEDBACK_MS = 2200
const COPY_COOLDOWN_MS = 700

export function useAdCopyClipboard() {
  const { showToast } = useToast()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [recentCopies, setRecentCopies] = useState(() => getAdCopyRecentCopies())
  const copyTimerRef = useRef<number | null>(null)
  const cooldownRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
    }
  }, [])

  const copyVariant = useCallback(
    async (variant: AdCopyVariant) => {
      const key = getAdCopyVariantKey(variant)
      const text = formatAdCopyForClipboard(variant)
      const now = Date.now()
      const lastCopy = cooldownRef.current.get(key) ?? 0
      if (now - lastCopy < COPY_COOLDOWN_MS) return

      const ok = await copyToClipboard(text)
      if (!ok) {
        showToast({ type: 'error', title: 'Kopieren fehlgeschlagen' })
        return
      }

      cooldownRef.current.set(key, now)
      setCopiedKey(key)
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
      copyTimerRef.current = window.setTimeout(() => setCopiedKey(null), COPY_FEEDBACK_MS)

      const store = recordAdCopyCopy(variant.headline)
      setRecentCopies(store.recentCopies)

      showToast({
        type: 'success',
        title: 'Ad Copy kopiert',
        message: variant.headline.length > 48 ? `${variant.headline.slice(0, 45)}…` : variant.headline,
        durationMs: 3200,
      })
    },
    [showToast],
  )

  return { copiedKey, copyVariant, recentCopies }
}
