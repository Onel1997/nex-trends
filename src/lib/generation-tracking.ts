import { invokeEdgeFunction } from '@/lib/edgeFunctions'
import { logGenerationUsage } from '@/lib/usage'
import { isDebugLoggingEnabled, readViteEnvFlag } from '@/lib/runtime'

export type GenerationType = 'text' | 'video' | 'audio' | 'search' | 'image'
export type GenerationStatus = 'queued' | 'generating' | 'completed' | 'failed'

export type TrackGenerationInput = {
  tool: string
  label: string
  generation_type?: GenerationType
  status?: GenerationStatus
  niche?: string
  platform?: string
  prompt?: string
  credits_used?: number
  output_url?: string
  error_message?: string
}

function isGenerationTrackingDebug(): boolean {
  return isDebugLoggingEnabled() || readViteEnvFlag('VITE_ADMIN_DEBUG') === 'true'
}

function log(scope: string, detail?: unknown) {
  if (isGenerationTrackingDebug()) console.debug(`[GenerationTracking] ${scope}`, detail ?? '')
}

function logWarn(scope: string, detail?: unknown) {
  console.warn(`[GenerationTracking] ${scope}`, detail ?? '')
}

/** Persists one analytics row — never throws. */
export async function trackGeneration(input: TrackGenerationInput): Promise<string | null> {
  log('track', {
    tool: input.tool,
    type: input.generation_type ?? 'text',
    status: input.status ?? 'completed',
  })

  try {
    const result = await invokeEdgeFunction<{ ok?: boolean; generationId?: string }>(
      'usage-limit',
      {
        action: 'log_generation',
        tool: input.tool,
        label: input.label,
        generation_type: input.generation_type ?? 'text',
        status: input.status ?? 'completed',
        niche: input.niche,
        platform: input.platform,
        prompt: input.prompt ?? input.label,
        credits_used: input.credits_used ?? 1,
        output_url: input.output_url,
        error_message: input.error_message,
      },
    )
    if (result?.generationId) {
      log('tracked', result.generationId)
      return result.generationId
    }
    return null
  } catch (err) {
    logWarn('track failed, fallback logGenerationUsage', err)
    void logGenerationUsage({
      tool: input.tool,
      label: input.label,
      niche: input.niche,
      platform: input.platform,
      prompt: input.prompt ?? input.label,
      credits_used: input.credits_used,
    })
    return null
  }
}

export async function patchGeneration(
  generationId: string,
  patch: {
    status: GenerationStatus
    output_url?: string
    error_message?: string
  },
): Promise<void> {
  log('patch', { generationId, ...patch })
  try {
    await invokeEdgeFunction('usage-limit', {
      action: 'update_generation',
      generation_id: generationId,
      ...patch,
    })
  } catch (err) {
    logWarn('patch failed', err)
  }
}
