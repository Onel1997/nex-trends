import { Badge } from '@/components/ui/Badge'
import { DashboardSectionHeading } from '@/components/dashboard/os/DashboardSectionHeading'
import { getDashboardCoreProducts } from '@/components/dashboard/os/dashboard-modules'
import { ClapperboardIcon, PlayIcon } from '@/components/ui/icons'
import { getRouteConfig } from '@/lib/routes'
import type { DashboardRouteId } from '@/lib/routes'
import { cn } from '@/lib'

type DashboardCoreProductsProps = {
  onNavigate: (tool: DashboardRouteId) => void
}

const PRODUCTS = getDashboardCoreProducts()
const FLAGSHIP = PRODUCTS.find((p) => p.featured)!
const SECONDARY = PRODUCTS.filter((p) => !p.featured)

const FLAGSHIP_FEATURES = ['Hooks', 'Captions', 'Voiceover', 'Templates'] as const

export function DashboardCoreProducts({ onNavigate }: DashboardCoreProductsProps) {
  const flagshipRoute = getRouteConfig(FLAGSHIP.id)

  return (
    <section className="dashboard-os-section animate-fade-in animation-delay-200">
      <DashboardSectionHeading
        title="Core Products"
        description="Modular AI engines powering your entire creator stack."
      />

      <div className="space-y-3 sm:space-y-4">
        {/* Flagship — AI Video Studio */}
        <article
          className={cn(
            'dashboard-os-flagship dashboard-os-card dashboard-os-product--flagship',
            'glass-premium group relative overflow-hidden rounded-2xl border border-fuchsia-500/30',
            'animate-fade-in',
          )}
        >
          <div
            className="dashboard-os-product__beam pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-fuchsia-400/70 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-8 top-0 size-40 rounded-full bg-fuchsia-500/20 blur-3xl sm:size-56"
            aria-hidden
          />

          <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5 lg:p-6">
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="pro" className="animate-pulse-soft text-[10px] uppercase tracking-wider">
                  Flagship
                </Badge>
              </div>

              <h3 className="mt-2.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
                {flagshipRoute.label}
              </h3>
              <p className="dashboard-os-muted mt-1.5 line-clamp-2 text-xs leading-relaxed sm:text-sm">
                {flagshipRoute.description}
              </p>

              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Features">
                {FLAGSHIP_FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-medium text-violet-200/90"
                  >
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => onNavigate(FLAGSHIP.id)}
                className="btn-glow-pro btn-press gradient-accent mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/45 transition-smooth sm:mt-5"
              >
                Open AI Video Studio
                <span className="text-white/80" aria-hidden>
                  →
                </span>
              </button>
            </div>

            <div
              className="dashboard-os-flagship-visual relative mx-auto flex w-full max-w-[11rem] shrink-0 items-center justify-center sm:mx-0 sm:w-[9.5rem] lg:w-[11rem]"
              aria-hidden
            >
              <div className="dashboard-os-flagship-cube relative size-28 sm:size-32">
                <div className="dashboard-os-flagship-cube__glow absolute inset-0 rounded-2xl" />
                <div className="dashboard-os-flagship-cube__body absolute inset-2 flex items-center justify-center rounded-xl border border-violet-400/30 bg-gradient-to-br from-violet-600/90 via-violet-700/80 to-fuchsia-700/90 shadow-[0_0_40px_-8px_rgba(139,92,246,0.75)]">
                  <PlayIcon className="ml-0.5 size-8 text-white drop-shadow-lg sm:size-9" />
                </div>
                <ClapperboardIcon className="absolute -right-1 -top-1 size-5 text-fuchsia-300/60" />
              </div>
            </div>
          </div>
        </article>

        {/* Secondary modules */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:grid-cols-3">
          {SECONDARY.map((product, i) => {
            const route = getRouteConfig(product.id)
            const Icon = product.icon
            const isLive = product.statusVariant === 'success'

            return (
              <article
                key={product.id}
                className={cn(
                  'dashboard-os-module-card dashboard-os-card glass-premium group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800/55 text-left',
                  'animate-fade-in transition-smooth',
                )}
                style={{ animationDelay: `${120 + i * 40}ms` }}
              >
                <div className="relative flex flex-1 flex-col p-3.5 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        'flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/90 to-violet-900/70 shadow-lg shadow-violet-900/30 ring-1 ring-white/10 transition-smooth group-hover:scale-105 sm:size-11',
                      )}
                    >
                      <Icon className="size-5 text-white" aria-hidden />
                    </span>
                    <Badge
                      variant={product.statusVariant}
                      className={cn(
                        'shrink-0 text-[9px] capitalize',
                        isLive && 'border-emerald-500/30',
                      )}
                    >
                      {isLive ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                          Live
                        </span>
                      ) : (
                        product.status
                      )}
                    </Badge>
                  </div>

                  <h3 className="mt-3 text-sm font-semibold leading-snug text-white sm:text-base">
                    {route.label}
                  </h3>
                  <p className="dashboard-os-muted mt-1 line-clamp-2 flex-1 text-[11px] leading-snug sm:text-xs">
                    {route.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => onNavigate(product.id)}
                    className="btn-press mt-3 w-full rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2.5 text-xs font-semibold text-violet-200 transition-smooth hover:border-violet-500/45 hover:bg-violet-500/16 sm:mt-4"
                  >
                    Launch Module
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
