import { useCallback } from 'react'
import {
  AiStudioForm,
  VideoLibraryGrid,
} from '@/components/ai-studio'
import { VideoBlueprintLoading } from '@/components/trends/VideoBlueprintLoading'
import { VideoBlueprintPanel } from '@/components/trends/VideoBlueprintPanel'
import { VideoGenerationFallback } from '@/components/trends/VideoGenerationFallback'
import { ToolCreditsBadge } from '@/components/tools/ToolCreditsBadge'
import { ProtectedTool } from '@/components/subscription/ProtectedTool'
import { ClapperboardIcon } from '@/components/ui/icons'
import { useAiStudio } from '@/hooks/useAiStudio'
import { VIDEO_LOADING_MESSAGE } from '@/hooks/useVideoGeneration'
import { CREDIT_COSTS } from '@/lib/plans'
import { navigateToTool } from '@/lib/navigation'
import { cn } from '@/lib'

export function AiStudioPage() {
  const { form, setForm, generate, videoGen, library, blueprint, copyToast } = useAiStudio()

  const handleGenerate = useCallback(() => {
    void generate()
  }, [generate])

  const showStudio = videoGen.studioPhase !== 'idle'

  return (
    <ProtectedTool
      toolId="ai-studio"
      title="AI Video Studio"
      description="Generate viral AI shorts with voiceovers, captions, and premium templates — available on Studio and above."
    >
    <div className="studio-page mx-auto max-w-6xl space-y-8 px-1 pb-8 animate-fade-in sm:space-y-10 sm:px-0 sm:pb-10">
      <header className="relative space-y-3">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
          <ClapperboardIcon className="size-3.5 text-violet-400" aria-hidden />
          Creator OS
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
          <span className="gradient-accent-text">AI Video Studio</span>
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
          AI Strategist + Creative Director + Viral Editor — complete creator-ready blueprints
          with hooks, scenes, captions & platform optimization.
        </p>
        <ToolCreditsBadge
          className="mt-1"
          creditCost={CREDIT_COSTS.ai_video}
          costLabel="pro Video"
        />
      </header>

      <div
        className={cn(
          'grid gap-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-6 lg:gap-8',
          showStudio
            ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'
            : 'lg:grid-cols-1',
        )}
      >
        <AiStudioForm
          id="ai-studio-form"
          values={form}
          onChange={setForm}
          onSubmit={handleGenerate}
          loading={videoGen.showStudioLoading}
          disabled={videoGen.showStudioLoading || form.topic.trim().length < 3}
        />

        {showStudio ? (
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            {videoGen.showStudioLoading ? (
              <VideoBlueprintLoading
                message={videoGen.detail ?? VIDEO_LOADING_MESSAGE}
                phase={
                  videoGen.isRetrying
                    ? 'retrying'
                    : videoGen.isCrafting
                      ? 'crafting'
                      : 'rendering'
                }
                status={videoGen.status}
                retryAttempt={videoGen.retryAttempt}
              />
            ) : null}

            {videoGen.showFailure ? (
              <VideoGenerationFallback
                kind={videoGen.failureKind ?? 'exhausted'}
                onRetry={
                  videoGen.retryable
                    ? () => void generate()
                    : undefined
                }
                onClose={videoGen.dismissFailure}
              />
            ) : null}

            {blueprint ? (
              <VideoBlueprintPanel
                blueprint={blueprint}
                onRegenerate={() => void generate()}
                onCopyToast={copyToast}
              />
            ) : null}
          </div>
        ) : (
          <div className="hidden lg:flex lg:flex-col lg:justify-center">
            <div className="glass-subtle rounded-2xl border border-dashed border-violet-500/25 p-8 text-center shadow-[0_0_40px_-20px_rgba(139,92,246,0.25)]">
              <ClapperboardIcon className="mx-auto size-10 text-violet-500/50" />
              <p className="mt-4 text-sm font-medium text-zinc-400">
                Your Creator Blueprint appears here
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                Strategist → Storyboard → Scenes → Captions → CTA → Platform Fit
              </p>
            </div>
          </div>
        )}
      </div>

      <VideoLibraryGrid
        videos={library.videos}
        loading={library.loading}
        error={library.error}
        onRefresh={() => void library.refresh()}
        onViewAll={() => navigateToTool('my-videos')}
        onDelete={(v) => void library.remove(v)}
        onRegenerate={(v) => void library.regenerate(v)}
        deletingId={library.deletingId}
        regeneratingId={library.regeneratingId}
        limit={8}
        title="Your generated videos"
        className="border-t border-zinc-800/60 pt-8 sm:pt-10"
      />
    </div>
    </ProtectedTool>
  )
}
