import { isImmersiveTool, type DashboardToolId } from '@/lib'
import { ToolPageHeader } from '@/components/layout/ToolPageHeader'
import { DashboardPage } from '@/pages/DashboardPage'
import { TrendIntelligencePage } from '@/pages/trend-intelligence/TrendIntelligencePage'
import { SavedTrendsPage } from '@/pages/SavedTrendsPage'
import { MyAiVideosPage } from '@/pages/MyAiVideosPage'
import { AiStudioPage } from '@/pages/AiStudioPage'
import { HookGeneratorPage } from '@/pages/HookGeneratorPage'
import { SettingsPage } from '@/pages/SettingsPage'
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
      return <SavedTrendsPage />
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
    case 'settings':
      return <SettingsPage />
    case 'dashboard':
    default:
      return <DashboardPage onNavigate={onSelectTool} />
  }
}

export function DashboardMain({ activeTool, onSelectTool }: DashboardMainProps) {
  const immersive = isImmersiveTool(activeTool)

  return (
    <div
      className={cn(
        'relative min-h-full',
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
          'relative mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10',
          immersive
            ? 'max-w-6xl xl:max-w-7xl 2xl:max-w-[1680px]'
            : 'max-w-7xl',
        )}
      >
        <ToolPageHeader activeTool={activeTool} onBack={() => onSelectTool('dashboard')} />
        {renderPage(activeTool, onSelectTool)}
      </div>
    </div>
  )
}
