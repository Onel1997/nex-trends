import { invokeEdgeFunction } from '@/lib/edgeFunctions'

type TrackPayload = Record<string, string | number | boolean | null | undefined>

/** Fire-and-forget analytics — never blocks UX */
export function trackAnalyticsEvent(
  eventType: 'niche_search' | 'generation',
  payload: TrackPayload,
): void {
  void invokeEdgeFunction('track-event', { event_type: eventType, payload }).catch(() => {
    // Analytics must not break product flows
  })
}
