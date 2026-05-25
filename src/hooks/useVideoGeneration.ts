import { useCallback, useRef, useState } from 'react'
import {
  runVideoGenerationJob,
  type VideoGenerationResult,
  type VideoJobStatus,
} from '@/lib/video-generation-pipeline'
import { trackGeneration, patchGeneration } from '@/lib/generation-tracking'
import type { StudioCreateOptions } from '@/lib/ai-studio'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export function useVideoGeneration() {
  const [status, setStatus] = useState<VideoJobStatus>('idle')
  const [detail, setDetail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [posterUrl, setPosterUrl] = useState<string | null>(null)
  const [hasAudio, setHasAudio] = useState(false)
  const [captions, setCaptions] = useState<string[]>([])
  const [voiceoverUrl, setVoiceoverUrl] = useState<string | null>(null)
  const [musicUrl, setMusicUrl] = useState<string | null>(null)
  const [hookText, setHookText] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [provider, setProvider] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setStatus('idle')
    setDetail(null)
    setError(null)
    setVideoUrl(null)
    setPosterUrl(null)
    setHasAudio(false)
    setCaptions([])
    setVoiceoverUrl(null)
    setMusicUrl(null)
    setHookText(null)
    setJobId(null)
    setProvider(null)
  }, [])

  const applyResult = useCallback((result: VideoGenerationResult) => {
    setJobId(result.jobId ?? null)
    setProvider(result.provider ?? null)
    setCaptions(result.captions ?? [])
    setVoiceoverUrl(result.voiceoverUrl ?? null)
    setMusicUrl(result.musicUrl ?? null)
    setHookText(result.hookText ?? null)
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
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setError(null)
      setDetail(null)

      const generationId = await trackGeneration({
        tool: 'AI Video',
        label: `Video: ${trend.title.slice(0, 40)}`,
        generation_type: 'video',
        status: 'queued',
        niche: trend.niche,
        platform: trend.platform,
        prompt: trend.hookAnalysis?.hookText ?? trend.title,
        credits_used: options?.consumeCredits ? 2 : 0,
      })

      const onStatus = (s: VideoJobStatus, msg?: string) => {
        if (controller.signal.aborted) return
        setStatus(s)
        if (msg) setDetail(msg)
        if (generationId && (s === 'generating' || s === 'processing' || s === 'completed' || s === 'failed')) {
          void patchGeneration(generationId, {
            status: s === 'processing' ? 'generating' : s,
            error_message: s === 'failed' ? msg : undefined,
          })
        }
      }

      try {
        const result = await runVideoGenerationJob(trend, onStatus, {
          generationId,
          retryJobId: options?.retry ? jobId ?? undefined : undefined,
          signal: controller.signal,
          studio: options?.studio,
        })

        if (controller.signal.aborted) return null

        applyResult(result)

        if (result.status === 'completed') {
          setVideoUrl(result.videoUrl)
          setPosterUrl(result.posterUrl)
          setHasAudio(result.hasAudio)
          if (generationId) {
            await patchGeneration(generationId, {
              status: 'completed',
              output_url: result.videoUrl,
            })
          }
          return result
        }

        setError(result.message ?? 'Video-Generierung fehlgeschlagen.')
        setStatus('failed')
        if (generationId) {
          await patchGeneration(generationId, {
            status: 'failed',
            error_message: result.message,
          })
        }
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
        setError(message)
        setStatus('failed')
        if (generationId) {
          await patchGeneration(generationId, { status: 'failed', error_message: message })
        }
        return null
      }
    },
    [applyResult, jobId],
  )

  const retry = useCallback(
    async (trend: TrendIntelligence) => {
      if (!jobId) {
        return generate(trend, { retry: false })
      }
      return generate(trend, { retry: true })
    },
    [generate, jobId],
  )

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setStatus('idle')
    setDetail('Abgebrochen')
  }, [])

  const isLoading =
    status === 'queued' || status === 'generating' || status === 'processing'

  return {
    status,
    detail,
    error,
    videoUrl,
    posterUrl,
    hasAudio,
    captions,
    voiceoverUrl,
    musicUrl,
    hookText,
    jobId,
    provider,
    isLoading,
    generate,
    retry,
    reset,
    cancel,
  }
}
