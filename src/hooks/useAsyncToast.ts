import { useCallback } from 'react'
import { useToast } from '@/context/ToastContext'
import { normalizeError } from '@/lib/errors'

type AsyncToastOptions = {
  loadingTitle: string
  loadingMessage?: string
  successTitle: string
  successMessage?: string
  errorTitle?: string
}

/**
 * Wraps an async action with loading → success/error toast transitions.
 */
export function useAsyncToast() {
  const { showLoadingToast, updateToast } = useToast()

  const runWithToast = useCallback(
    async <T,>(action: () => Promise<T>, options: AsyncToastOptions): Promise<T | null> => {
      const toastId = showLoadingToast(options.loadingTitle, options.loadingMessage)

      try {
        const result = await action()
        updateToast(toastId, {
          type: 'success',
          title: options.successTitle,
          message: options.successMessage,
          persistent: false,
        })
        return result
      } catch (err) {
        const normalized = normalizeError(err)
        updateToast(toastId, {
          type: 'error',
          title: options.errorTitle ?? normalized.title,
          message: normalized.message,
          persistent: false,
        })
        return null
      }
    },
    [showLoadingToast, updateToast],
  )

  return { runWithToast }
}
