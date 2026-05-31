import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { SpinnerInline } from '@/components/ui/Spinner'
import { cn, generateId } from '@/lib'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

export type ToastAction = {
  label: string
  onClick: () => void
}

export type Toast = {
  id: string
  type: ToastType
  title: string
  message?: string
  action?: ToastAction
  persistent?: boolean
  position?: 'top' | 'bottom'
}

type ShowToastInput = Omit<Toast, 'id'> & {
  durationMs?: number
}

type ToastContextValue = {
  toasts: Toast[]
  showToast: (toast: ShowToastInput) => string
  dismissToast: (id: string) => void
  showLoadingToast: (title: string, message?: string) => string
  updateToast: (id: string, patch: Partial<Omit<Toast, 'id'>>) => void
}

const MAX_TOASTS = 5
const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<string, number>>(new Map())

  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer !== undefined) {
      window.clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const dismissToast = useCallback(
    (id: string) => {
      clearTimer(id)
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    },
    [clearTimer],
  )

  const scheduleDismiss = useCallback(
    (id: string, durationMs: number) => {
      clearTimer(id)
      const timer = window.setTimeout(() => dismissToast(id), durationMs)
      timersRef.current.set(id, timer)
    },
    [clearTimer, dismissToast],
  )

  const showToast = useCallback(
    (input: ShowToastInput): string => {
      const { durationMs, ...toast } = input
      const id = generateId()
      const persistent = toast.persistent ?? toast.type === 'loading'
      const resolvedDuration =
        durationMs ??
        (toast.type === 'loading' ? 0 : toast.type === 'error' ? 7000 : 5000)

      setToasts((prev) => {
        const next = [...prev, { ...toast, id, persistent }]
        return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next
      })

      if (!persistent && resolvedDuration > 0) {
        scheduleDismiss(id, resolvedDuration)
      }

      return id
    },
    [scheduleDismiss],
  )

  const showLoadingToast = useCallback(
    (title: string, message?: string) =>
      showToast({ type: 'loading', title, message, persistent: true }),
    [showToast],
  )

  const updateToast = useCallback(
    (id: string, patch: Partial<Omit<Toast, 'id'>>) => {
      setToasts((prev) =>
        prev.map((toast) => (toast.id === id ? { ...toast, ...patch } : toast)),
      )

      if (patch.type && patch.type !== 'loading') {
        scheduleDismiss(id, patch.type === 'error' ? 7000 : 5000)
      }
    },
    [scheduleDismiss],
  )

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast, showLoadingToast, updateToast }),
    [toasts, showToast, dismissToast, showLoadingToast, updateToast],
  )

  const topToasts = toasts.filter((t) => t.position !== 'bottom')
  const bottomToasts = toasts.filter((t) => t.position === 'bottom')

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={topToasts} onDismiss={dismissToast} position="top" />
      <ToastViewport toasts={bottomToasts} onDismiss={dismissToast} position="bottom" />
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
  position,
}: {
  toasts: Toast[]
  onDismiss: (id: string) => void
  position: 'top' | 'bottom'
}) {
  if (toasts.length === 0) return null

  const isBottom = position === 'bottom'

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 z-[100] flex flex-col gap-2.5 px-4',
        isBottom
          ? 'bottom-[max(1rem,env(safe-area-inset-bottom,0px))] items-center sm:items-end sm:pr-6'
          : 'top-[max(1rem,env(safe-area-inset-top,0px))] items-center sm:items-end sm:pr-6 sm:top-5',
      )}
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
  const accentStyles: Record<ToastType, string> = {
    success:
      'border-emerald-400/25 bg-zinc-950/85 text-emerald-50 shadow-[0_0_40px_-16px_rgba(16,185,129,0.55)]',
    error:
      'border-red-400/25 bg-zinc-950/85 text-red-50 shadow-[0_0_40px_-16px_rgba(239,68,68,0.45)]',
    warning:
      'border-amber-400/25 bg-zinc-950/85 text-amber-50 shadow-[0_0_40px_-16px_rgba(245,158,11,0.45)]',
    info: 'border-violet-400/30 bg-zinc-950/88 text-zinc-100 shadow-[0_0_48px_-14px_rgba(139,92,246,0.55)]',
    loading:
      'border-violet-400/30 bg-zinc-950/88 text-zinc-100 shadow-[0_0_48px_-14px_rgba(139,92,246,0.55)]',
  }

  const iconStyles: Record<ToastType, string> = {
    success: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/20',
    error: 'bg-red-500/15 text-red-300 ring-red-400/20',
    warning: 'bg-amber-500/15 text-amber-300 ring-amber-400/20',
    info: 'bg-violet-500/15 text-violet-300 ring-violet-400/25',
    loading: 'bg-violet-500/15 text-violet-300 ring-violet-400/25',
  }

  const icons: Record<Exclude<ToastType, 'loading'>, string> = {
    success: '✓',
    error: '!',
    warning: '⚠',
    info: 'i',
  }

  return (
    <div
      role="status"
      className={cn(
        'nex-toast pointer-events-auto w-full max-w-sm animate-toast-in rounded-2xl border px-4 py-3.5 backdrop-blur-2xl',
        accentStyles[toast.type],
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1',
            iconStyles[toast.type],
          )}
          aria-hidden
        >
          {toast.type === 'loading' ? (
            <SpinnerInline size="sm" className="size-4" />
          ) : (
            icons[toast.type]
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug">{toast.title}</p>
          {toast.message && (
            <p className="mt-0.5 text-xs leading-relaxed opacity-85">{toast.message}</p>
          )}
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick()
                onDismiss(toast.id)
              }}
              className="mt-2 text-xs font-semibold text-violet-300 underline-offset-2 transition-smooth hover:text-violet-200 hover:underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        {!toast.persistent && (
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="shrink-0 rounded-lg p-1.5 text-xs opacity-60 transition-smooth hover:bg-white/8 hover:opacity-100"
            aria-label="Schließen"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
