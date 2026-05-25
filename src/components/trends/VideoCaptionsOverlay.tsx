import { useEffect, useState } from 'react'
import { cn } from '@/lib'

type VideoCaptionsOverlayProps = {
  captions: string[]
  isPlaying: boolean
  className?: string
}

const CAPTION_INTERVAL_MS = 2_800

export function VideoCaptionsOverlay({
  captions,
  isPlaying,
  className,
}: VideoCaptionsOverlayProps) {
  const lines = captions.filter((c) => c.trim().length > 0)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [lines.join('|')])

  useEffect(() => {
    if (!isPlaying || lines.length <= 1) return
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % lines.length)
    }, CAPTION_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [isPlaying, lines.length])

  if (lines.length === 0) return null

  const current = lines[index] ?? lines[0]

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-12 z-20 flex justify-center px-3',
        className,
      )}
      aria-live="polite"
    >
      <p
        key={`${index}-${current}`}
        className="max-w-[92%] animate-fade-in rounded-lg bg-black/65 px-3 py-2 text-center text-sm font-semibold leading-snug text-white shadow-lg backdrop-blur-sm"
      >
        {current}
      </p>
    </div>
  )
}
