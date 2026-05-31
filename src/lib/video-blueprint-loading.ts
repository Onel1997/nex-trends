export const CRAFTING_MESSAGES = [
  'Analysiere Viral-Struktur...',
  'Berechne Hook-Potenzial...',
  'Generiere Storyboard...',
  'Optimiere Retention...',
  'Baue CTA Sequenz...',
] as const

const MIN_CRAFT_MS = 2000
const MAX_CRAFT_MS = 4000

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Abgebrochen'))
      return
    }
    const timer = window.setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer)
        reject(new Error('Abgebrochen'))
      },
      { once: true },
    )
  })
}

/** Cinematic crafting phase — 2–4s minimum with rotating strategist messages. */
export async function runCraftingPhase(
  onMessage: (message: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const totalMs = MIN_CRAFT_MS + Math.floor(Math.random() * (MAX_CRAFT_MS - MIN_CRAFT_MS))
  const stepMs = Math.max(450, Math.floor(totalMs / CRAFTING_MESSAGES.length))
  const started = Date.now()

  for (let i = 0; i < CRAFTING_MESSAGES.length; i++) {
    if (signal?.aborted) throw new Error('Abgebrochen')
    onMessage(CRAFTING_MESSAGES[i])
    const elapsed = Date.now() - started
    const remaining = totalMs - elapsed
    if (i < CRAFTING_MESSAGES.length - 1) {
      await sleep(Math.min(stepMs, remaining), signal)
    }
  }

  const rest = totalMs - (Date.now() - started)
  if (rest > 0) await sleep(rest, signal)
}
