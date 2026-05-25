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
    <section className="dashboard-os-section dashboard-os-section--embedded">
      <DashboardSectionHeading
        title="Core Products"
        description="Modular AI engines for your creator stack."
        compact
      />

      <div className="space-y-2.5">
        {/* Flagship — AI Video Studio */}
        <article
          className={cn(
            'dashboard-os-flagship dashboard-os-card dashboard-os-product--flagship',
            'group relative overflow-hidden rounded-2xl border border-violet-500/20',
          )}
        >
          <div
            className="dashboard-os-flagship__mesh pointer-events-none absolute inset-0 opacity-80"
            aria-hidden
          />
          <div
            className="dashboard-os-product__beam pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent"
            aria-hidden
          />

          <div className="relative grid grid-cols-[1fr_auto] items-center gap-3 p-3 sm:gap-4 sm:p-4">
            <div className="flex min-w-0 flex-col">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="pro" className="text-[9px] uppercase tracking-wider">
                  Flagship
                </Badge>
                <span className="text-[10px] font-medium text-zinc-500">Cinematic AI</span>
              </div>

              <h3 className="mt-1.5 text-base font-semibold tracking-tight text-white sm:text-lg">
                {flagshipRoute.label}
              </h3>
              <p className="dashboard-os-muted mt-1 line-clamp-2 text-[11px] leading-snug sm:text-xs">
                {flagshipRoute.description}
              </p>

              <ul className="mt-2.5 flex flex-wrap gap-1" aria-label="Features">
                {FLAGSHIP_FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="rounded-md border border-zinc-700/60 bg-zinc-900/50 px-2 py-0.5 text-[10px] font-medium text-zinc-400"
                  >
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => onNavigate(FLAGSHIP.id)}
                className="dashboard-os-flagship-cta btn-press mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-violet-400/25 bg-gradient-to-r from-violet-600 to-violet-500 px-4 text-xs font-semibold text-white shadow-sm transition-smooth hover:border-violet-300/35 hover:brightness-110 sm:w-auto sm:min-w-[11.5rem]"
              >
                Open Studio
                <span className="text-white/70" aria-hidden>
                  →
                </span>
              </button>
            </div>

            <div
              className="dashboard-os-flagship-visual flex size-[4.5rem] shrink-0 items-center justify-center sm:size-[5.25rem]"
              aria-hidden
            >
              <div className="dashboard-os-flagship-cube__body relative flex size-full items-center justify-center rounded-xl border border-violet-500/25 bg-gradient-to-br from-violet-600/80 to-violet-900/90 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)]">
                <PlayIcon className="ml-0.5 size-6 text-white/95 sm:size-7" />
                <ClapperboardIcon className="absolute -right-0.5 -top-0.5 size-3.5 text-violet-300/70" />
              </div>
            </div>
          </div>
        </article>

        {/* Secondary modules */}
        <div className="dashboard-os-module-grid grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
          {SECONDARY.map((product) => {
            const route = getRouteConfig(product.id)
            const Icon = product.icon
            const isLive = product.statusVariant === 'success'

            return (
              <article
                key={product.id}
                className="dashboard-os-module-card dashboard-os-card glass-premium group flex min-h-[8.75rem] flex-col rounded-2xl border border-zinc-800/55 sm:min-h-[9.25rem]"
              >
                <div className="flex flex-1 flex-col p-2.5 sm:p-3">
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="flex size-8 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-900/80 text-violet-300 ring-1 ring-white/[0.04]">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <Badge
                      variant={product.statusVariant}
                      className="shrink-0 text-[8px] capitalize"
                    >
                      {isLive ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="size-1 rounded-full bg-emerald-400" />
                          Live
                        </span>
                      ) : (
                        product.status
                      )}
                    </Badge>
                  </div>

                  <h3 className="mt-2 text-[13px] font-semibold leading-snug text-white">
                    {route.label}
                  </h3>
                  <p className="dashboard-os-muted mt-1 line-clamp-2 flex-1 text-[10px] leading-snug">
                    {route.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => onNavigate(product.id)}
                    className="btn-press dashboard-os-module-cta mt-2 h-8 w-full rounded-lg border border-zinc-700/60 bg-zinc-900/60 text-[11px] font-medium text-zinc-300 transition-smooth hover:border-violet-500/30 hover:bg-zinc-800/80 hover:text-white"
                  >
                    Open
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
