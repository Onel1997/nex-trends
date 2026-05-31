import { useCallback } from 'react'
import { useToast } from '@/context/ToastContext'
import { normalizeError, type NormalizedError } from '@/lib/errors'

type HandleErrorOptions = {
  /** Override toast title */
  title?: string
  /** Show toast notification (default true) */
  toast?: boolean
  /** Retry callback — adds retry action to toast when retryable */
  onRetry?: () => void
}

export function useErrorHandler() {
  const { showToast } = useToast()

  const handleError = useCallback(
    (error: unknown, options: HandleErrorOptions = {}): NormalizedError => {
      const normalized = normalizeError(error)
      const { title, toast = true, onRetry } = options

      if (toast) {
        showToast({
          type: 'error',
          title: title ?? normalized.title,
          message: normalized.message,
          action:
            normalized.retryable && onRetry
              ? { label: 'Erneut versuchen', onClick: onRetry }
              : undefined,
        })
      }

      return normalized
    },
    [showToast],
  )

  return { handleError, normalizeError }
}
