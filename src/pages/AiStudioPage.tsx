import { useCallback } from 'react'
import {
  AiStudioForm,
  AiStudioPipeline,
  VideoLibraryGrid,
} from '@/components/ai-studio'
import { ClapperboardIcon } from '@/components/ui/icons'
import { useAiStudio } from '@/hooks/useAiStudio'
import { navigateToTool } from '@/lib/navigation'
import { cn } from '@/lib'

export function AiStudioPage() {
  const { form, setForm, generate, videoGen, library } = useAiStudio()

  const handleGenerate = useCallback(() => {
    void generate()
  }, [generate])

  const showPipeline = videoGen.status !== 'idle'

  return (
    <div className="studio-page mx-auto max-w-6xl space-y-8 px-1 pb-8 animate-fade-in sm:space-y-10 sm:px-0 sm:pb-10">
      <header className="relative space-y-3">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
          <ClapperboardIcon className="size-3.5 text-violet-400" aria-hidden />
          Creator SaaS
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
          <span className="gradient-accent-text">AI Video Studio</span>
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
          Generate viral AI shorts with hooks, captions and voiceovers — cinematic quality,
          creator-grade polish.
        </p>
      </header>

      <div
        className={cn(
          'grid gap-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-6 lg:gap-8',
          showPipeline
            ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'
            : 'lg:grid-cols-1',
        )}
      >
        <AiStudioForm
          id="ai-studio-form"
          values={form}
          onChange={setForm}
          onSubmit={handleGenerate}
          loading={videoGen.isLoading}
          disabled={videoGen.isLoading}
        />

        {showPipeline ? (
          <AiStudioPipeline
            status={videoGen.status}
            detail={videoGen.detail}
            error={videoGen.error}
            provider={videoGen.provider}
            onCancel={videoGen.cancel}
            className="lg:sticky lg:top-4 lg:self-start"
          />
        ) : (
          <div className="hidden lg:flex lg:flex-col lg:justify-center">
            <div className="glass-subtle rounded-2xl border border-dashed border-violet-500/25 p-8 text-center shadow-[0_0_40px_-20px_rgba(139,92,246,0.25)]">
              <ClapperboardIcon className="mx-auto size-10 text-violet-500/50" />
              <p className="mt-4 text-sm font-medium text-zinc-400">
                Your pipeline appears here
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                Queue → Script → AI Video → Audio → Rendering → Finished
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
  )
}
