import { Badge } from '@/components/ui/Badge'
import { DashboardSectionHeading } from '@/components/dashboard/os/DashboardSectionHeading'
import {
  ChartBarIcon,
  ClapperboardIcon,
  SparklesIcon,
  TrendingUpIcon,
} from '@/components/ui/icons'
import { getRouteConfig } from '@/lib/routes'
import type { DashboardRouteId } from '@/lib/routes'
import { cn } from '@/lib'

type DashboardCoreProductsProps = {
  onNavigate: (tool: DashboardRouteId) => void
}

const PRODUCTS = [
  {
    id: 'trend-intelligence' as const,
    status: 'Live',
    statusVariant: 'success' as const,
    featured: false,
    icon: TrendingUpIcon,
  },
  {
    id: 'ai-studio' as const,
    status: 'Flagship',
    statusVariant: 'pro' as const,
    featured: true,
    icon: ClapperboardIcon,
  },
  {
    id: 'analyzer' as const,
    status: 'Beta',
    statusVariant: 'default' as const,
    featured: false,
    icon: ChartBarIcon,
  },
]

export function DashboardCoreProducts({ onNavigate }: DashboardCoreProductsProps) {
  return (
    <section className="animate-fade-in animation-delay-200">
      <DashboardSectionHeading
        title="Core Products"
        description="Modular AI engines powering your entire creator stack."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PRODUCTS.map((product, i) => {
          const route = getRouteConfig(product.id)
          const Icon = product.icon

          return (
            <article
              key={product.id}
              className={cn(
                'dashboard-os-product glass-premium group relative overflow-hidden rounded-2xl text-left',
                product.featured
                  ? 'dashboard-os-product--flagship border-fuchsia-500/35 md:col-span-2 xl:col-span-2'
                  : 'border-zinc-800/50',
                'animate-fade-in',
              )}
              style={{ animationDelay: `${180 + i * 60}ms` }}
            >
              {product.featured && (
                <>
                  <div
                    className="dashboard-os-product__beam pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/60 to-transparent"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-fuchsia-500/25 blur-3xl transition-smooth group-hover:bg-fuchsia-500/35"
                    aria-hidden
                  />
                </>
              )}

              <div className="relative flex h-full flex-col p-5 sm:p-6 lg:p-7">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      'flex items-center justify-center rounded-2xl ring-1 ring-white/10 transition-smooth group-hover:scale-105',
                      product.featured
                        ? 'size-14 bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-xl shadow-fuchsia-900/45'
                        : 'size-12 bg-gradient-to-br from-violet-600/90 to-violet-800/70 shadow-lg shadow-violet-900/25',
                    )}
                  >
                    <Icon
                      className={cn('text-white', product.featured ? 'size-7' : 'size-6')}
                      aria-hidden
                    />
                  </span>
                  <Badge
                    variant={product.statusVariant}
                    className={cn(
                      'shrink-0 capitalize',
                      product.featured && 'animate-pulse-soft',
                    )}
                  >
                    {product.status}
                  </Badge>
                </div>

                <h3
                  className={cn(
                    'mt-5 font-semibold tracking-tight text-white',
                    product.featured ? 'text-xl sm:text-2xl' : 'text-lg',
                  )}
                >
                  {route.label}
                </h3>
                <p
                  className={cn(
                    'mt-2 flex-1 leading-relaxed text-zinc-500',
                    product.featured ? 'text-sm sm:text-base' : 'text-sm',
                  )}
                >
                  {route.description}
                </p>

                {product.featured && (
                  <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-medium text-fuchsia-200/95">
                    <SparklesIcon className="size-3.5 shrink-0" aria-hidden />
                    Flagship · hooks · voiceover · captions
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => onNavigate(product.id)}
                  className={cn(
                    'btn-glow-pro btn-press mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-smooth sm:mt-7',
                    product.featured
                      ? 'gradient-accent text-white shadow-lg shadow-violet-900/40'
                      : 'border border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/18',
                  )}
                >
                  {product.featured ? 'Open AI Video Studio' : 'Launch module'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
