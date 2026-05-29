export type ActivityKind =
  | 'hook'
  | 'ad_copy'
  | 'seo'
  | 'audit'
  | 'video'
  | 'trend'
  | 'saved'
  | 'generic'

export type ActivityItem = {
  id: string
  tool: string
  label: string
  timestamp: string
  kind?: ActivityKind
}

export type WeeklyUsagePoint = {
  label: string
  value: number
}

export type TrendInsight = {
  id: string
  title: string
  platform: string
  views: string
  change: string
  gradientFrom: string
  gradientTo: string
}

export type DashboardUser = {
  name: string
  email: string
  avatarInitials: string
}
