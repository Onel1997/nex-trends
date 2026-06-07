const PREFIX = '[NexTrends:Video]'

export function logVideoPlayback(
  event: string,
  detail: Record<string, unknown> = {},
): void {
  if (typeof console === 'undefined') return
  console.info(PREFIX, event, detail)
}
