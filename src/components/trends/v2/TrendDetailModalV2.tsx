'use client'

import { useCallback, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { TrendStatusBadgeV2 } from '@/components/trends/v2/TrendStatusBadgeV2'
import { Button } from '@/components/ui/Button'
import {
  BoltIcon,
  BookmarkIcon,
  BookmarkFilledIcon,
  ClapperboardIcon,
  CloseIcon,
  FlameIcon,
  SparklesIcon,
} from '@/components/ui/icons'
import { useToast } from '@/context/ToastContext'
import {
  buildTrendPotentialReason,
  getExampleHook,
  getRecommendedContentIdea,
  OPPORTUNITY_TIER_META,
  type TrendWithV2,
} from '@/lib/trend-v2'
import { cn } from '@/lib'
import { TREND_CATEGORY_V2_LABELS } from '@/types/trend-v2'

type TrendDetailModalV2Props = {
  trend: TrendWithV2 | null
  onClose: () => void
  isSaved?: boolean
  onToggleSave?: (trend: TrendWithV2) => boolean
  onGenerateHook?: (trend: TrendWithV2) => void
}

function ScoreBlock({
  label,
  score,
  textClass,
  barClass,
}: {
  label: string
  score: number
  textClass: string
  barClass: string
}) {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-3.5 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          {label}
        </span>
        <span className={cn('text-xl font-bold tabular-nums sm:text-2xl', textClass)}>{score}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800/80">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barClass)}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string
  icon: typeof SparklesIcon
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'space-y-2.5 rounded-xl border border-zinc-800/50 bg-zinc-900/25 p-4 sm:p-5',
        className,
      )}
    >
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        <Icon className="size-3.5 text-violet-400/80" aria-hidden />
        {title}
      </h3>
      {children}
    </section>
  )
}

export function TrendDetailModalV2({
  trend,
  onClose,
  isSaved = false,
  onToggleSave,
  onGenerateHook,
}: TrendDetailModalV2Props) {
  const { showToast } = useToast()

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

  const handleSave = useCallback(() => {
    if (!trend || !onToggleSave) return
    const nowSaved = onToggleSave(trend)
    showToast({
      type: 'success',
      title: nowSaved ? 'Trend gespeichert' : 'Trend entfernt',
      message: nowSaved ? 'In deiner Bibliothek unter Gespeichert.' : undefined,
    })
  }, [onToggleSave, showToast, trend])

  const handleGenerateHook = useCallback(() => {
    if (!trend || !onGenerateHook) return
    onGenerateHook(trend)
    onClose()
  }, [onClose, onGenerateHook, trend])

  const handleVideoPlaceholder = useCallback(() => {
    showToast({
      type: 'info',
      title: 'AI Video Studio',
      message: 'Video-Erstellung aus Trends kommt bald — Hook zuerst generieren.',
    })
  }, [showToast])

  if (!trend) return null

  const { v2 } = trend
  const isTikTok = trend.platform.toLowerCase().includes('tiktok')
  const tierMeta = OPPORTUNITY_TIER_META[v2.opportunityTier]
  const categoryLabel = TREND_CATEGORY_V2_LABELS[v2.category]
  const potentialReason = buildTrendPotentialReason(trend)
  const contentIdea = getRecommendedContentIdea(trend)
  const exampleHook = getExampleHook(trend)

  return createPortal(
    <div
      className="trend-detail-modal-root ti-v2-detail-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ti-v2-detail-title"
    >
      <button
        type="button"
        aria-label="Detailansicht schließen"
        className="trend-detail-modal-overlay animate-fade-in"
        onClick={onClose}
      />

      <div className="trend-detail-modal-stage">
        <article className="trend-detail-modal-sheet animate-sheet-up sm:animate-fade-in-scale flex max-h-[92vh] flex-col overflow-hidden sm:max-w-2xl lg:max-w-3xl">
          <div
            className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-zinc-700 sm:hidden"
            aria-hidden
          />

          <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/50 px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <TrendStatusBadgeV2 status={v2.status} size="md" />
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset',
                  isTikTok
                    ? 'bg-black/50 text-white ring-white/10'
                    : 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white ring-white/10',
                )}
              >
                {isTikTok ? 'TikTok' : 'Instagram Reels'}
              </span>
              <span className="rounded-full bg-zinc-800/70 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-400 ring-1 ring-zinc-700/50">
                {categoryLabel}
              </span>
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

          <div className="flex flex-1 flex-col gap-5 overflow-y-auto overscroll-contain p-4 sm:gap-6 sm:p-6">
            <header className="space-y-3">
              <h2
                id="ti-v2-detail-title"
                className="text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl"
              >
                {trend.title}
              </h2>
              <p className="text-sm leading-relaxed text-zinc-400">{trend.description}</p>
              <p className={cn('text-xs font-semibold', tierMeta.className)}>
                {tierMeta.label} · Opportunity {v2.opportunityScore}
              </p>
            </header>

            <div className="grid gap-3 sm:grid-cols-2">
              <ScoreBlock
                label="Trend Score"
                score={v2.trendScore}
                textClass="text-violet-300"
                barClass="bg-violet-500"
              />
              <ScoreBlock
                label="Opportunity Score"
                score={v2.opportunityScore}
                textClass={
                  v2.opportunityScore >= 80
                    ? 'text-fuchsia-300'
                    : v2.opportunityScore >= 60
                      ? 'text-emerald-300'
                      : 'text-zinc-300'
                }
                barClass={
                  v2.opportunityScore >= 80
                    ? 'bg-fuchsia-500'
                    : v2.opportunityScore >= 60
                      ? 'bg-emerald-500'
                      : 'bg-zinc-500'
                }
              />
            </div>

            <Section title="Warum Potenzial?" icon={SparklesIcon} className="border-violet-500/15 bg-violet-500/[0.06]">
              <p className="text-sm leading-relaxed text-violet-100/90">{potentialReason}</p>
            </Section>

            <Section title="Empfohlene Content-Idee" icon={FlameIcon}>
              <p className="text-sm leading-relaxed text-zinc-300">{contentIdea}</p>
            </Section>

            <Section title="Beispiel Hook" icon={BoltIcon} className="border-zinc-800/60 bg-zinc-950/40">
              <blockquote className="border-l-2 border-violet-500/50 pl-4 text-sm font-medium leading-relaxed text-white">
                {exampleHook}
              </blockquote>
              {trend.hookAnalysis?.hookType && (
                <p className="text-xs text-zinc-500">
                  Typ: <span className="text-zinc-400">{trend.hookAnalysis.hookType}</span>
                </p>
              )}
            </Section>
          </div>

          <div className="trend-detail-modal-footer shrink-0 border-t border-zinc-800/60 bg-[#09090F]/95 p-4 backdrop-blur-md sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {onGenerateHook && (
                <Button
                  variant="pro"
                  size="md"
                  fullWidth
                  className="min-h-11 sm:min-h-10 sm:flex-1"
                  onClick={handleGenerateHook}
                >
                  <BoltIcon className="size-4" aria-hidden />
                  Hook generieren
                </Button>
              )}
              {onToggleSave && (
                <Button
                  variant={isSaved ? 'primary' : 'secondary'}
                  size="md"
                  fullWidth
                  className="min-h-11 sm:min-h-10 sm:flex-1"
                  onClick={handleSave}
                >
                  {isSaved ? (
                    <BookmarkFilledIcon className="size-4" aria-hidden />
                  ) : (
                    <BookmarkIcon className="size-4" aria-hidden />
                  )}
                  {isSaved ? 'Gespeichert' : 'Trend speichern'}
                </Button>
              )}
              <Button
                variant="secondary"
                size="md"
                fullWidth
                className="min-h-11 sm:min-h-10 sm:flex-1"
                onClick={handleVideoPlaceholder}
              >
                <ClapperboardIcon className="size-4" aria-hidden />
                Video erstellen
                <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                  Bald
                </span>
              </Button>
            </div>
          </div>
        </article>
      </div>
    </div>,
    document.body,
  )
}
