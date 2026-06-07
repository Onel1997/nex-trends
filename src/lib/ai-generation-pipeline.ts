import { trackGeneration, patchGeneration, type GenerationType } from '@/lib/generation-tracking'

export type PipelineStatus = 'idle' | 'queued' | 'generating' | 'completed' | 'failed'

export type PipelineOptions<T> = {
  tool: string
  label: string
  generation_type?: GenerationType
  niche?: string
  platform?: string
  prompt: string
  credits?: number
  timeoutMs?: number
  maxRetries?: number
  /** When false, analytics are left to usage-limit increment (avoids duplicate rows). */
  trackAnalytics?: boolean
  onStatus?: (status: PipelineStatus, detail?: string) => void
  run: () => Promise<T>
}

const DEFAULT_TIMEOUT_MS = 60_000
const DEFAULT_RETRIES = 1

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`${label} — Zeitüberschreitung nach ${Math.round(ms / 1000)}s`))
    }, ms)
    promise
      .then((v) => {
        window.clearTimeout(timer)
        resolve(v)
      })
      .catch((e) => {
        window.clearTimeout(timer)
        reject(e)
      })
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => window.setTimeout(r, ms))
}

/**
 * Unified AI run: status callbacks, timeout, retry, analytics (queued → completed/failed).
 */
export async function runAiGenerationPipeline<T>(
  options: PipelineOptions<T>,
): Promise<T> {
  const {
    tool,
    label,
    generation_type = 'text',
    niche,
    platform,
    prompt,
    credits = 1,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = DEFAULT_RETRIES,
    trackAnalytics = true,
    onStatus,
    run,
  } = options

  onStatus?.('queued', 'In Warteschlange …')
  const generationId = trackAnalytics
    ? await trackGeneration({
    tool,
    label,
    generation_type,
    status: 'queued',
    niche,
    platform,
    prompt,
    credits_used: credits,
  })
    : null

  onStatus?.('generating', 'Generierung läuft …')
  if (generationId) {
    await patchGeneration(generationId, { status: 'generating' })
  }

  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      if (attempt > 0) {
        console.debug(`[AiPipeline] retry ${attempt}/${maxRetries}`, tool)
        await sleep(800 * attempt)
        onStatus?.('generating', `Erneuter Versuch (${attempt + 1}) …`)
      }

      const result = await withTimeout(run(), timeoutMs, tool)
      onStatus?.('completed')

      if (trackAnalytics) {
        if (generationId) {
          await patchGeneration(generationId, { status: 'completed' })
        } else {
          await trackGeneration({
            tool,
            label,
            generation_type,
            status: 'completed',
            niche,
            platform,
            prompt,
            credits_used: credits,
          })
        }
      }

      return result
    } catch (err) {
      lastError = err
      console.error(`[AiPipeline] attempt ${attempt + 1} failed`, tool, err)
      if (attempt >= maxRetries) break
    }
  }

  const message =
    lastError instanceof Error
      ? lastError.message
      : 'Generierung fehlgeschlagen — Provider nicht erreichbar.'

  onStatus?.('failed', message)

  if (trackAnalytics) {
    if (generationId) {
      await patchGeneration(generationId, { status: 'failed', error_message: message })
    } else {
      await trackGeneration({
        tool,
        label,
        generation_type,
        status: 'failed',
        niche,
        platform,
        prompt,
        credits_used: 0,
        error_message: message,
      })
    }
  }

  throw lastError instanceof Error ? lastError : new Error(message)
}
