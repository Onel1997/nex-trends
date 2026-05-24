import type { DashboardToolId } from '@/lib'
import { SIDEBAR_ITEMS } from '@/lib'
import { ProtectedTool } from '@/components/subscription'
import { ToolPageHeader } from '@/components/layout/ToolPageHeader'
import { DashboardHome } from '@/components/dashboard/home/DashboardHome'
import { AdCopyTool, HookTool, LandingAnalyzerTool, SeoTitleTool } from './tools'

type DashboardMainProps = {
  activeTool: DashboardToolId
  onNavigateHome: () => void
}

function getToolLabel(toolId: DashboardToolId): string {
  return SIDEBAR_ITEMS.find((item) => item.id === toolId)?.label ?? 'Premium-Tool'
}

function renderToolContent(activeTool: DashboardToolId) {
  switch (activeTool) {
    case 'ad-copy':
      return (
        <ProtectedTool title={getToolLabel('ad-copy')}>
          <AdCopyTool />
        </ProtectedTool>
      )
    case 'hook':
      return (
        <ProtectedTool title={getToolLabel('hook')}>
          <HookTool />
        </ProtectedTool>
      )
    case 'seo':
      return (
        <ProtectedTool title={getToolLabel('seo')}>
          <SeoTitleTool />
        </ProtectedTool>
      )
    case 'analyzer':
      return (
        <ProtectedTool title={getToolLabel('analyzer')}>
          <LandingAnalyzerTool />
        </ProtectedTool>
      )
    case 'trends':
    default:
      return <DashboardHome />
  }
}

export function DashboardMain({ activeTool, onNavigateHome }: DashboardMainProps) {
  return (
    <div className="relative min-h-full overflow-hidden">
      <div
        className="pointer-events-none absolute -right-32 top-0 size-80 rounded-full bg-violet-600/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 size-64 rounded-full bg-fuchsia-600/5 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <ToolPageHeader activeTool={activeTool} onBack={onNavigateHome} />
        {renderToolContent(activeTool)}
      </div>
    </div>
  )
}
