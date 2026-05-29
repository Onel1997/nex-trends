import { HOOK_PLATFORM_OPTIONS, HOOK_TONE_OPTIONS } from '@/types/ai-generation'

export const HOOK_CHAR_LIMIT = 120
export const HOOK_CHAR_OPTIMAL = 80

export type HookCharState = 'optimal' | 'warning' | 'over'

export function getHookCharState(length: number): HookCharState {
  if (length <= HOOK_CHAR_OPTIMAL) return 'optimal'
  if (length <= HOOK_CHAR_LIMIT) return 'warning'
  return 'over'
}

export function getHookCharCountClass(state: HookCharState): string {
  switch (state) {
    case 'optimal':
      return 'text-emerald-400/85'
    case 'warning':
      return 'text-amber-400/85'
    case 'over':
      return 'text-red-400/85'
  }
}

export function formatHookDate(
  iso: string,
  style: 'short' | 'long' | 'relative' = 'short',
): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  if (style === 'relative') {
    const diffMs = Date.now() - date.getTime()
    const diffMin = Math.floor(diffMs / 60_000)
    if (diffMin < 1) return 'Gerade eben'
    if (diffMin < 60) return `Vor ${diffMin} Min.`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `Vor ${diffH} Std.`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 7) return `Vor ${diffD} Tag${diffD === 1 ? '' : 'en'}`
  }

  if (style === 'long') {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getToneLabel(tone: string | null | undefined): string {
  if (!tone) return ''
  const match = HOOK_TONE_OPTIONS.find((o) => o.value === tone)
  return match?.label ?? tone
}

export function getPlatformLabel(platform: string | null | undefined): string {
  if (!platform) return ''
  const match = HOOK_PLATFORM_OPTIONS.find((o) => o.value === platform)
  return match?.label ?? platform
}
