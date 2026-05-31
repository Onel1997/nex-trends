import { lazy, memo, Suspense } from 'react'
import { isImmersiveTool, type DashboardToolId } from '@/lib'
import { ToolPageHeader } from '@/components/layout/ToolPageHeader'
import { PageLoadingFallback } from '@/components/ui/PageLoadingFallback'
import { DashboardPage } from '@/pages/DashboardPage'
import { cn } from '@/lib'

const TrendIntelligencePage = lazy(() =>
  import('@/pages/trend-intelligence/TrendIntelligencePage').then((m) => ({
    default: m.TrendIntelligencePage,
  })),
)
const SavedTrendsPage = lazy(() =>
  import('@/pages/SavedTrendsPage').then((m) => ({ default: m.SavedTrendsPage })),
)
const MyAiVideosPage = lazy(() =>
  import('@/pages/MyAiVideosPage').then((m) => ({ default: m.MyAiVideosPage })),
)
const AiStudioPage = lazy(() =>
  import('@/pages/AiStudioPage').then((m) => ({ default: m.AiStudioPage })),
)
const HookGeneratorPage = lazy(() =>
  import('@/pages/HookGeneratorPage').then((m) => ({ default: m.HookGeneratorPage })),
)
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const PricingPage = lazy(() =>
  import('@/pages/PricingPage').then((m) => ({ default: m.PricingPage })),
)
const BillingPage = lazy(() =>
  import('@/pages/BillingPage').then((m) => ({ default: m.BillingPage })),
)
const AdCopyGeneratorPage = lazy(() =>
  import('@/pages/tools/AdCopyGeneratorPage').then((m) => ({
    default: m.AdCopyGeneratorPage,
  })),
)
const SeoTitleGeneratorPage = lazy(() =>
  import('@/pages/tools/SeoTitleGeneratorPage').then((m) => ({
    default: m.SeoTitleGeneratorPage,
  })),
)
const LandingPageAnalyzerPage = lazy(() =>
  import('@/pages/tools/LandingPageAnalyzerPage').then((m) => ({
    default: m.LandingPageAnalyzerPage,
  })),
)

type DashboardMainProps = {
  activeTool: DashboardToolId
  onSelectTool: (tool: DashboardToolId) => void
}

function renderPage(activeTool: DashboardToolId, onSelectTool: (tool: DashboardToolId) => void) {
  switch (activeTool) {
    case 'trend-intelligence':
      return <TrendIntelligencePage />
    case 'saved-trends':
      return <SavedTrendsPage onNavigate={onSelectTool} />
    case 'ai-studio':
      return <AiStudioPage />
    case 'my-videos':
      return <MyAiVideosPage />
    case 'hook':
      return <HookGeneratorPage />
    case 'ad-copy':
      return <AdCopyGeneratorPage />
    case 'seo':
      return <SeoTitleGeneratorPage />
    case 'analyzer':
      return <LandingPageAnalyzerPage />
    case 'pricing':
      return <PricingPage />
    case 'billing':
      return <BillingPage />
    case 'settings':
      return <SettingsPage />
    case 'dashboard':
    default:
      return <DashboardPage onNavigate={onSelectTool} />
  }
}

function DashboardMainInner({ activeTool, onSelectTool }: DashboardMainProps) {
  const immersive = isImmersiveTool(activeTool)
  const isDashboard = activeTool === 'dashboard'

  return (
    <div
      className={cn(
        'relative min-h-0',
        immersive ? 'ti-ambient' : 'ambient-glow',
      )}
    >
      {!immersive && (
        <>
          <div
            className="pointer-events-none absolute -right-40 top-0 size-96 rounded-full bg-violet-600/6 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 size-80 rounded-full bg-fuchsia-600/4 blur-3xl"
            aria-hidden
          />
        </>
      )}

      {immersive && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-violet-950/30 to-transparent"
          aria-hidden
        />
      )}

      <div
        className={cn(
          'relative mx-auto w-full',
          isDashboard
            ? 'nex-page-pad min-w-0 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] sm:pt-3 sm:pb-8 lg:pt-4 lg:pb-10'
            : 'nex-page-pad min-w-0 py-5 pb-6 sm:py-6 sm:pb-8 lg:py-8',
          immersive
            ? 'max-w-6xl xl:max-w-7xl 2xl:max-w-[1680px]'
            : 'max-w-7xl',
        )}
      >
        <ToolPageHeader activeTool={activeTool} onBack={() => onSelectTool('dashboard')} />
        <div key={activeTool} className="page-transition-enter nex-page-enter">
          <Suspense fallback={<PageLoadingFallback tool={activeTool} />}>
            {renderPage(activeTool, onSelectTool)}
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export const DashboardMain = memo(DashboardMainInner)
