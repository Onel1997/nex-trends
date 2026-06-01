import { useEffect, useRef, useState } from 'react'

type UseInViewOptions = {
  rootMargin?: string
  threshold?: number
  once?: boolean
}

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {},
) {
  const { rootMargin = '0px 0px -8% 0px', threshold = 0.12, once = true } = options
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const isAlreadyVisible = () => {
      const rect = node.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      return rect.top < viewportHeight && rect.bottom > 0
    }

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin, threshold },
    )

    observer.observe(node)

    // iOS Safari / mobile: IO can miss elements already on screen at mount
    if (isAlreadyVisible()) {
      setInView(true)
      if (once) observer.disconnect()
    } else {
      const raf = requestAnimationFrame(() => {
        if (isAlreadyVisible()) {
          setInView(true)
          if (once) observer.disconnect()
        }
      })
      return () => {
        cancelAnimationFrame(raf)
        observer.disconnect()
      }
    }

    return () => observer.disconnect()
  }, [rootMargin, threshold, once])

  return { ref, inView }
}
