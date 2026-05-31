import { useCallback, useRef, useState } from 'react'
import {
  runVideoGenerationJob,
  type VideoGenerationResult,
  type VideoJobStatus,
} from '@/lib/video-generation-pipeline'
import {
  formatUserFacingVideoError,
  type PremiumVideoError,
} from '@/lib/video-pipeline-errors'
import { buildVideoBlueprint } from '@/lib/video-blueprint'
import { CRAFTING_MESSAGES } from '@/lib/video-blueprint-loading'
import {
  logVideoPipelineError,
  PREMIUM_PIPELINE_MESSAGES,
  sanitizeVideoUiMessage,
  type VideoFailureKind,
} from '@/lib/video-pipeline-messages'
import { CREDIT_COSTS } from '@/lib/plans'
import { trackGeneration, patchGeneration } from '@/lib/generation-tracking'
import type { StudioCreateOptions } from '@/lib/ai-studio'
import type { TrendIntelligence } from '@/types/trend-intelligence'
import type { VideoBlueprint } from '@/types/video-blueprint'

export const VIDEO_LOADING_MESSAGE = CRAFTING_MESSAGES[0]

export type VideoStudioPhase = 'idle' | 'crafting' | 'rendering' | 'retrying' | 'completed' | 'failed'

export function useVideoGeneration() {
  const [status, setStatus] = useState<VideoJobStatus>('idle')
  const [studioPhase, setStudioPhase] = useState<VideoStudioPhase>('idle')
  const [detail, setDetail] = useState<string | null>(null)
  const [failureKind, setFailureKind] = useState<VideoFailureKind | null>(null)
  const [retryable, setRetryable] = useState(false)
  const [retryAttempt, setRetryAttempt] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [posterUrl, setPosterUrl] = useState<string | null>(null)
  const [hasAudio, setHasAudio] = useState(false)
  const [captions, setCaptions] = useState<string[]>([])
  const [scenePrompt, setScenePrompt] = useState<string | null>(null)
  const [pacing, setPacing] = useState<string | null>(null)
  const [motionStyle, setMotionStyle] = useState<string | null>(null)
  const [visualMood, setVisualMood] = useState<string | null>(null)
  const [voiceoverUrl, setVoiceoverUrl] = useState<string | null>(null)
  const [musicUrl, setMusicUrl] = useState<string | null>(null)
  const [hookText, setHookText] = useState<string | null>(null)
  const [duration, setDuration] = useState<string>('0:15')
  const [jobId, setJobId] = useState<string | null>(null)
  const [provider, setProvider] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<VideoGenerationResult | null>(null)
  const [blueprint, setBlueprint] = useState<VideoBlueprint | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const generatingRef = useRef(false)

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    generatingRef.current = false
    setStatus('idle')
    setStudioPhase('idle')
    setDetail(null)
    setFailureKind(null)
    setRetryable(false)
    setRetryAttempt(0)
    setVideoUrl(null)
    setPosterUrl(null)
    setHasAudio(false)
    setCaptions([])
    setScenePrompt(null)
    setPacing(null)
    setMotionStyle(null)
    setVisualMood(null)
    setVoiceoverUrl(null)
    setMusicUrl(null)
    setHookText(null)
    setDuration('0:15')
    setJobId(null)
    setProvider(null)
    setLastResult(null)
    setBlueprint(null)
  }, [])

  const applyResult = useCallback((result: VideoGenerationResult) => {
    setJobId(result.jobId ?? null)
    setProvider(result.provider ?? null)
    setCaptions(result.captions ?? [])
    setScenePrompt(result.scenePrompt ?? null)
    setPacing(result.pacing ?? null)
    setMotionStyle(result.motionStyle ?? null)
    setVisualMood(result.visualMood ?? null)
    setVoiceoverUrl(result.voiceoverUrl ?? null)
    setMusicUrl(result.musicUrl ?? null)
    setHookText(result.hookText ?? null)
    setDuration(result.duration ?? '0:15')
    setLastResult(result)
  }, [])

  const applyFailure = useCallback((err: unknown) => {
    logVideoPipelineError('generation-failed', err)
    const facing: PremiumVideoError = formatUserFacingVideoError(err)
    setFailureKind(facing.kind)
    setRetryable(facing.retryable)
    setStudioPhase('failed')
    setStatus('failed')
    setDetail(null)
  }, [])

  const generate = useCallback(
    async (
      trend: TrendIntelligence,
      options?: {
        consumeCredits?: boolean
        retry?: boolean
        studio?: StudioCreateOptions
      },
    ): Promise<VideoGenerationResult | null> => {
      if (generatingRef.current) return null

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      generatingRef.current = true

      setFailureKind(null)
      setRetryable(false)
      setRetryAttempt(0)
      setDetail(CRAFTING_MESSAGES[0])
      setLastResult(null)
      setBlueprint(null)
      setStatus('queued')
      setStudioPhase('crafting')

      const generationId = await trackGeneration({
        tool: 'AI Video',
        label: `Video: ${trend.title.slice(0, 40)}`,
        generation_type: 'video',
        status: 'queued',
        niche: trend.niche,
        platform: trend.platform,
        prompt: trend.hookAnalysis?.hookText ?? trend.title,
        credits_used: options?.consumeCredits ? CREDIT_COSTS.ai_video : 0,
      })

      const onStatus = (
        s: VideoJobStatus,
        msg?: string,
        meta?: { retryAttempt?: number },
      ) => {
        if (controller.signal.aborted) return
        setStatus(s)

        if (meta?.retryAttempt) {
          setRetryAttempt(meta.retryAttempt)
          setStudioPhase('retrying')
          setDetail(sanitizeVideoUiMessage(msg, 'retry', meta.retryAttempt))
          return
        }

        if (s === 'queued') {
          setStudioPhase('crafting')
        }

        if (s === 'generating' || s === 'processing') {
          setStudioPhase('rendering')
        }

        if (s === 'queued' || s === 'generating' || s === 'processing') {
          setDetail(
            sanitizeVideoUiMessage(
              msg,
              s === 'queued' ? 'crafting' : meta?.retryAttempt ? 'retry' : 'rendering',
              meta?.retryAttempt ?? 0,
            ),
          )
        } else if (s === 'completed') {
          setDetail(PREMIUM_PIPELINE_MESSAGES.success)
        }

        if (generationId && (s === 'generating' || s === 'processing' || s === 'completed' || s === 'failed')) {
          void patchGeneration(generationId, {
            status: s === 'processing' ? 'generating' : s,
            error_message: s === 'failed' ? '[redacted]' : undefined,
          })
        }
      }

      try {
        const result = await runVideoGenerationJob(
          trend,
          onStatus,
          {
            generationId,
            retryJobId: options?.retry ? jobId ?? undefined : undefined,
            signal: controller.signal,
            studio: options?.studio,
            onRetry: (attempt) => {
              setRetryAttempt(attempt)
              setStudioPhase('retrying')
            },
          },
        )

        if (controller.signal.aborted) return null

        applyResult(result)

        if (result.status === 'completed' && result.blueprint) {
          setVideoUrl(result.videoUrl || null)
          setPosterUrl(result.posterUrl || null)
          setHasAudio(result.hasAudio)
          setBlueprint(buildVideoBlueprint(trend, result))
          setStudioPhase('completed')
          setStatus('completed')
          setDetail(PREMIUM_PIPELINE_MESSAGES.success)
          if (generationId) {
            await patchGeneration(generationId, {
              status: 'completed',
              output_url: result.videoUrl || undefined,
            })
          }
          return result
        }

        applyResult(result)
        applyFailure(result.message)
        if (generationId) {
          await patchGeneration(generationId, { status: 'failed', error_message: '[redacted]' })
        }
        return result
      } catch (err) {
        applyFailure(err)
        if (generationId) {
          await patchGeneration(generationId, { status: 'failed', error_message: '[redacted]' })
        }
        return null
      } finally {
        generatingRef.current = false
      }
    },
    [applyResult, applyFailure, jobId],
  )

  const retry = useCallback(
    async (trend: TrendIntelligence) => {
      setFailureKind(null)
      setRetryAttempt(0)
      return generate(trend, { retry: Boolean(jobId) })
    },
    [generate, jobId],
  )

  const dismissFailure = useCallback(() => {
    setFailureKind(null)
    setStudioPhase('idle')
    setStatus('idle')
    setRetryAttempt(0)
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    generatingRef.current = false
    setStatus('idle')
    setStudioPhase('idle')
    setDetail(null)
    setFailureKind(null)
  }, [])

  const isLoading =
    status === 'queued' || status === 'generating' || status === 'processing'
  const isCrafting = studioPhase === 'crafting'
  const isRetrying = studioPhase === 'retrying'
  const showStudioLoading =
    studioPhase === 'crafting' || studioPhase === 'rendering' || studioPhase === 'retrying'
  const showFailure = studioPhase === 'failed' && failureKind !== null

  return {
    status,
    studioPhase,
    detail,
    failureKind,
    retryable,
    retryAttempt,
    videoUrl,
    posterUrl,
    hasAudio,
    captions,
    scenePrompt,
    pacing,
    motionStyle,
    visualMood,
    voiceoverUrl,
    musicUrl,
    hookText,
    duration,
    jobId,
    provider,
    lastResult,
    blueprint,
    isLoading,
    isCrafting,
    isRetrying,
    showStudioLoading,
    showFailure,
    generate,
    retry,
    reset,
    dismissFailure,
    cancel,
  }
}
