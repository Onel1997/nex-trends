import { Fragment } from 'react'
import { CheckIcon } from '@/components/ui/icons'
import {
  COMPARISON_PLAN_COLUMNS,
  COMPARISON_ROWS,
  getPlanById,
  type PlanTierId,
} from '@/lib/pricing'
import { cn } from '@/lib'

type PricingComparisonTableProps = {
  highlightPlanId?: PlanTierId
}

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center text-emerald-400">
        <CheckIcon className="size-4" aria-label="Included" />
      </span>
    )
  }
  if (value === false) {
    return <span className="text-zinc-600">—</span>
  }
  return <span className="text-zinc-300">{value}</span>
}

export function PricingComparisonTable({
  highlightPlanId = 'pro-creator',
}: PricingComparisonTableProps) {
  let lastCategory: string | undefined

  return (
    <div className="pricing-comparison overflow-hidden rounded-[var(--dash-radius-lg)] border border-zinc-800/50 bg-zinc-950/50">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-[11px]">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/40">
              <th
                scope="col"
                className="sticky left-0 z-10 bg-zinc-900/95 px-3 py-3 font-semibold text-zinc-500 backdrop-blur-sm sm:px-4"
              >
                Feature
              </th>
              {COMPARISON_PLAN_COLUMNS.map((id) => {
                const plan = getPlanById(id)
                const highlighted = id === highlightPlanId
                return (
                  <th
                    key={id}
                    scope="col"
                    className={cn(
                      'px-2 py-3 text-center font-semibold sm:px-3',
                      highlighted ? 'text-fuchsia-300' : 'text-zinc-400',
                    )}
                  >
                    <span className="block text-[10px] uppercase tracking-[0.1em]">
                      {plan.name}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => {
              const showCategory = row.category && row.category !== lastCategory
              if (row.category) lastCategory = row.category

              return (
                <Fragment key={row.label}>
                  {showCategory && (
                    <tr className="bg-zinc-900/25">
                      <td
                        colSpan={COMPARISON_PLAN_COLUMNS.length + 1}
                        className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-violet-400/90 sm:px-4"
                      >
                        {row.category}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-zinc-800/35 transition-colors hover:bg-violet-500/[0.03]">
                    <td className="sticky left-0 z-10 bg-zinc-950/95 px-3 py-2.5 font-medium text-zinc-300 backdrop-blur-sm sm:px-4">
                      {row.label}
                    </td>
                    {COMPARISON_PLAN_COLUMNS.map((id) => (
                      <td
                        key={id}
                        className={cn(
                          'px-2 py-2.5 text-center sm:px-3',
                          id === highlightPlanId && 'bg-fuchsia-500/[0.04]',
                        )}
                      >
                        <CellValue value={row.values[id]} />
                      </td>
                    ))}
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
