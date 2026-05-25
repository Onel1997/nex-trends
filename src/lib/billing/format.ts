const ACTION_LABELS: Record<string, string> = {
  trend_search: 'Trend search',
  hook_generation: 'Hook generation',
  seo_title: 'SEO title',
  ad_copy: 'Ad copy',
  landing_analysis: 'Landing analysis',
  ai_video: 'AI video',
  voiceover: 'Voiceover',
  captions: 'Captions',
  generation: 'AI generation',
}

export function formatUsageActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action.replace(/_/g, ' ')
}
