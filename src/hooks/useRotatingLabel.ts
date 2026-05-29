import { useEffect, useState } from 'react'

/** Cycles through labels while `active`; resets to first when inactive. */
export function useRotatingLabel(
  labels: readonly string[],
  active: boolean,
  intervalMs = 2400,
): string {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!active) {
      setIndex(0)
      return
    }

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % labels.length)
    }, intervalMs)

    return () => window.clearInterval(id)
  }, [active, labels, intervalMs])

  return labels[index] ?? labels[0] ?? ''
}
