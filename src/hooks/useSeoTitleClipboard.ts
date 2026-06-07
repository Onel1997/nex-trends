import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '@/context/ToastContext'
import { copyToClipboard } from '@/lib/clipboard'
import { getSeoTitleRecentCopies, recordSeoTitleCopy } from '@/lib/seo-title-analytics'
import { formatSeoTitleForClipboard, getSeoTitleVariantKey } from '@/lib/seo-title-display'
import type { SeoTitleVariant } from '@/types/seo-title-generation'

const COPY_FEEDBACK_MS = 2200
const COPY_COOLDOWN_MS = 700
const COPY_TOAST_MS = 2000

export function useSeoTitleClipboard() {
  const { showToast } = useToast()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [copyToastVisible, setCopyToastVisible] = useState(false)
  const [recentCopies, setRecentCopies] = useState(() => getSeoTitleRecentCopies())
  const copyTimerRef = useRef<number | null>(null)
  const copyToastTimerRef = useRef<number | null>(null)
  const cooldownRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
      if (copyToastTimerRef.current) window.clearTimeout(copyToastTimerRef.current)
    }
  }, [])

  const copyVariant = useCallback(
    async (variant: SeoTitleVariant) => {
      const key = getSeoTitleVariantKey(variant)
      const text = formatSeoTitleForClipboard(variant)
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

      const store = recordSeoTitleCopy(variant.title)
      setRecentCopies(store.recentCopies)

      setCopyToastVisible(true)
      if (copyToastTimerRef.current) window.clearTimeout(copyToastTimerRef.current)
      copyToastTimerRef.current = window.setTimeout(
        () => setCopyToastVisible(false),
        COPY_TOAST_MS,
      )
    },
    [showToast],
  )

  return { copiedKey, copyVariant, recentCopies, copyToastVisible }
}
