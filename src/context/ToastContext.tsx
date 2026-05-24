import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { cn, generateId } from '@/lib'

export type ToastType = 'success' | 'error' | 'info'

export type Toast = {
  id: string
  type: ToastType
  title: string
  message?: string
}

type ToastContextValue = {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'> & { durationMs?: number }) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    ({ durationMs = 5000, ...toast }: Omit<Toast, 'id'> & { durationMs?: number }) => {
      const id = generateId()
      setToasts((prev) => [...prev, { ...toast, id }])

      window.setTimeout(() => {
        dismissToast(id)
      }, durationMs)
    },
    [dismissToast],
  )

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: (id: string) => void
}) {
  const styles: Record<ToastType, string> = {
    success: 'border-emerald-500/30 bg-emerald-950/90 text-emerald-50',
    error: 'border-red-500/30 bg-red-950/90 text-red-50',
    info: 'border-violet-500/30 bg-zinc-950/95 text-zinc-100',
  }

  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '!',
    info: 'i',
  }

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto w-full max-w-sm animate-fade-in-scale rounded-xl border px-4 py-3.5 shadow-2xl shadow-black/40 backdrop-blur-xl',
        styles[toast.type],
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold"
          aria-hidden
        >
          {icons[toast.type]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.message && (
            <p className="mt-0.5 text-xs opacity-90">{toast.message}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 rounded-lg p-1.5 text-xs opacity-70 transition-smooth hover:bg-white/10 hover:opacity-100"
          aria-label="Schließen"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
