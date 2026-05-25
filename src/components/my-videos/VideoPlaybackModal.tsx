import { useCallback, useEffect, useRef, useState } from 'react'
import { VideoCaptionsOverlay } from '@/components/trends/VideoCaptionsOverlay'
import { CloseIcon, VolumeOffIcon, VolumeOnIcon } from '@/components/ui/icons'
import { cn } from '@/lib'
import type { SavedAiVideo } from '@/types/ai-video-library'

type VideoPlaybackModalProps = {
  video: SavedAiVideo | null
  onClose: () => void
}

export function VideoPlaybackModal({ video, onClose }: VideoPlaybackModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const voiceRef = useRef<HTMLAudioElement>(null)
  const musicRef = useRef<HTMLAudioElement>(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)

  const hasExternalAudio = Boolean(video?.voiceoverUrl || video?.musicUrl)

  useEffect(() => {
    if (!video) return
    setMuted(true)
    setPlaying(false)
  }, [video])

  useEffect(() => {
    if (!video) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [video, onClose])

  const syncExternalAudio = useCallback(
    (play: boolean) => {
      const voice = voiceRef.current
      const music = musicRef.current
      if (!play) {
        voice?.pause()
        music?.pause()
        return
      }
      if (voice && video?.voiceoverUrl) {
        voice.currentTime = 0
        void voice.play().catch(() => undefined)
      }
      if (music && video?.musicUrl) {
        music.volume = 0.35
        music.currentTime = 0
        void music.play().catch(() => undefined)
      }
    },
    [video?.voiceoverUrl, video?.musicUrl],
  )

  useEffect(() => {
    if (!video?.videoUrl) return
    const el = videoRef.current
    if (!el) return

    el.muted = muted || hasExternalAudio
    el.playsInline = true
    el.setAttribute('playsinline', '')
    el.setAttribute('webkit-playsinline', 'true')

    const play = async () => {
      try {
        await el.play()
        setPlaying(true)
        if (!muted) syncExternalAudio(true)
      } catch {
        setPlaying(false)
      }
    }

    void play()

    return () => {
      el.pause()
      syncExternalAudio(false)
    }
  }, [video?.videoUrl, muted, hasExternalAudio, syncExternalAudio])

  if (!video?.videoUrl) return null

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Video: ${video.title}`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
        aria-label="Schließen"
      />

      <article
        className={cn(
          'relative z-10 flex w-full max-w-md flex-col overflow-hidden',
          'rounded-t-3xl border border-violet-500/20 bg-zinc-950/95 shadow-[0_0_60px_-12px_rgba(139,92,246,0.45)]',
          'animate-sheet-up sm:max-h-[92vh] sm:rounded-3xl',
        )}
      >
        <header className="flex items-center justify-between gap-3 border-b border-zinc-800/60 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{video.title}</p>
            <p className="truncate text-xs text-zinc-500">
              {video.platform || 'Multi-Platform'} · {video.duration}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800/60 bg-zinc-900/60 text-zinc-400 transition-smooth hover:text-white"
            aria-label="Schließen"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        <div className="relative mx-auto w-full max-w-[min(100%,280px)] bg-black">
          {video.voiceoverUrl ? (
            <audio ref={voiceRef} src={video.voiceoverUrl} preload="auto" className="hidden" />
          ) : null}
          {video.musicUrl ? (
            <audio ref={musicRef} src={video.musicUrl} preload="auto" loop className="hidden" />
          ) : null}

          <video
            ref={videoRef}
            src={video.videoUrl}
            poster={video.posterUrl ?? undefined}
            className="aspect-[9/16] w-full object-cover"
            playsInline
            loop
            autoPlay
            muted={muted || hasExternalAudio}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />

          <VideoCaptionsOverlay
            captions={video.captions}
            isPlaying={playing}
            className="bottom-16"
          />

          <button
            type="button"
            onClick={() => {
              const next = !muted
              setMuted(next)
              const el = videoRef.current
              if (el) {
                el.muted = next || hasExternalAudio
                if (!next) syncExternalAudio(true)
                else syncExternalAudio(false)
              }
            }}
            className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-md transition-smooth hover:bg-black/70"
            aria-label={muted ? 'Ton einschalten' : 'Stumm schalten'}
          >
            {muted ? (
              <VolumeOffIcon className="size-5" />
            ) : (
              <VolumeOnIcon className="size-5" />
            )}
          </button>
        </div>

        <footer className="border-t border-zinc-800/60 px-4 py-3 text-center text-[11px] text-zinc-500">
          Vertikale Vorschau · 9:16
        </footer>
      </article>
    </div>
  )
}
