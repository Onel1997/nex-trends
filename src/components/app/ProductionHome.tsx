import { NexTrendsHero } from '@/components/landing/NexTrendsHero'

/**
 * Production homepage — server-rendered premium hero (no providers required).
 */
export default function ProductionHome() {
  return (
    <div className="min-h-svh bg-[#030305] text-zinc-100">
      <NexTrendsHero demoHref="#demo" />
      <footer className="border-t border-white/[0.05] bg-[#030305] px-4 py-8 text-center">
        <p className="text-xs text-zinc-600">© 2026 NexTrends · nextrends-ai.de</p>
      </footer>
    </div>
  )
}
