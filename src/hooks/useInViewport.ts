import { useEffect, useRef, useState } from 'react'

type UseInViewportOptions = {
  rootMargin?: string
  threshold?: number | number[]
  /** When false, the element is treated as always active (e.g. priority / modal). */
  observe?: boolean
  onIntersecting?: (visible: boolean, ratio: number) => void
}

export function useInViewport({
  rootMargin = '80px',
  threshold = 0.15,
  observe = true,
  onIntersecting,
}: UseInViewportOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const onIntersectingRef = useRef(onIntersecting)
  const [inViewport, setInViewport] = useState(() => !observe)
  const [intersectionRatio, setIntersectionRatio] = useState(() => (observe ? 0 : 1))

  useEffect(() => {
    onIntersectingRef.current = onIntersecting
  }, [onIntersecting])

  useEffect(() => {
    if (!observe) {
      queueMicrotask(() => {
        setInViewport(true)
        setIntersectionRatio(1)
        onIntersectingRef.current?.(true, 1)
      })
      return
    }

    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      queueMicrotask(() => {
        setInViewport(true)
        setIntersectionRatio(1)
        onIntersectingRef.current?.(true, 1)
      })
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting
        const ratio = entry.intersectionRatio
        setInViewport(visible)
        setIntersectionRatio(ratio)
        onIntersectingRef.current?.(visible, ratio)
      },
      { rootMargin, threshold },
    )
    observer.observe(el)
    queueMicrotask(() => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      const visible = rect.bottom > 0 && rect.top < vh
      if (visible) {
        const ratio = Math.min(1, Math.max(0, (Math.min(rect.bottom, vh) - Math.max(rect.top, 0)) / rect.height))
        onIntersectingRef.current?.(true, ratio)
      }
    })
    return () => observer.disconnect()
  }, [observe, rootMargin, threshold])

  return { ref, inViewport, intersectionRatio }
}
