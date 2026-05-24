import { useEffect } from 'react'
import { VideoPreview } from '@/components/dashboard/VideoPreview'
import { CloseIcon, SparklesIcon, VerifiedIcon } from '@/components/ui/icons'
import {
  getViralScoreTone,
  VELOCITY_META,
} from '@/lib/trend-intelligence'
import { cn } from '@/lib'
import type { TrendIntelligence } from '@/types/trend-intelligence'

type TrendDetailModalProps = {
  trend: TrendIntelligence | null
  onClose: () => void
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/60 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-100">{value}</p>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-400">
      <SparklesIcon className="size-3.5" aria-hidden />
      {children}
    </h3>
  )
}

function BreakdownItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">{label}</dt>
      <dd className="mt-0.5 text-zinc-300">{value}</dd>
    </div>
  )
}

export function TrendDetailModal({ trend, onClose }: TrendDetailModalProps) {
  useEffect(() => {
    if (!trend) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [trend, onClose])

  if (!trend) return null

  const velocity = VELOCITY_META[trend.trendVelocity]
  const scoreTone = getViralScoreTone(trend.viralScore)
  const isTikTok = trend.platform.toLowerCase().includes('tiktok')

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trend-detail-title"
    >
      <button
        type="button"
        aria-label="Detailansicht schließen"
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      <article
        className={cn(
          'relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden',
          'rounded-t-2xl border border-zinc-800/80 bg-zinc-950/98 sm:rounded-2xl',
          'shadow-[0_0_80px_-20px_rgba(139,92,246,0.35)] backdrop-blur-xl',
          'animate-fade-in-scale',
        )}
      >
        <div className="flex items-center justify-between border-b border-zinc-800/60 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider',
                isTikTok
                  ? 'bg-black text-white ring-1 ring-white/15'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
              )}
            >
              {trend.platform}
            </span>
            {trend.isDemo && (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                Beispiel
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-smooth hover:bg-zinc-800 hover:text-white"
            aria-label="Schließen"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto lg:flex-row">
          <div className="relative w-full shrink-0 lg:w-[280px] xl:w-[320px]">
            <VideoPreview
              thumbnailUrl={trend.thumbnailUrl}
              videoUrl={trend.videoUrl}
              alt={trend.title}
              duration={trend.videoDuration}
              aspectClass="aspect-[9/16] max-h-[50vh] lg:max-h-none lg:min-h-full"
              priority
            />
          </div>

          <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6">
            <header>
              <h2
                id="trend-detail-title"
                className="text-lg font-semibold leading-snug tracking-tight text-white sm:text-xl"
              >
                {trend.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{trend.description}</p>
            </header>

            <div className="flex items-center gap-3">
              <img
                src={trend.creator.avatarUrl}
                alt=""
                className="size-10 rounded-full object-cover ring-2 ring-zinc-800"
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
              </div>
              <div className={cn('rounded-xl px-3 py-2 text-center', scoreTone.bgClass)}>
                <p className={cn('text-lg font-bold tabular-nums', scoreTone.textClass)}>
                  {trend.viralScore}
                </p>
                <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-500">
                  Viral Score
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MetricPill label="Views" value={trend.views} />
              <MetricPill label="Likes" value={trend.likes} />
              <MetricPill label="Engagement" value={trend.engagementRate} />
              <MetricPill label="Velocity" value={`${velocity.icon} ${velocity.label}`} />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {trend.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-300 ring-1 ring-violet-500/20"
                >
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>

            <section className="space-y-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
              <SectionTitle>Hook Analysis</SectionTitle>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-white">{trend.hookAnalysis.hookText}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-zinc-800/80 px-2 py-1 text-zinc-300">
                    {trend.hookAnalysis.hookType}
                  </span>
                  <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-emerald-400">
                    Hook Score: {trend.hookAnalysis.hookScore}/100
                  </span>
                </div>
                <p className="text-zinc-400">{trend.hookAnalysis.whyItWorks}</p>
                <p className="text-xs text-zinc-500">
                  <span className="font-medium text-zinc-400">Retention:</span>{' '}
                  {trend.hookAnalysis.retentionTrigger}
                </p>
              </div>
            </section>

            <section className="space-y-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
              <SectionTitle>AI Content Breakdown</SectionTitle>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <BreakdownItem label="Format" value={trend.contentBreakdown.format} />
                <BreakdownItem label="Pacing" value={trend.contentBreakdown.pacing} />
                <BreakdownItem label="Visual Style" value={trend.contentBreakdown.visualStyle} />
                <BreakdownItem label="CTA" value={trend.contentBreakdown.ctaStrategy} />
                {trend.contentBreakdown.audioTrend && (
                  <BreakdownItem label="Audio Trend" value={trend.contentBreakdown.audioTrend} />
                )}
                <BreakdownItem label="Best Post Time" value={trend.contentBreakdown.bestPostTime} />
              </dl>
            </section>

            <section className="space-y-2">
              <SectionTitle>Content Ideas</SectionTitle>
              <ul className="space-y-2">
                {trend.contentIdeas.map((idea) => (
                  <li
                    key={idea}
                    className="rounded-lg border border-zinc-800/50 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-300"
                  >
                    {idea}
                  </li>
                ))}
              </ul>
            </section>

            <p className="text-xs leading-relaxed text-zinc-600">{trend.engagementPrediction}</p>
          </div>
        </div>
      </article>
    </div>
  )
}
