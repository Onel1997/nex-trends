import { useCallback, useRef, useState } from 'react'
import { runVideoGenerationJob, type VideoJobStatus } from '@/lib/video-generation-pipeline'
import { trackGeneration, patchGeneration } from '@/lib/generation-tracking'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export function useVideoGeneration() {
  const [status, setStatus] = useState<VideoJobStatus>('idle')
  const [detail, setDetail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [posterUrl, setPosterUrl] = useState<string | null>(null)
  const [hasAudio, setHasAudio] = useState(false)
  const abortRef = useRef(false)

  const reset = useCallback(() => {
    abortRef.current = false
    setStatus('idle')
    setDetail(null)
    setError(null)
    setVideoUrl(null)
    setPosterUrl(null)
    setHasAudio(false)
  }, [])

  const generate = useCallback(
    async (trend: TrendIntelligence, options?: { consumeCredits?: boolean }) => {
      abortRef.current = false
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
        credits_used: options?.consumeCredits ? 1 : 0,
      })

      const onStatus = (s: VideoJobStatus, msg?: string) => {
        if (abortRef.current) return
        setStatus(s)
        if (msg) setDetail(msg)
        if (generationId && (s === 'generating' || s === 'completed' || s === 'failed')) {
          void patchGeneration(generationId, {
            status: s,
            error_message: s === 'failed' ? msg : undefined,
          })
        }
      }

      try {
        const result = await runVideoGenerationJob(trend, onStatus)
        if (abortRef.current) return null

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
    [],
  )

  const cancel = useCallback(() => {
    abortRef.current = true
    setStatus('idle')
    setDetail('Abgebrochen')
  }, [])

  const isLoading = status === 'queued' || status === 'generating'

  return {
    status,
    detail,
    error,
    videoUrl,
    posterUrl,
    hasAudio,
    isLoading,
    generate,
    reset,
    cancel,
  }
}
