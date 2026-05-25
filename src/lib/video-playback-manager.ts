/** Limits concurrent Trend Intelligence previews (feed + modal). */

type PauseFn = () => void

type Slot = {
  priority: number
  pause: PauseFn
}

const MOBILE_MAX_ACTIVE = 2
const DESKTOP_MAX_ACTIVE = 6
const DESKTOP_STAGGER_MS = 110

function maxActiveSlots(isMobile: boolean): number {
  return isMobile ? MOBILE_MAX_ACTIVE : DESKTOP_MAX_ACTIVE
}

class VideoPlaybackManager {
  private slots = new Map<string, Slot>()

  register(id: string, pause: PauseFn): () => void {
    this.slots.set(id, { priority: 0, pause })
    return () => {
      this.slots.delete(id)
    }
  }

  private winners(isMobile: boolean): string[] {
    const max = maxActiveSlots(isMobile)
    return [...this.slots.entries()]
      .filter(([, slot]) => slot.priority > 0)
      .sort((a, b) => b[1].priority - a[1].priority)
      .slice(0, max)
      .map(([id]) => id)
  }

  private reconcile(isMobile: boolean): void {
    const allowed = new Set(this.winners(isMobile))
    for (const [id, slot] of this.slots) {
      if (slot.priority > 0 && !allowed.has(id)) {
        slot.pause()
        slot.priority = 0
      }
    }
  }

  requestPlay(id: string, priority: number, isMobile: boolean): void {
    const slot = this.slots.get(id)
    if (!slot) return
    slot.priority = priority
    this.reconcile(isMobile)
  }

  release(id: string): void {
    const slot = this.slots.get(id)
    if (!slot) return
    slot.priority = 0
  }

  isAllowed(id: string, isMobile: boolean): boolean {
    return this.winners(isMobile).includes(id)
  }

  /** Spreads decode/play work on desktop; no delay on mobile. */
  getStaggerDelay(id: string, isMobile: boolean): number {
    if (isMobile) return 0
    const rank = this.winners(isMobile).indexOf(id)
    return rank <= 0 ? 0 : rank * DESKTOP_STAGGER_MS
  }

  pauseAll(): void {
    for (const slot of this.slots.values()) {
      if (slot.priority > 0) slot.pause()
      slot.priority = 0
    }
  }
}

export const videoPlaybackManager = new VideoPlaybackManager()
