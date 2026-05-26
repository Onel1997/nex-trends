import { useCallback, useRef, useState } from 'react'
import {
  generateHooksWithCredits,
  isAiGenerationError,
} from '@/lib/ai/hook-generator'
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

  const generate = useCallback(
    async (
      request: HookGenerationRequest,
      options?: { skipCreditCharge?: boolean },
    ) => {
      const requestId = ++requestIdRef.current
      setError(null)

      if (!options?.skipCreditCharge && !requireCredits()) {
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

        setHooks(result.hooks)
        setGeneration(result.generation)
        setStatus('success')

        if (!options?.skipCreditCharge && !unlimited) {
          await refreshUsage()
        }

        return result
      } catch (err) {
        if (requestId !== requestIdRef.current) return null

        if (isAiGenerationError(err)) {
          setError(err.message)
          if (err.code === 'insufficient_credits') {
            openUpgradeModal()
          }
        } else {
          setError(err instanceof Error ? err.message : 'Generierung fehlgeschlagen.')
        }

        setStatus('error')
        return null
      }
    },
    [requireCredits, refreshUsage, openUpgradeModal, unlimited],
  )

  const loadFromHistory = useCallback((row: GeneratedHooksRow) => {
    setHooks(row.generated_hooks_json ?? [])
    setGeneration(row)
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
