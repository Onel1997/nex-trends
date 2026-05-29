import { memo } from 'react'
import { Badge } from '@/components/ui/Badge'
import { DashboardAiEngineVisual } from '@/components/dashboard/os/DashboardAiEngineVisual'
import { DashboardSectionHeading } from '@/components/dashboard/os/DashboardSectionHeading'
import { getDashboardCoreProducts } from '@/components/dashboard/os/dashboard-modules'
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

function DashboardCoreProductsInner({ onNavigate }: DashboardCoreProductsProps) {
  const flagshipRoute = getRouteConfig(FLAGSHIP.id)

  return (
    <section className="dashboard-os-section">
      <DashboardSectionHeading
        title="Core Products"
        description="Modular AI engines for your creator stack."
        compact
      />

      <div className="space-y-1.5">
        <article
          className={cn(
            'dashboard-os-flagship dashboard-os-card dashboard-os-product--flagship nex-card-interactive',
            'dashboard-os-flagship--primary group relative overflow-hidden rounded-[var(--dash-radius-lg)] border border-violet-500/25',
          )}
        >
          <div
            className="dashboard-os-flagship__mesh pointer-events-none absolute inset-0"
            aria-hidden
          />
          <div
            className="dashboard-os-product__beam pointer-events-none absolute inset-x-0 top-0 z-10 h-px"
            aria-hidden
          />

          <div className="relative grid grid-cols-[1fr_auto] items-center gap-2 p-2.5 sm:gap-2.5 sm:p-3">
            <div className="flex min-w-0 flex-col justify-center">
              <div className="flex flex-wrap items-center gap-1">
                <Badge variant="pro" className="text-[8px] uppercase tracking-wider">
                  Flagship
                </Badge>
                <span className="text-[10px] font-medium text-zinc-500">Cinematic AI</span>
              </div>

              <h3 className="mt-1 text-[15px] font-semibold tracking-tight text-white sm:text-base">
                {flagshipRoute.label}
              </h3>
              <p className="dashboard-os-muted mt-0.5 line-clamp-2 text-[11px] leading-snug">
                {flagshipRoute.description}
              </p>

              <ul className="mt-2 flex flex-wrap gap-1" aria-label="Features">
                {FLAGSHIP_FEATURES.map((feature) => (
                  <li key={feature} className="dashboard-os-tag dashboard-os-tag--outline">
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="dashboard-os-flagship-cta-zone mt-2.5 pt-2.5">
              <button
                type="button"
                onClick={() => onNavigate(FLAGSHIP.id)}
                className="dashboard-os-btn dashboard-os-btn-primary btn-press dashboard-os-flagship-cta inline-flex h-9 w-full items-center justify-center gap-1 rounded-[var(--dash-radius)] px-4 text-[11px] tracking-tight"
              >
                Open Studio
                <span className="text-white/80" aria-hidden>
                  →
                </span>
              </button>
              </div>
            </div>

            <div className="dashboard-os-flagship-visual flex w-[4.5rem] shrink-0 items-center justify-center sm:w-[5rem]">
              <div className="dashboard-os-flagship-visual__frame size-full">
                <DashboardAiEngineVisual variant="studio" className="size-full" />
              </div>
            </div>
          </div>
        </article>

        <div className="dashboard-os-module-grid grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
          {SECONDARY.map((product) => {
            const route = getRouteConfig(product.id)
            const Icon = product.icon
            const isLive = product.statusVariant === 'success'

            return (
              <article
                key={product.id}
                className="dashboard-os-module-card dashboard-os-module-surface nex-card-interactive group flex h-full min-h-[7.5rem] flex-col rounded-[var(--dash-radius)] sm:min-h-[8rem]"
              >
                <div className="flex flex-1 flex-col p-2.5">
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="flex size-8 items-center justify-center rounded-lg border border-violet-500/15 bg-violet-500/8 text-violet-300">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <Badge
                      variant={product.statusVariant}
                      className="shrink-0 px-1.5 py-px text-[7px] font-bold uppercase tracking-wide"
                    >
                      {isLive ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="size-1 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                          Live
                        </span>
                      ) : (
                        product.status
                      )}
                    </Badge>
                  </div>

                  <h3 className="mt-2 text-[11px] font-semibold leading-snug text-white">
                    {route.label}
                  </h3>
                  <p className="mt-1 line-clamp-2 flex-1 text-[10px] leading-snug text-zinc-500">
                    {route.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => onNavigate(product.id)}
                    className="dashboard-os-btn dashboard-os-btn-secondary btn-press dashboard-os-module-cta mt-auto h-9 w-full rounded-[var(--dash-radius)] text-[10px] font-medium min-h-9"
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

export const DashboardCoreProducts = memo(DashboardCoreProductsInner)
