import { useCallback, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  SparklesIcon,
} from '@/components/ui/icons'
import { cn } from '@/lib'
import {
  blueprintToClipboardText,
  downloadBlueprint,
} from '@/lib/video-blueprint-export'
import {
  isBlueprintSaved,
  saveVideoBlueprint,
} from '@/lib/video-blueprint-storage'
import type { VideoBlueprint } from '@/types/video-blueprint'
import type { SVGProps } from 'react'

function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  )
}

type BlueprintSectionProps = {
  id: string
  title: string
  subtitle?: string
  accent?: 'violet' | 'fuchsia' | 'emerald' | 'cyan'
  defaultOpen?: boolean
  onCopy?: () => void
  children: ReactNode
}

function BlueprintSection({
  title,
  subtitle,
  accent = 'violet',
  defaultOpen = true,
  onCopy,
  children,
}: BlueprintSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  const accentBorder =
    accent === 'emerald'
      ? 'border-emerald-500/20 hover:border-emerald-500/35'
      : accent === 'fuchsia'
        ? 'border-fuchsia-500/20 hover:border-fuchsia-500/35'
        : accent === 'cyan'
          ? 'border-cyan-500/20 hover:border-cyan-500/35'
          : 'border-violet-500/20 hover:border-violet-500/35'

  return (
    <section
      className={cn(
        'blueprint-section glass-subtle overflow-hidden rounded-xl border transition-colors duration-300',
        accentBorder,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.02]"
        aria-expanded={open}
      >
        <SparklesIcon className="size-3.5 shrink-0 text-violet-400/80" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{title}</p>
          {subtitle ? (
            <p className="mt-0.5 truncate text-[11px] text-zinc-600">{subtitle}</p>
          ) : null}
        </div>
        {onCopy ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              onCopy()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation()
                onCopy()
              }
            }}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-800/60 hover:text-violet-300"
            aria-label={`${title} kopieren`}
          >
            <CopyIcon className="size-3.5" />
          </span>
        ) : null}
        <ChevronDownIcon
          className={cn('size-4 shrink-0 text-zinc-600 transition-transform duration-300', open && 'rotate-180')}
        />
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-zinc-800/50 px-4 pb-4 pt-3">{children}</div>
        </div>
      </div>
    </section>
  )
}

type VideoBlueprintPanelProps = {
  blueprint: VideoBlueprint
  className?: string
  onRegenerate?: () => void
  onCopyToast?: (title: string) => void
}

export function VideoBlueprintPanel({
  blueprint,
  className,
  onRegenerate,
  onCopyToast,
}: VideoBlueprintPanelProps) {
  const [saved, setSaved] = useState(() => isBlueprintSaved(blueprint.id))

  const copyText = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text)
        onCopyToast?.(`${label} kopiert`)
      } catch {
        onCopyToast?.('Kopieren fehlgeschlagen')
      }
    },
    [onCopyToast],
  )

  const handleSave = useCallback(() => {
    saveVideoBlueprint(blueprint)
    setSaved(true)
    onCopyToast?.('Blueprint gespeichert')
  }, [blueprint, onCopyToast])

  const handleExport = useCallback(
    (format: 'json' | 'markdown') => {
      downloadBlueprint(blueprint, format)
      onCopyToast?.(format === 'json' ? 'JSON exportiert' : 'Markdown exportiert')
    },
    [blueprint, onCopyToast],
  )

  return (
    <div
      className={cn(
        'creator-blueprint-panel animate-fade-in space-y-3 rounded-2xl border border-violet-500/20 p-4 sm:p-5',
        'bg-gradient-to-br from-zinc-950/95 via-violet-950/15 to-zinc-950/95',
        'shadow-[0_0_48px_-16px_rgba(139,92,246,0.45)]',
        className,
      )}
    >
      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="creator-badge-live">Blueprint Ready</span>
              {blueprint.pipeline.render.status === 'completed' ? (
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  Video gerendert
                </span>
              ) : null}
            </div>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-white sm:text-xl">
              Viral Video Blueprint
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              {blueprint.platform} · {blueprint.niche} · Creator OS
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void copyText(blueprintToClipboardText(blueprint), 'Blueprint')}
          >
            <CopyIcon className="size-3.5" aria-hidden />
            Alles kopieren
          </Button>
          <Button variant="secondary" size="sm" onClick={handleSave} disabled={saved}>
            {saved ? (
              <>
                <CheckIcon className="size-3.5" aria-hidden />
                Gespeichert
              </>
            ) : (
              'Blueprint speichern'
            )}
          </Button>
          {onRegenerate ? (
            <Button variant="ghost" size="sm" onClick={onRegenerate}>
              <SparklesIcon className="size-3.5" aria-hidden />
              Neu generieren
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={() => handleExport('markdown')}>
            <DownloadIcon className="size-3.5" aria-hidden />
            Export MD
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleExport('json')}>
            <DownloadIcon className="size-3.5" aria-hidden />
            Export JSON
          </Button>
        </div>
      </header>

      <BlueprintSection
        id="concept"
        title="Video Concept"
        subtitle="One-line viral idea"
        accent="violet"
        onCopy={() => void copyText(blueprint.concept, 'Concept')}
      >
        <p className="text-base font-medium leading-relaxed text-white">{blueprint.concept}</p>
      </BlueprintSection>

      <BlueprintSection
        id="hooks"
        title="Hook · 0–3s"
        subtitle={`${blueprint.hooks.length} retention-optimized variants`}
        accent="fuchsia"
        onCopy={() =>
          void copyText(blueprint.hooks.map((h) => h.text).join('\n'), 'Hooks')
        }
      >
        <ul className="space-y-2.5">
          {blueprint.hooks.map((hook, i) => (
            <li
              key={hook.text}
              className="rounded-xl border border-fuchsia-500/10 bg-fuchsia-500/5 px-3.5 py-3"
            >
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-fuchsia-500/15 px-1.5 py-0.5 text-[10px] font-bold text-fuchsia-300">
                  #{i + 1}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                  {hook.style}
                </span>
                <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-400">
                  {hook.retentionScore}% Retention
                </span>
              </div>
              <p className="text-sm font-medium leading-relaxed text-zinc-100">{hook.text}</p>
            </li>
          ))}
        </ul>
      </BlueprintSection>

      <BlueprintSection
        id="scenes"
        title="Scene Breakdown"
        subtitle={`${blueprint.scenes.length} cinematic beats`}
        accent="cyan"
        defaultOpen
        onCopy={() =>
          void copyText(
            blueprint.scenes
              .map(
                (s) =>
                  `Scene ${s.id} (${s.timeRange})\nCamera: ${s.cameraAngle}\nVisual: ${s.visualDirection}\nOverlay: ${s.overlayText}`,
              )
              .join('\n\n'),
            'Scenes',
          )
        }
      >
        <ol className="space-y-3">
          {blueprint.scenes.map((scene) => (
            <li
              key={scene.id}
              className="blueprint-scene-card rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-3.5"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-[11px] font-bold text-white">
                  {scene.id}
                </span>
                <span className="text-sm font-semibold text-white">{scene.label}</span>
                <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] tabular-nums text-zinc-400">
                  {scene.timeRange}
                </span>
              </div>
              <dl className="grid gap-2 text-xs sm:grid-cols-2">
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                    Camera
                  </dt>
                  <dd className="mt-0.5 text-zinc-300">{scene.cameraAngle}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                    Pacing
                  </dt>
                  <dd className="mt-0.5 text-zinc-300">{scene.pacing}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                    Visual Direction
                  </dt>
                  <dd className="mt-0.5 text-zinc-400">{scene.visualDirection}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-violet-500/80">
                    Overlay Text
                  </dt>
                  <dd className="mt-1 rounded-lg border border-violet-500/15 bg-violet-500/5 px-2.5 py-1.5 text-sm font-medium text-violet-100">
                    {scene.overlayText}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      </BlueprintSection>

      <BlueprintSection
        id="captions"
        title="Captions"
        subtitle="Short-form overlay lines"
        onCopy={() => void copyText(blueprint.captions.join('\n'), 'Captions')}
      >
        <ul className="space-y-1.5">
          {blueprint.captions.map((line) => (
            <li
              key={line}
              className="flex items-start gap-2 rounded-lg bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300"
            >
              <span className="mt-1 size-1 shrink-0 rounded-full bg-violet-400" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
      </BlueprintSection>

      <BlueprintSection
        id="cta"
        title="CTA Ending"
        subtitle="Engagement · Follow · Comment bait"
        accent="emerald"
        onCopy={() =>
          void copyText(
            `${blueprint.cta.engagement}\n${blueprint.cta.follow}\n${blueprint.cta.commentBait}`,
            'CTA',
          )
        }
      >
        <div className="space-y-2">
          {(
            [
              ['Engagement', blueprint.cta.engagement],
              ['Follow', blueprint.cta.follow],
              ['Comment Bait', blueprint.cta.commentBait],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-2.5"
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-600/80">
                {label}
              </p>
              <p className="mt-0.5 text-sm text-emerald-100/95">{value}</p>
            </div>
          ))}
        </div>
      </BlueprintSection>

      <BlueprintSection
        id="viral"
        title="Viral Elements"
        subtitle="Performance hypothesis & triggers"
        accent="fuchsia"
        defaultOpen={false}
      >
        <p className="text-sm leading-relaxed text-zinc-300">
          {blueprint.viralElements.performanceHypothesis}
        </p>
        <div className="mt-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Emotional Triggers
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {blueprint.viralElements.emotionalTriggers.map((t) => (
              <span
                key={t}
                className="rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-2.5 py-1 text-xs text-fuchsia-200/90"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Algorithm Fit
          </p>
          <ul className="mt-1.5 space-y-1">
            {blueprint.viralElements.algorithmFit.map((item) => (
              <li key={item} className="text-xs text-zinc-400 before:mr-1.5 before:text-violet-500 before:content-['▸']">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </BlueprintSection>

      <BlueprintSection
        id="platform"
        title="Platform Optimization"
        subtitle={`Primary: ${blueprint.platformOptimization.primary}`}
        defaultOpen={false}
      >
        <div className="space-y-2.5">
          {(
            [
              ['TikTok', blueprint.platformOptimization.tiktok],
              ['Instagram Reels', blueprint.platformOptimization.reels],
              ['YouTube Shorts', blueprint.platformOptimization.shorts],
            ] as const
          ).map(([platform, tip]) => (
            <div key={platform} className="rounded-lg border border-zinc-800/50 bg-zinc-950/40 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400/90">
                {platform}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">{tip}</p>
            </div>
          ))}
        </div>
      </BlueprintSection>

      <footer className="rounded-xl border border-dashed border-zinc-800/60 bg-zinc-950/30 px-3 py-2.5 text-center">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600">
          Pipeline-ready · Voiceover · Shots · Avatar · MP4
        </p>
      </footer>
    </div>
  )
}
