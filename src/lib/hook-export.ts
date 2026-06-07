import { getHookText } from '@/lib/ai/parse-hooks-response'
import type { PremiumHook } from '@/types/ai-generation'

export function formatHooksAsText(hooks: PremiumHook[]): string {
  return hooks
    .map((hook, index) => `${index + 1}. ${getHookText(hook)}`)
    .join('\n\n')
}

function slugifyFilename(value: string): string {
  const slug = value
    .slice(0, 48)
    .replace(/[^\w\s-]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
  return slug || 'hooks'
}

export function downloadHooksTxt(hooks: PremiumHook[], filenameBase?: string): void {
  const content = formatHooksAsText(hooks)
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `nextrends-hooks-${slugifyFilename(filenameBase ?? 'hooks')}.txt`
  anchor.click()
  URL.revokeObjectURL(url)
}
