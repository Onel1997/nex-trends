import { useCallback, useRef, useState } from 'react'
import {
  generateSeoTitlesWithCredits,
  isAiGenerationError,
} from '@/lib/ai/seo-title-generator'
import { coerceErrorMessage } from '@/lib/ai/parse-seo-title-response'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import type {
  SeoTitleGenerationBatch,
  SeoTitleGenerationRequest,
  SeoTitleVariantWithId,
} from '@/types/seo-title-generation'

export type SeoTitleGenerationStatus = 'idle' | 'checking' | 'generating' | 'success' | 'error'

export function useSeoTitleGenerationFlow() {
  const { requireCredits, refreshUsage, openUpgradeModal, unlimited } = useUsageLimit()

  const [variants, setVariants] = useState<SeoTitleVariantWithId[]>([])
  const [generation, setGeneration] = useState<SeoTitleGenerationBatch | null>(null)
  const [status, setStatus] = useState<SeoTitleGenerationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const inFlightRef = useRef(false)

  const generate = useCallback(
    async (
      request: SeoTitleGenerationRequest,
      options?: { skipCreditCharge?: boolean },
    ) => {
      if (inFlightRef.current) return null

      const requestId = ++requestIdRef.current
      inFlightRef.current = true
      setError(null)

      if (!options?.skipCreditCharge && !requireCredits()) {
        inFlightRef.current = false
        return null
      }

      setStatus('checking')

      try {
        setStatus('generating')

        const idempotencyKey = `seo-title-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
        const result = await generateSeoTitlesWithCredits(request, {
          skipCreditCharge: options?.skipCreditCharge,
          idempotencyKey,
        })

        if (requestId !== requestIdRef.current) return null

        setVariants(result.variants)
        setGeneration(result.generation)
        setStatus('success')

        if (!options?.skipCreditCharge && !unlimited) {
          await refreshUsage()
        }

        return result
      } catch (err) {
        if (requestId !== requestIdRef.current) return null

        const message = isAiGenerationError(err)
          ? coerceErrorMessage(err.message)
          : coerceErrorMessage(err)

        setError(message)

        if (isAiGenerationError(err) && err.code === 'insufficient_credits') {
          openUpgradeModal()
        }

        setStatus('error')
        return null
      } finally {
        if (requestId === requestIdRef.current) {
          inFlightRef.current = false
        }
      }
    },
    [requireCredits, refreshUsage, openUpgradeModal, unlimited],
  )

  const loadFromHistory = useCallback((batch: SeoTitleGenerationBatch) => {
    setVariants(batch.variants)
    setGeneration(batch)
    setStatus('success')
    setError(null)
  }, [])

  const updateVariantSaved = useCallback((rowId: string, isSaved: boolean) => {
    setVariants((prev) => prev.map((v) => (v.id === rowId ? { ...v, is_saved: isSaved } : v)))
    setGeneration((prev) =>
      prev
        ? {
            ...prev,
            variants: prev.variants.map((v) =>
              v.id === rowId ? { ...v, is_saved: isSaved } : v,
            ),
          }
        : prev,
    )
  }, [])

  const reset = useCallback(() => {
    requestIdRef.current++
    setVariants([])
    setGeneration(null)
    setStatus('idle')
    setError(null)
  }, [])

  return {
    variants,
    generation,
    status,
    error,
    isGenerating: status === 'checking' || status === 'generating',
    generate,
    loadFromHistory,
    updateVariantSaved,
    reset,
  }
}
