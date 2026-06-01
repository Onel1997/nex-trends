import { useCallback, useRef, useState } from 'react'
import {
  generateHooksWithCredits,
  isAiGenerationError,
} from '@/lib/ai/hook-generator'
import {
  coerceErrorMessage,
  normalizeGeneratedHooksRow,
  normalizeHooksList,
} from '@/lib/ai/parse-hooks-response'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import type {
  GeneratedHooksRow,
  HookGenerationRequest,
} from '@/types/ai-generation'

export type HookGenerationStatus = 'idle' | 'checking' | 'generating' | 'success' | 'error'

export function useHookGenerationFlow() {
  const {
    requireCredits,
    refreshUsage,
    openUpgradeModal,
    unlimited,
  } = useUsageLimit()

  const [hooks, setHooks] = useState<string[]>([])
  const [generation, setGeneration] = useState<GeneratedHooksRow | null>(null)
  const [status, setStatus] = useState<HookGenerationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const inFlightRef = useRef(false)

  const generate = useCallback(
    async (
      request: HookGenerationRequest,
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

        const idempotencyKey = `hook-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
        const result = await generateHooksWithCredits(request, {
          skipCreditCharge: options?.skipCreditCharge,
          idempotencyKey,
        })

        if (requestId !== requestIdRef.current) return null

        setHooks(normalizeHooksList(result.hooks))
        setGeneration(normalizeGeneratedHooksRow(result.generation))
        setStatus('success')

        if (!options?.skipCreditCharge) {
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

  const loadFromHistory = useCallback((row: GeneratedHooksRow) => {
    const normalized = normalizeGeneratedHooksRow(row)
    setHooks(normalized.generated_hooks_json)
    setGeneration(normalized)
    setStatus('success')
    setError(null)
  }, [])

  const reset = useCallback(() => {
    requestIdRef.current++
    setHooks([])
    setGeneration(null)
    setStatus('idle')
    setError(null)
  }, [])

  return {
    hooks,
    generation,
    status,
    error,
    isGenerating: status === 'checking' || status === 'generating',
    generate,
    loadFromHistory,
    reset,
  }
}
