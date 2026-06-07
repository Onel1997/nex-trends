import { useCallback, useRef, useState } from 'react'
import {
  generateCodeWithCredits,
  isAiGenerationError,
} from '@/lib/ai/code-generator'
import { coerceErrorMessage } from '@/lib/ai/parse-code-response'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import type {
  CodeGeneration,
  CodeGenerationRequest,
  CodeGenerationResult,
} from '@/types/code-generation'

export type CodeGenerationStatus = 'idle' | 'checking' | 'generating' | 'success' | 'error'

export function useCodeGenerationFlow() {
  const { requireCredits, refreshUsage, unlimited, isAdmin } = useUsageLimit()

  const [generation, setGeneration] = useState<CodeGeneration | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [status, setStatus] = useState<CodeGenerationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const inFlightRef = useRef(false)

  const generate = useCallback(
    async (
      request: CodeGenerationRequest,
      options?: { skipCreditCharge?: boolean },
    ): Promise<CodeGenerationResult | null> => {
      if (inFlightRef.current) return null

      const requestId = ++requestIdRef.current
      inFlightRef.current = true
      setError(null)

      const skipCredits = options?.skipCreditCharge === true || isAdmin || unlimited

      if (!skipCredits && !requireCredits()) {
        inFlightRef.current = false
        return null
      }

      setStatus('checking')

      try {
        setStatus('generating')

        const idempotencyKey = `code-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
        const result = await generateCodeWithCredits(request, {
          skipCreditCharge: skipCredits,
          idempotencyKey,
        })

        if (requestId !== requestIdRef.current) return null

        setGeneration(result.generation)
        setSummary(result.summary ?? null)
        setStatus('success')

        if (!skipCredits) {
          await refreshUsage()
        }

        return result
      } catch (err) {
        if (requestId !== requestIdRef.current) return null

        const message = isAiGenerationError(err)
          ? coerceErrorMessage(err.message)
          : coerceErrorMessage(err)

        setError(message)
        setStatus('error')
        return null
      } finally {
        if (requestId === requestIdRef.current) {
          inFlightRef.current = false
        }
      }
    },
    [requireCredits, refreshUsage, isAdmin, unlimited],
  )

  const loadFromHistory = useCallback((item: CodeGeneration) => {
    setGeneration(item)
    setSummary(null)
    setStatus('success')
    setError(null)
  }, [])

  const reset = useCallback(() => {
    requestIdRef.current++
    setGeneration(null)
    setSummary(null)
    setStatus('idle')
    setError(null)
  }, [])

  return {
    generation,
    summary,
    status,
    error,
    isGenerating: status === 'checking' || status === 'generating',
    generate,
    loadFromHistory,
    reset,
  }
}
