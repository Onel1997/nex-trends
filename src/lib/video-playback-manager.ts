/** Coordinates feed video autoplay slots and single active audio owner. */

type PauseFn = () => void
type MuteFn = () => void

type Slot = {
  priority: number
  pause: PauseFn
  mute: MuteFn
}

const MOBILE_MAX_ACTIVE = 1
const DESKTOP_MAX_ACTIVE = 3
const DESKTOP_STAGGER_MS = 90

function maxActiveSlots(isMobile: boolean): number {
  return isMobile ? MOBILE_MAX_ACTIVE : DESKTOP_MAX_ACTIVE
}

class VideoPlaybackManager {
  private slots = new Map<string, Slot>()
  private audioOwnerId: string | null = null

  register(id: string, pause: PauseFn, mute: MuteFn): () => void {
    this.slots.set(id, { priority: 0, pause, mute })
    return () => {
      if (this.audioOwnerId === id) this.audioOwnerId = null
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
        if (this.audioOwnerId === id) {
          slot.mute()
          this.audioOwnerId = null
        }
      }
    }
  }

  requestPlay(id: string, priority: number, isMobile: boolean): void {
    const slot = this.slots.get(id)
    if (!slot) return
    if (priority <= 0) {
      slot.priority = 0
      return
    }
    slot.priority = priority
    this.reconcile(isMobile)
  }

  release(id: string): void {
    const slot = this.slots.get(id)
    if (!slot) return
    slot.priority = 0
    if (this.audioOwnerId === id) {
      this.audioOwnerId = null
    }
    slot.mute()
  }

  isAllowed(id: string, isMobile: boolean): boolean {
    return this.winners(isMobile).includes(id)
  }

  getStaggerDelay(id: string, isMobile: boolean): number {
    if (isMobile) return 0
    const rank = this.winners(isMobile).indexOf(id)
    return rank <= 0 ? 0 : rank * DESKTOP_STAGGER_MS
  }

  /** Only one card may play sound; others are muted automatically. */
  requestAudio(id: string): boolean {
    if (this.audioOwnerId === id) return true

    for (const [slotId, slot] of this.slots) {
      if (slotId !== id) slot.mute()
    }

    this.audioOwnerId = id
    return true
  }

  releaseAudio(id: string): void {
    if (this.audioOwnerId !== id) return
    const slot = this.slots.get(id)
    slot?.mute()
    this.audioOwnerId = null
  }

  hasAudio(id: string): boolean {
    return this.audioOwnerId === id
  }

  pauseAll(): void {
    for (const slot of this.slots.values()) {
      if (slot.priority > 0) slot.pause()
      slot.priority = 0
      slot.mute()
    }
    this.audioOwnerId = null
  }
}

export const videoPlaybackManager = new VideoPlaybackManager()
