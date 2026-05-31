import { useEffect, useState } from 'react'

export function useScrollPast(threshold = 480) {
  const [past, setPast] = useState(false)

  useEffect(() => {
    function onScroll() {
      setPast(window.scrollY > threshold)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return past
}
