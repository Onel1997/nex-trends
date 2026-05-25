import { useEffect, useState } from 'react'

function detectTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(hover: none) and (pointer: coarse)').matches
  )
}

export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(detectTouchDevice)

  useEffect(() => {
    const mq = window.matchMedia('(hover: none) and (pointer: coarse)')
    const update = () => setIsTouch(detectTouchDevice())
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isTouch
}
