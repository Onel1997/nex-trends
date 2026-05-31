import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { VideoGenerationHistory } from '@/components/trends/VideoGenerationHistory'
import { VideoGenerationProgress } from '@/components/trends/VideoGenerationProgress'
import { VideoPreview } from '@/components/trends/VideoPreview'
import { useVideoGeneration } from '@/hooks/useVideoGeneration'
import { pickNextFallbackMedia } from '@/lib/trend-media-assignment'
import { TrendAnalysisSummary } from '@/components/trends/TrendAnalysisSummary'
import { TrendMetricsStrip } from '@/components/trends/TrendMetricsStrip'
import { TrendScoreStrip } from '@/components/trends/TrendScoreStrip'
import { TrendStateBadge } from '@/components/trends/TrendStateBadge'
import { Button } from '@/components/ui/Button'
import {
  BookmarkIcon,
  CloseIcon,
  CopyIcon,
  ShareIcon,
  SparklesIcon,
  VerifiedIcon,
} from '@/components/ui/icons'
import { useToast } from '@/context/ToastContext'
import { shareTrend } from '@/lib/share-trend'
import { VELOCITY_META } from '@/lib/trend-intelligence'
import { videoPlaybackManager } from '@/lib/video-playback-manager'
import { cn } from '@/lib'
import type { TrendIntelligence } from '@/types/trend-intelligence'

const TrendHookGenerator = lazy(() =>
  import('@/components/trends/TrendHookGenerator').then((m) => ({
    default: m.TrendHookGenerator,
  })),
)

type TrendDetailModalProps = {
  trend: TrendIntelligence | null
  onClose: () => void
  isSaved?: boolean
  onToggleSave?: (trend: TrendIntelligence) => boolean
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-950/50 px-3 py-2.5 shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-100">{value}</p>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
      <SparklesIcon className="size-3.5 text-violet-400/80" aria-hidden />
      {children}
    </h3>
  )
}

export function TrendDetailModal({
  trend,
  onClose,
  isSaved = false,
  onToggleSave,
}: TrendDetailModalProps) {
  const { showToast } = useToast()
  const videoGen = useVideoGeneration()
  const failedVideosRef = useRef(new Set<string>())
  const [media, setMedia] = useState({
    videoUrl: trend?.videoUrl,
    thumbnailUrl: trend?.thumbnailUrl ?? '',
    videoDuration: trend?.videoDuration,
  })

  useEffect(() => {
    if (!trend) return
    failedVideosRef.current.clear()
    setMedia({
      videoUrl: trend.videoUrl,
      thumbnailUrl: trend.thumbnailUrl,
      videoDuration: trend.videoDuration,
    })
  }, [trend?.id, trend?.videoUrl, trend?.thumbnailUrl, trend?.videoDuration])

  const handleVideoUnavailable = useCallback(() => {
    if (!trend) return
    if (media.videoUrl) failedVideosRef.current.add(media.videoUrl)
    const next = pickNextFallbackMedia(trend.id, trend.niche, media.videoUrl, failedVideosRef.current)
    setMedia({
      videoUrl: next.video,
      thumbnailUrl: next.poster,
      videoDuration: next.duration,
    })
  }, [trend, media.videoUrl])

  useEffect(() => {
    if (!trend) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    videoPlaybackManager.pauseAll()
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      videoPlaybackManager.pauseAll()
    }
  }, [trend, onClose])

  if (!trend) return null

  const velocity = VELOCITY_META[trend.trendVelocity]
  const isTikTok = trend.platform.toLowerCase().includes('tiktok')

  async function copyHook() {
    try {
      await navigator.clipboard.writeText(trend!.hookAnalysis.hookText)
      showToast({ type: 'success', title: 'Hook kopiert', message: 'In Zwischenablage.' })
    } catch {
      showToast({ type: 'error', title: 'Kopieren fehlgeschlagen' })
    }
  }

  function handleSave() {
    if (!onToggleSave) return
    const nowSaved = onToggleSave(trend!)
    showToast({
      type: 'success',
      title: nowSaved ? 'Trend gespeichert' : 'Trend entfernt',
      message: nowSaved ? 'In deiner Bibliothek.' : undefined,
    })
  }

  async function handleShare() {
    try {
      const result = await shareTrend(trend!)
      if (result === 'cancelled') return
      if (result === 'shared') {
        showToast({ type: 'success', title: 'Geteilt' })
        return
      }
      showToast({ type: 'success', title: 'Link kopiert' })
    } catch {
      showToast({ type: 'error', title: 'Teilen fehlgeschlagen' })
    }
  }

  return createPortal(
    <div
      className="trend-detail-modal-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trend-detail-title"
    >
      <button
        type="button"
        aria-label="Detailansicht schließen"
        className="trend-detail-modal-overlay animate-fade-in"
        onClick={onClose}
      />

      <div className="trend-detail-modal-stage">
        <article className="trend-detail-modal-sheet animate-sheet-up sm:animate-fade-in-scale flex flex-col overflow-hidden">
        <div
          className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-zinc-700 sm:hidden"
          aria-hidden
        />

        <div className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider',
                isTikTok
                  ? 'bg-zinc-900 text-white ring-1 ring-zinc-700'
                  : 'bg-gradient-to-r from-violet-600/90 to-fuchsia-600/90 text-white',
              )}
            >
              {trend.platform}
            </span>
            {trend.isDemo && (
              <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-500">
                Beispiel
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition-smooth hover:bg-zinc-800/80 hover:text-white"
            aria-label="Schließen"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain lg:flex-row">
          <div className="video-preview-modal relative w-full shrink-0 bg-zinc-900/30 lg:w-[300px] xl:w-[340px]">
            <VideoPreview
              key={`${trend.id}-${videoGen.videoUrl ?? media.videoUrl ?? 'none'}`}
              playbackId={`modal-${trend.id}`}
              variant="detail"
              enableAudio
              thumbnailUrl={videoGen.posterUrl ?? media.thumbnailUrl}
              videoUrl={videoGen.videoUrl ?? media.videoUrl}
              alt={trend.title}
              duration={media.videoDuration}
              aspectClass="aspect-[9/16] max-h-[42vh] sm:max-h-[50vh] lg:max-h-none lg:min-h-[420px]"
              priority
              isBuffering={videoGen.isLoading}
              captions={videoGen.captions}
              voiceoverUrl={videoGen.voiceoverUrl ?? undefined}
              musicUrl={videoGen.musicUrl ?? undefined}
              onVideoUnavailable={handleVideoUnavailable}
            />
          </div>

          <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6 lg:max-h-[calc(92vh-3rem)] lg:overflow-y-auto">
            <header>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {trend.trendState && <TrendStateBadge state={trend.trendState} size="md" />}
                {trend.niche && (
                  <span className="rounded-full border border-zinc-700/60 bg-zinc-900/60 px-2.5 py-0.5 text-[10px] font-medium text-zinc-400">
                    {trend.niche}
                  </span>
                )}
              </div>
              <h2
                id="trend-detail-title"
                className="text-xl font-semibold tracking-tight text-white sm:text-2xl"
              >
                {trend.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{trend.description}</p>
              {trend.aiInsight && (
                <p className="mt-3 flex items-start gap-2 rounded-xl border border-violet-500/15 bg-violet-500/8 px-3 py-2.5 text-sm text-violet-200/95">
                  <SparklesIcon className="mt-0.5 size-4 shrink-0 text-violet-400" aria-hidden />
                  {trend.aiInsight}
                </p>
              )}
            </header>

            <TrendAnalysisSummary trend={trend} />

            <TrendScoreStrip
              momentum={trend.momentumScore}
              competition={trend.competitionScore}
              opportunity={trend.opportunityScore}
            />

            <div className="space-y-3">
              <Button
                variant="pro"
                size="md"
                loading={videoGen.isLoading}
                disabled={videoGen.isLoading}
                onClick={() => {
                  void videoGen.generate(trend, { consumeCredits: true }).then((result) => {
                    if (result?.status === 'completed') {
                      setMedia({
                        videoUrl: result.videoUrl,
                        thumbnailUrl: result.posterUrl,
                        videoDuration: result.duration,
                      })
                      showToast({
                        type: 'success',
                        title: 'AI Video bereit',
                        message: result.hasAudio
                          ? 'Tippe auf das Video für Wiedergabe mit Voiceover & Musik.'
                          : result.message,
                      })
                    } else if (videoGen.error) {
                      showToast({
                        type: 'error',
                        title: 'Video-Generierung',
                        message: videoGen.error,
                      })
                    }
                  })
                }}
              >
                <SparklesIcon className="size-4" aria-hidden />
                AI Video generieren
              </Button>
              <VideoGenerationProgress
                status={videoGen.status}
                detail={videoGen.detail}
                error={videoGen.error}
                provider={videoGen.provider}
                onCancel={videoGen.cancel}
                onRetry={() => void videoGen.retry(trend)}
              />
              <VideoGenerationHistory
                onSelect={(url, poster) => {
                  setMedia({
                    videoUrl: url,
                    thumbnailUrl: poster ?? media.thumbnailUrl,
                    videoDuration: media.videoDuration,
                  })
                  showToast({
                    type: 'success',
                    title: 'Video aus Verlauf geladen',
                  })
                }}
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-3">
              <img
                src={trend.creator.avatarUrl}
                alt=""
                className="size-11 rounded-full object-cover ring-2 ring-zinc-800/80"
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 text-sm font-semibold text-white">
                  {trend.creator.displayName}
                  {trend.creator.verified && (
                    <VerifiedIcon className="size-4 text-sky-400" aria-label="Verifiziert" />
                  )}
                </p>
                <p className="text-xs text-zinc-500">
                  {trend.creator.handle} · {trend.creator.followers} Follower
                </p>
                {trend.creator.bio && (
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-zinc-400">
                    {trend.creator.bio}
                  </p>
                )}
              </div>
            </div>

            <TrendMetricsStrip trend={trend} variant="modal" />

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MetricPill label="Views" value={trend.views} />
              <MetricPill label="Likes" value={trend.likes} />
              <MetricPill label="Engagement" value={trend.engagementRate} />
              <MetricPill label="Velocity" value={`${velocity.icon} ${velocity.label}`} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => void copyHook()}>
                <CopyIcon className="size-4" aria-hidden />
                Hook kopieren
              </Button>
              {onToggleSave && (
                <Button
                  variant={isSaved ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={handleSave}
                >
                  <BookmarkIcon
                    className={cn('size-4', isSaved && 'fill-current')}
                    aria-hidden
                  />
                  {isSaved ? 'Gespeichert' : 'Trend speichern'}
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => void handleShare()}>
                <ShareIcon className="size-4" aria-hidden />
                Teilen
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {trend.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-violet-500/8 px-2.5 py-1 text-xs font-medium text-violet-300/90 ring-1 ring-violet-500/15"
                >
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>

            <section className="space-y-3 rounded-xl border border-zinc-800/50 bg-zinc-900/25 p-4">
              <SectionTitle>Hook Analyse</SectionTitle>
              <p className="text-sm font-medium leading-relaxed text-white">
                {trend.hookAnalysis.hookText}
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-md bg-zinc-800/60 px-2 py-1 text-zinc-300">
                  {trend.hookAnalysis.hookType}
                </span>
                <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-emerald-400/90">
                  Score {trend.hookAnalysis.hookScore}/100
                </span>
              </div>
              <p className="text-sm text-zinc-400">{trend.hookAnalysis.whyItWorks}</p>
              <p className="text-xs text-zinc-500">
                <span className="font-medium text-zinc-400">Retention:</span>{' '}
                {trend.hookAnalysis.retentionTrigger}
              </p>
            </section>

            <section className="space-y-2 rounded-xl border border-zinc-800/50 bg-zinc-900/25 p-4">
              <SectionTitle>Engagement Analyse</SectionTitle>
              <p className="text-sm text-zinc-400">{trend.engagementPrediction}</p>
            </section>

            {trend.targetAudience && (
              <section className="space-y-2 rounded-xl border border-zinc-800/50 bg-zinc-900/25 p-4">
                <SectionTitle>Zielgruppe</SectionTitle>
                <p className="text-sm text-zinc-300">{trend.targetAudience}</p>
              </section>
            )}

            {trend.whyViral && (
              <section className="space-y-2 rounded-xl border border-zinc-800/50 bg-zinc-900/25 p-4">
                <SectionTitle>Warum viral?</SectionTitle>
                <p className="text-sm leading-relaxed text-zinc-300">{trend.whyViral}</p>
              </section>
            )}

            {trend.aiRecommendations && trend.aiRecommendations.length > 0 && (
              <section className="space-y-3 rounded-xl border border-violet-500/15 bg-violet-500/5 p-4">
                <SectionTitle>AI Empfehlungen</SectionTitle>
                <ul className="space-y-2">
                  {trend.aiRecommendations.map((rec) => (
                    <li
                      key={rec}
                      className="flex gap-2 text-sm text-zinc-300 before:mt-1.5 before:size-1.5 before:shrink-0 before:rounded-full before:bg-violet-400/80 before:content-['']"
                    >
                      {rec}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="space-y-3 rounded-xl border border-zinc-800/50 bg-zinc-900/25 p-4">
              <SectionTitle>Content Breakdown</SectionTitle>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {(
                  [
                    ['Format', trend.contentBreakdown.format],
                    ['Pacing', trend.contentBreakdown.pacing],
                    ['Visual', trend.contentBreakdown.visualStyle],
                    ['CTA', trend.contentBreakdown.ctaStrategy],
                    ...(trend.contentBreakdown.audioTrend
                      ? [['Audio', trend.contentBreakdown.audioTrend] as const]
                      : []),
                    ['Post-Zeit', trend.contentBreakdown.bestPostTime],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                      {label}
                    </dt>
                    <dd className="mt-0.5 text-zinc-300">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {trend.monetizationPotential && (
              <section className="space-y-2 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
                <SectionTitle>Monetization Potential</SectionTitle>
                <p className="text-sm leading-relaxed text-emerald-200/90">
                  {trend.monetizationPotential}
                </p>
              </section>
            )}

            {trend.ctaAngles && trend.ctaAngles.length > 0 && (
              <section className="space-y-3 rounded-xl border border-zinc-800/50 bg-zinc-900/25 p-4">
                <SectionTitle>Suggested CTA Angles</SectionTitle>
                <ul className="space-y-2">
                  {trend.ctaAngles.map((cta) => (
                    <li
                      key={cta}
                      className="rounded-lg border border-zinc-800/40 bg-zinc-950/40 px-3 py-2.5 text-sm text-zinc-300"
                    >
                      {cta}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {trend.risingKeywords && trend.risingKeywords.length > 0 && (
              <section className="space-y-2">
                <SectionTitle>Rising Keywords</SectionTitle>
                <div className="flex flex-wrap gap-1.5">
                  {trend.risingKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-lg bg-zinc-900/60 px-2.5 py-1 text-xs font-medium text-zinc-400 ring-1 ring-zinc-800/60"
                    >
                      #{kw.replace(/^#/, '')}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {trend.hookSuggestions && trend.hookSuggestions.length > 0 && (
              <section className="space-y-3 rounded-xl border border-zinc-800/50 bg-zinc-900/25 p-4">
                <SectionTitle>Recommended Hooks</SectionTitle>
                <ul className="space-y-2">
                  {trend.hookSuggestions.slice(0, 4).map((hook) => (
                    <li
                      key={hook}
                      className="rounded-lg border border-violet-500/10 bg-violet-500/5 px-3 py-2.5 text-sm text-zinc-300"
                    >
                      {hook}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="space-y-2">
              <SectionTitle>Content Ideas</SectionTitle>
              <ul className="space-y-2">
                {trend.contentIdeas.map((idea) => (
                  <li
                    key={idea}
                    className="rounded-lg border border-zinc-800/40 bg-zinc-950/40 px-3 py-2.5 text-sm text-zinc-300"
                  >
                    {idea}
                  </li>
                ))}
              </ul>
            </section>

            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-4">
              <Suspense
                fallback={
                  <div className="h-24 animate-shimmer rounded-lg bg-zinc-800/40" aria-hidden />
                }
              >
                <TrendHookGenerator trend={trend} />
              </Suspense>
            </div>

            <div className="trend-detail-modal-footer sticky bottom-0 z-10 flex gap-2 border-t border-zinc-800/60 bg-[#09090F]/95 p-4 backdrop-blur-md">
              {onToggleSave && (
                <Button
                  variant={isSaved ? 'primary' : 'secondary'}
                  size="md"
                  className="flex-1"
                  onClick={handleSave}
                >
                  <BookmarkIcon className={cn('size-4', isSaved && 'fill-current')} aria-hidden />
                  {isSaved ? 'Gespeichert' : 'Speichern'}
                </Button>
              )}
              <Button
                variant="secondary"
                size="md"
                className={onToggleSave ? 'flex-1' : 'w-full'}
                onClick={() => void handleShare()}
              >
                <ShareIcon className="size-4" aria-hidden />
                Teilen
              </Button>
            </div>
          </div>
        </div>
        </article>
      </div>
    </div>,
    document.body,
  )
}
