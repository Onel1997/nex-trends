import type { ReactNode } from 'react'
import { SparklesIcon } from '@/components/ui/icons'
import { buildAnalysisSummary } from '@/lib/trend-analysis-copy'
import type { TrendIntelligence } from '@/types/trend-intelligence'

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2 rounded-xl border border-zinc-800/50 bg-zinc-900/25 p-4">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
        <SparklesIcon className="size-3.5 text-violet-400/80" aria-hidden />
        {title}
      </h3>
      <div className="text-sm leading-relaxed text-zinc-300">{children}</div>
    </section>
  )
}

export function TrendAnalysisSummary({ trend }: { trend: TrendIntelligence }) {
  const analysis = buildAnalysisSummary(trend)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ScoreChip label="Viral Score" value={`${analysis.viralScore}`} accent />
        <ScoreChip label="Opportunity" value={`${trend.opportunityScore ?? '—'}`} />
        <ScoreChip label="Competition" value={`${analysis.competitionScore ?? '—'}`} />
        <ScoreChip label="Engagement" value={analysis.engagementRate} />
      </div>

      <Block title="Trend Summary">{analysis.summary}</Block>

      {analysis.whyTrending && (
        <Block title="Warum trendet das?">{analysis.whyTrending}</Block>
      )}

      <Block title="Opportunity Score">{analysis.opportunity}</Block>

      <Block title="Beste Hook-Strategien">
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
      </Block>

      <Block title="Beste Posting-Zeiten">{analysis.bestPostTimes}</Block>

      <Block title="CTA Empfehlungen">
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
      </Block>

      <Block title="Content Strategy">{analysis.contentStrategy}</Block>

      <Block title="Platform Fit">{analysis.platformFit}</Block>

      <Block title="Audience Psychology">{analysis.audiencePsychology}</Block>

      <Block title="Recommended Hashtags">
        <div className="flex flex-wrap gap-1.5">
          {analysis.hashtags.slice(0, 8).map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-violet-500/8 px-2.5 py-1 text-xs font-medium text-violet-300/90 ring-1 ring-violet-500/15"
            >
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      </Block>

      <Block title="Risiko-Level">{analysis.riskLevel}</Block>

      <Block title="Saturation">{analysis.saturation}</Block>

      <Block title="Content-Ideen">
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
      </Block>
    </div>
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
