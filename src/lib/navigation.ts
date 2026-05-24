import { SIDEBAR_ITEMS, type DashboardToolId } from './constants'

const VALID_TOOL_IDS = new Set<string>(SIDEBAR_ITEMS.map((item) => item.id))

export function isValidToolId(value: string): value is DashboardToolId {
  return VALID_TOOL_IDS.has(value)
}

export function readToolFromUrl(): DashboardToolId {
  const params = new URLSearchParams(window.location.search)
  const tool = params.get('tool')
  if (tool && isValidToolId(tool)) return tool
  return 'trends'
}

export function writeToolToUrl(tool: DashboardToolId) {
  const url = new URL(window.location.href)

  if (tool === 'trends') {
    url.searchParams.delete('tool')
  } else {
    url.searchParams.set('tool', tool)
  }

  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

export function clearCheckoutParams() {
  const url = new URL(window.location.href)
  url.searchParams.delete('checkout')
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

export function readCheckoutParam(): 'success' | 'cancel' | null {
  const value = new URLSearchParams(window.location.search).get('checkout')
  if (value === 'success' || value === 'cancel') return value
  return null
}

export function navigateToHome() {
  writeToolToUrl('trends')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function navigateToLanding() {
  window.location.href = '/'
}
