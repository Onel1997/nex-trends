import type { DashboardToolId } from '@/lib'
import { ToolPageHeader } from '@/components/layout/ToolPageHeader'
import { DashboardHome } from '@/components/dashboard/home/DashboardHome'
import { AdCopyTool, HookTool, LandingAnalyzerTool, SeoTitleTool } from './tools'

type DashboardMainProps = {
  activeTool: DashboardToolId
  onNavigateHome: () => void
}

function renderToolContent(activeTool: DashboardToolId) {
  switch (activeTool) {
    case 'ad-copy':
      return <AdCopyTool />
    case 'hook':
      return <HookTool />
    case 'seo':
      return <SeoTitleTool />
    case 'analyzer':
      return <LandingAnalyzerTool />
    case 'trends':
    default:
      return <DashboardHome />
  }
}

export function DashboardMain({ activeTool, onNavigateHome }: DashboardMainProps) {
  return (
    <div className="relative min-h-full overflow-hidden ambient-glow">
      <div
        className="pointer-events-none absolute -right-40 top-0 size-96 rounded-full bg-violet-600/8 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 size-80 rounded-full bg-fuchsia-600/5 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <ToolPageHeader activeTool={activeTool} onBack={onNavigateHome} />
        {renderToolContent(activeTool)}
      </div>
    </div>
  )
}
