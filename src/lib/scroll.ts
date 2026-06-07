import { isBrowser } from '@/lib/runtime'

export function scrollToSection(id: string) {
  if (!isBrowser()) return
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
