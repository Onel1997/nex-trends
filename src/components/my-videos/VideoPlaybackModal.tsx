import { useCallback, useEffect, useRef, useState } from 'react'
import { VideoCaptionsOverlay } from '@/components/trends/VideoCaptionsOverlay'
import {
  CloseIcon,
  DownloadIcon,
  VolumeOffIcon,
  VolumeOnIcon,
} from '@/components/ui/icons'
import { cn } from '@/lib'
import { downloadVideoMp4 } from '@/lib/my-videos-api'
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
    const prevOverflow = document.body.style.overflow
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
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

  const canDownload = video.status === 'completed'

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center overflow-hidden sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Video: ${video.title}`}
    >
      <button
        type="button"
        className="absolute inset-0 animate-modal-backdrop bg-black/85 backdrop-blur-xl"
        onClick={onClose}
        aria-label="Schließen"
      />

      <article
        className={cn(
          'studio-modal-glow relative z-10 flex w-full max-w-lg flex-col overflow-hidden',
          'max-h-[min(100dvh,920px)] border border-violet-500/25 bg-zinc-950/95',
          'shadow-[0_0_80px_-16px_rgba(139,92,246,0.55)]',
          'animate-modal-panel rounded-t-3xl sm:max-h-[92vh] sm:rounded-3xl',
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-800/50 px-4 py-4 sm:px-5">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-400/90">
              AI Video Preview
            </p>
            <h2 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
              {video.title}
            </h2>
            <p className="truncate text-xs text-zinc-500">
              {video.platform || 'Multi-Platform'} · {video.duration}
              {video.niche ? ` · ${video.niche}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-press flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800/60 bg-zinc-900/70 text-zinc-400 transition-smooth hover:text-white"
            aria-label="Schließen"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          <div className="relative mx-auto w-full max-w-[min(100%,300px)]">
            <div className="studio-cinematic-frame overflow-hidden rounded-2xl bg-black">
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
                className="aspect-[9/16] w-full object-cover object-center"
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
                className="bottom-20"
              />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
            </div>

            <div className="absolute right-2 top-2 z-20 flex flex-col gap-2 sm:right-3 sm:top-3">
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
                className={cn(
                  'btn-press flex size-11 items-center justify-center rounded-full',
                  'border border-white/15 bg-black/55 text-white backdrop-blur-md',
                  'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.6)] transition-smooth',
                  'hover:bg-black/75 hover:ring-2 hover:ring-violet-500/30',
                )}
                aria-label={muted ? 'Ton einschalten' : 'Stumm schalten'}
              >
                {muted ? (
                  <VolumeOffIcon className="size-5" />
                ) : (
                  <VolumeOnIcon className="size-5" />
                )}
              </button>
              {canDownload ? (
                <button
                  type="button"
                  onClick={() => downloadVideoMp4(video)}
                  className={cn(
                    'btn-press flex size-11 items-center justify-center rounded-full',
                    'border border-white/15 bg-black/55 text-white backdrop-blur-md',
                    'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.6)] transition-smooth',
                    'hover:bg-violet-600/80 hover:ring-2 hover:ring-violet-500/40',
                  )}
                  aria-label="MP4 herunterladen"
                  title="Download"
                >
                  <DownloadIcon className="size-5" />
                </button>
              ) : null}
            </div>
          </div>

          {video.captions?.length ? (
            <p className="mt-4 text-center text-[11px] text-zinc-600">
              Kinetic captions · {video.captions.length} segments
            </p>
          ) : null}
        </div>

        <footer className="shrink-0 border-t border-zinc-800/50 px-4 py-3 text-center sm:px-5">
          <p className="text-[11px] font-medium text-zinc-500">Vertical preview · 9:16</p>
          <p className="mt-0.5 text-[10px] text-zinc-600">Optimized for TikTok, Reels & Shorts</p>
        </footer>
      </article>
    </div>
  )
}
