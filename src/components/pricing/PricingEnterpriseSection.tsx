import { Button } from '@/components/ui/Button'
import { ENTERPRISE_CONTACT_EMAIL } from '@/lib/pricing'
import type { PlanTierId } from '@/lib/pricing'

type PricingEnterpriseSectionProps = {
  onContact: (planId: PlanTierId) => void
}

export function PricingEnterpriseSection({ onContact }: PricingEnterpriseSectionProps) {
  return (
    <section className="pricing-enterprise relative overflow-hidden rounded-[var(--dash-radius-lg)] border border-cyan-500/20 bg-gradient-to-br from-zinc-950 via-zinc-950 to-cyan-950/20 p-5 sm:p-6">
      <div
        className="pointer-events-none absolute -right-16 top-0 size-48 rounded-full bg-cyan-500/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 size-40 rounded-full bg-violet-600/8 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-cyan-400">
            Enterprise & Agency
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl">
            Scale client delivery with white-label & API
          </h3>
          <p className="dashboard-os-muted mt-2 text-[11px] leading-relaxed sm:text-xs">
            Built for agencies managing multiple creators. Custom onboarding, SLA,
            dedicated infrastructure, and team roles — tailored to your workflow.
          </p>
          <ul className="mt-4 grid gap-2 text-[11px] text-zinc-400 sm:grid-cols-2">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              Multi-client workspaces
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              White-label exports
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              REST API access
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              Priority support SLA
            </li>
          </ul>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:min-w-[200px]">
          <Button variant="primary" size="lg" fullWidth onClick={() => onContact('agency')}>
            Contact sales
          </Button>
          <a
            href={`mailto:${ENTERPRISE_CONTACT_EMAIL}?subject=NexTrends%20Agency%20Plan`}
            className="text-center text-[11px] text-zinc-500 transition-colors hover:text-cyan-300"
          >
            {ENTERPRISE_CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </section>
  )
}
