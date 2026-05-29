import { useCallback, useRef, useState } from 'react'
import {
  generateAdCopyWithCredits,
  isAiGenerationError,
} from '@/lib/ai/ad-copy-generator'
import { coerceErrorMessage } from '@/lib/ai/parse-ad-copy-response'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import type {
  AdCopyGenerationBatch,
  AdCopyGenerationRequest,
  AdCopyVariantWithId,
} from '@/types/ad-copy-generation'

export type AdCopyGenerationStatus = 'idle' | 'checking' | 'generating' | 'success' | 'error'

export function useAdCopyGenerationFlow() {
  const {
    requireCredits,
    refreshUsage,
    openUpgradeModal,
    unlimited,
  } = useUsageLimit()

  const [variants, setVariants] = useState<AdCopyVariantWithId[]>([])
  const [generation, setGeneration] = useState<AdCopyGenerationBatch | null>(null)
  const [status, setStatus] = useState<AdCopyGenerationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const inFlightRef = useRef(false)

  const generate = useCallback(
    async (
      request: AdCopyGenerationRequest,
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

        const idempotencyKey = `ad-copy-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
        const result = await generateAdCopyWithCredits(request, {
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

  const loadFromHistory = useCallback((batch: AdCopyGenerationBatch) => {
    setVariants(batch.variants)
    setGeneration(batch)
    setStatus('success')
    setError(null)
  }, [])

  const updateVariantSaved = useCallback((rowId: string, isSaved: boolean) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === rowId ? { ...v, is_saved: isSaved } : v)),
    )
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
