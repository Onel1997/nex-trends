import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { cn } from '@/lib'

const CHART_COLORS = ['#8b5cf6', '#d946ef', '#a78bfa', '#e879f9', '#6366f1', '#ec4899']

const tooltipStyle = {
  backgroundColor: 'rgba(9,9,11,0.95)',
  border: '1px solid rgba(63,63,70,0.6)',
  borderRadius: '12px',
  fontSize: '12px',
  color: '#e4e4e7',
}

type DailyPoint = {
  date: string
  generations: number
  credits: number
  activeUsers: number
}

type RankPoint = {
  name: string
  count: number
}

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center text-sm text-zinc-500">
      {message}
    </div>
  )
}

export function GenerationsAreaChart({ data }: { data: DailyPoint[] }) {
  if (data.length === 0) {
    return <EmptyChart message="Noch keine Tagesdaten für diesen Zeitraum." />
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="genGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.35)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatShortDate}
          tick={{ fill: '#71717a', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#71717a', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(v) => formatShortDate(String(v))}
        />
        <Area
          type="monotone"
          dataKey="generations"
          name="Generierungen"
          stroke="#a78bfa"
          fill="url(#genGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function CreditsBarChart({ data }: { data: DailyPoint[] }) {
  if (data.length === 0) {
    return <EmptyChart message="Keine Credit-Daten im Zeitraum." />
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.35)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatShortDate}
          tick={{ fill: '#71717a', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#71717a', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(v) => formatShortDate(String(v))}
        />
        <Bar dataKey="credits" name="Credits" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ToolsPieChart({ data }: { data: RankPoint[] }) {
  if (data.length === 0) {
    return <EmptyChart message="Noch keine Tool-Nutzung." />
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={52}
          outerRadius={88}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function HorizontalRankChart({
  data,
  dataKey = 'count',
  labelKey = 'name',
  color = '#8b5cf6',
}: {
  data: RankPoint[]
  dataKey?: string
  labelKey?: string
  color?: string
}) {
  if (data.length === 0) {
    return <EmptyChart message="Keine Daten verfügbar." />
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 36)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.25)" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey={labelKey}
          width={100}
          tick={{ fill: '#a1a1aa', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey={dataKey} fill={color} radius={[0, 6, 6, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  )
}

type AdminChartCardProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export function AdminChartCard({ title, subtitle, children, className }: AdminChartCardProps) {
  return (
    <Card variant="glass" className={cn('overflow-hidden', className)}>
      <CardHeader>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p> : null}
      </CardHeader>
      <CardBody className="pt-0">{children}</CardBody>
    </Card>
  )
}

export function LiveCounterStrip({
  counters,
}: {
  counters: { last24h: number; last7d: number; last30d: number }
}) {
  const items = [
    { label: '24h', value: counters.last24h, accent: 'text-violet-300' },
    { label: '7d', value: counters.last7d, accent: 'text-fuchsia-300' },
    { label: '30d', value: counters.last30d, accent: 'text-emerald-300' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-zinc-800/60 bg-zinc-950/50 px-4 py-3 text-center"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Live {item.label}
          </p>
          <p className={cn('mt-1 text-2xl font-bold tabular-nums', item.accent)}>
            {item.value.toLocaleString('de-DE')}
          </p>
        </div>
      ))}
    </div>
  )
}
