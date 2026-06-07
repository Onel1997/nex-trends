import { useState, type ReactNode, type SVGProps } from 'react'
import { CopyIcon } from '@/components/ui/icons'
import { useToast } from '@/context/ToastContext'
import { buildCreatorActionPlan } from '@/lib/creator-action-plan'
import { buildAnalysisSummary } from '@/lib/trend-analysis-copy'
import { cn } from '@/lib'
import type { CreatorVideoIdea } from '@/lib/creator-action-plan'
import type { TrendIntelligence } from '@/types/trend-intelligence'

function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

type CollapsibleSectionProps = {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  accent?: boolean
  children: ReactNode
}

function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  accent,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className={cn('ti-dash-section', open && 'ti-dash-section--open', accent && 'border-violet-500/25 bg-violet-500/[0.04]')}>
      <button
        type="button"
        className="ti-dash-section__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="min-w-0 text-left">
          <span className="ti-dash-section__title">{title}</span>
          {subtitle ? <span className="ti-dash-section__subtitle">{subtitle}</span> : null}
        </span>
        <ChevronDownIcon
          className={cn('ti-dash-section__chevron size-4 shrink-0 text-zinc-500', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      <div
        className={cn('ti-dash-section__collapse', open && 'ti-dash-section__collapse--open')}
        aria-hidden={!open}
      >
        <div className="ti-dash-section__body ti-dash-section__body--animate px-3 pb-3 pt-2 sm:px-4">
          {children}
        </div>
      </div>
    </section>
  )
}

function ScoreChip({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div
      className={
        accent
          ? 'rounded-xl border border-violet-500/25 bg-violet-500/10 px-3 py-2.5'
          : 'rounded-xl border border-zinc-800/50 bg-zinc-950/50 px-3 py-2.5'
      }
    >
      <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p
        className={
          accent
            ? 'mt-0.5 text-lg font-semibold tabular-nums text-violet-200'
            : 'mt-0.5 text-lg font-semibold tabular-nums text-zinc-100'
        }
      >
        {value}
      </p>
    </div>
  )
}

function VideoIdeaCard({ idea, index }: { idea: CreatorVideoIdea; index: number }) {
  return (
    <article className="rounded-xl border border-violet-500/15 bg-gradient-to-br from-violet-950/40 via-zinc-950/60 to-zinc-950/40 p-3.5 sm:p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-lg bg-violet-500/20 text-[11px] font-bold text-violet-200 ring-1 ring-violet-500/25">
          {index + 1}
        </span>
        <h4 className="text-sm font-semibold leading-snug text-white">{idea.title}</h4>
      </div>
      <p className="rounded-lg border border-violet-500/10 bg-violet-500/5 px-3 py-2 text-sm leading-relaxed text-violet-100/95">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400/80">Hook</span>
        <span className="mt-1 block">{idea.hook}</span>
      </p>
      <ol className="mt-3 space-y-2">
        {idea.steps.map((step, stepIndex) => (
          <li
            key={step}
            className="flex gap-2.5 text-sm leading-relaxed text-zinc-300"
          >
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-zinc-800/80 text-[10px] font-bold text-zinc-400">
              {stepIndex + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 rounded-lg border border-zinc-800/50 bg-zinc-950/50 px-3 py-2 text-xs leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">CTA: </span>
        {idea.cta}
      </p>
    </article>
  )
}

function HashtagChips({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-200/95 ring-1 ring-violet-500/20 transition-smooth hover:bg-violet-500/15"
        >
          {tag.startsWith('#') ? tag : `#${tag}`}
        </span>
      ))}
    </div>
  )
}

export function TrendAnalysisSummary({ trend }: { trend: TrendIntelligence }) {
  const { showToast } = useToast()
  const analysis = buildAnalysisSummary(trend)
  const actionPlan = buildCreatorActionPlan(trend)
  const opportunity = trend.opportunityScore ?? '—'

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(actionPlan.caption)
      showToast({ type: 'success', title: 'Caption kopiert', message: 'Bereit zum Einfügen.' })
    } catch {
      showToast({ type: 'error', title: 'Kopieren fehlgeschlagen' })
    }
  }

  return (
    <div className="ti-analysis-plan space-y-3 animate-fade-in">
      <div className="ti-analysis-plan__hero relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/70 via-[#0c0a14] to-fuchsia-950/30 p-4 sm:p-5">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.18),transparent_55%)]"
          aria-hidden
        />
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300/80">
              Trend Found
            </p>
            <p className="mt-0.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
              Action Plan Ready
            </p>
            <p className="mt-1.5 max-w-md text-xs leading-relaxed text-zinc-400">
              {trend.platform}
              {trend.niche ? ` · ${trend.niche}` : ''} · Opportunity {opportunity}/100 ·{' '}
              {trend.engagementRate} Engagement
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 sm:self-center">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/60 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs font-semibold text-emerald-200/95">3 Videos · 1 Caption</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ScoreChip label="Viral Score" value={`${analysis.viralScore}`} accent />
        <ScoreChip label="Opportunity" value={`${opportunity}`} />
        <ScoreChip label="Competition" value={`${analysis.competitionScore ?? '—'}`} />
        <ScoreChip label="Engagement" value={analysis.engagementRate} />
      </div>

      <CollapsibleSection
        title="Opportunity Score"
        subtitle={`${opportunity}/100 — Fenster für Creator-Positionierung`}
        defaultOpen
        accent
      >
        <p className="text-sm leading-relaxed text-zinc-300">{analysis.opportunity}</p>
      </CollapsibleSection>

      <CollapsibleSection
        title="🚀 Creator Action Plan"
        subtitle="3 shoot-ready Video-Ideen mit Hook, Struktur & CTA"
        defaultOpen
        accent
      >
        <div className="space-y-3">
          {actionPlan.videoIdeas.map((idea, index) => (
            <VideoIdeaCard key={`idea-${index}`} idea={idea} index={index} />
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="✍️ Ready-to-Post Caption"
        subtitle={`Optimiert für ${trend.platform.includes('Instagram') ? 'Instagram Reels' : 'TikTok / Reels'}`}
        defaultOpen
      >
        <div className="relative">
          <pre className="whitespace-pre-wrap rounded-xl border border-zinc-800/50 bg-zinc-950/60 p-3.5 font-sans text-sm leading-relaxed text-zinc-200">
            {actionPlan.caption}
          </pre>
          <button
            type="button"
            onClick={() => void copyCaption()}
            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg border border-zinc-700/60 bg-zinc-900/90 px-2 py-1 text-[10px] font-semibold text-zinc-300 transition-smooth hover:border-violet-500/30 hover:text-violet-200"
          >
            <CopyIcon className="size-3" aria-hidden />
            Copy
          </button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="🏷 Recommended Hashtags"
        subtitle={`${actionPlan.hashtags.length} Tags — chip-ready für ${trend.platform}`}
        defaultOpen
      >
        <HashtagChips tags={actionPlan.hashtags} />
      </CollapsibleSection>

      <CollapsibleSection title="Warum trendet das?" subtitle="Trend-Dynamik & Algorithmus-Signale">
        <p className="text-sm leading-relaxed text-zinc-300">
          {analysis.whyTrending || 'Keine Trend-Begründung verfügbar.'}
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Beste Posting-Zeiten" subtitle={analysis.bestPostTimes}>
        <p className="text-sm leading-relaxed text-zinc-300">{analysis.bestPostTimes}</p>
      </CollapsibleSection>

      <CollapsibleSection title="CTA Empfehlungen" subtitle={`${analysis.ctaRecommendations.length} Conversion-Angles`}>
        <ul className="space-y-2">
          {analysis.ctaRecommendations.map((cta) => (
            <li
              key={cta}
              className="rounded-lg border border-zinc-800/40 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-300"
            >
              {cta}
            </li>
          ))}
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="Content Strategy" subtitle={analysis.contentStrategy}>
        <p className="text-sm leading-relaxed text-zinc-300">{analysis.contentStrategy}</p>
      </CollapsibleSection>

      <CollapsibleSection title="Beste Hook-Strategien" subtitle="Scroll-Stopper für diese Nische">
        <ul className="space-y-2">
          {analysis.hookStrategies.slice(0, 4).map((hook) => (
            <li
              key={hook}
              className="rounded-lg border border-violet-500/10 bg-violet-500/5 px-3 py-2 text-sm text-zinc-300"
            >
              {hook}
            </li>
          ))}
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="Trend Summary" subtitle="Kontext auf einen Blick">
        <p className="text-sm leading-relaxed text-zinc-300">{analysis.summary}</p>
      </CollapsibleSection>

      <CollapsibleSection title="Platform Fit" subtitle={trend.platform}>
        <p className="text-sm leading-relaxed text-zinc-300">{analysis.platformFit}</p>
      </CollapsibleSection>

      <CollapsibleSection title="Audience Psychology" subtitle="Retention & Engagement">
        <p className="text-sm leading-relaxed text-zinc-300">{analysis.audiencePsychology}</p>
      </CollapsibleSection>

      <CollapsibleSection title="Risiko & Saturation" subtitle="Markt-Fenster einschätzen">
        <div className="space-y-2 text-sm leading-relaxed text-zinc-300">
          <p>{analysis.riskLevel}</p>
          <p className="text-zinc-400">{analysis.saturation}</p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Weitere Content-Ideen" subtitle={`${analysis.contentIdeas.length} Bonus-Ideen`}>
        <ul className="space-y-2">
          {analysis.contentIdeas.map((idea) => (
            <li
              key={idea}
              className="rounded-lg border border-zinc-800/40 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-300"
            >
              {idea}
            </li>
          ))}
        </ul>
      </CollapsibleSection>
    </div>
  )
}
