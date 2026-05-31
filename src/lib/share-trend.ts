import { buildTrendShareUrl } from '@/lib/trend-analysis-copy'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export type ShareTrendResult = 'shared' | 'copied' | 'cancelled'

function isShareCancelled(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'AbortError') return true
  if (err instanceof Error && err.name === 'AbortError') return true
  return false
}

/** Copy text with Clipboard API or legacy fallback (iOS / non-secure contexts). */
export async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // fall through to legacy copy
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '0'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  try {
    const ok = document.execCommand('copy')
    if (!ok) throw new Error('execCommand copy failed')
  } finally {
    document.body.removeChild(textarea)
  }
}

export async function shareTrend(trend: TrendIntelligence): Promise<ShareTrendResult> {
  const url = buildTrendShareUrl(trend)
  const title = trend.title
  const text = trend.hookAnalysis.hookText

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url })
      return 'shared'
    } catch (err) {
      if (isShareCancelled(err)) return 'cancelled'
      // Unsupported payload or share failed — fall back to clipboard
    }
  }

  await copyTextToClipboard(url)
  return 'copied'
}
