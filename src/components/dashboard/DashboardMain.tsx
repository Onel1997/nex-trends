import { isImmersiveTool, type DashboardToolId } from '@/lib'
import { ToolPageHeader } from '@/components/layout/ToolPageHeader'
import { DashboardPage } from '@/pages/DashboardPage'
import { TrendIntelligencePage } from '@/pages/trend-intelligence/TrendIntelligencePage'
import { SavedTrendsPage } from '@/pages/SavedTrendsPage'
import { MyAiVideosPage } from '@/pages/MyAiVideosPage'
import { AiStudioPage } from '@/pages/AiStudioPage'
import { HookGeneratorPage } from '@/pages/HookGeneratorPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { PricingPage } from '@/pages/PricingPage'
import { BillingPage } from '@/pages/BillingPage'
import { AdCopyGeneratorPage } from '@/pages/tools/AdCopyGeneratorPage'
import { SeoTitleGeneratorPage } from '@/pages/tools/SeoTitleGeneratorPage'
import { LandingPageAnalyzerPage } from '@/pages/tools/LandingPageAnalyzerPage'
import { cn } from '@/lib'

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

export function DashboardMain({ activeTool, onSelectTool }: DashboardMainProps) {
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
          'relative mx-auto w-full px-4 sm:px-6 lg:px-8',
          isDashboard
            ? 'min-w-0 pt-1 pb-4 sm:pt-3 sm:pb-6 lg:pt-4 lg:pb-8'
            : 'min-w-0 py-5 pb-6 sm:py-6 sm:pb-8 lg:py-8',
          immersive
            ? 'max-w-6xl xl:max-w-7xl 2xl:max-w-[1680px]'
            : 'max-w-7xl',
        )}
      >
        <ToolPageHeader activeTool={activeTool} onBack={() => onSelectTool('dashboard')} />
        <div key={activeTool} className="page-transition-enter nex-page-enter">
          {renderPage(activeTool, onSelectTool)}
        </div>
      </div>
    </div>
  )
}
