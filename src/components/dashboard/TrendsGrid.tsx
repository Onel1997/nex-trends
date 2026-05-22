import { MOCK_VIRAL_TRENDS } from '@/lib/mock-trends'
import { TrendCard } from './TrendCard'

export function TrendsGrid() {
  return (
    <section aria-labelledby="viral-trends-heading" className="mt-6 sm:mt-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="viral-trends-heading"
            className="text-lg font-semibold tracking-tight text-white sm:text-xl"
          >
            Aktuelle virale Trends
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {MOCK_VIRAL_TRENDS.length} Trends · sortiert nach Reichweite
          </p>
        </div>
        <p className="text-xs text-zinc-600 sm:text-right">
          Aktualisiert vor wenigen Minuten
        </p>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-4 sm:mt-5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {MOCK_VIRAL_TRENDS.map((trend) => (
          <li key={trend.id}>
            <TrendCard trend={trend} />
          </li>
        ))}
      </ul>
    </section>
  )
}
