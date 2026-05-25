/** Limits concurrent Trend Intelligence previews (feed + modal). */

type PauseFn = () => void

const MAX_ACTIVE = 2

class VideoPlaybackManager {
  private activeIds: string[] = []
  private pausers = new Map<string, PauseFn>()

  register(id: string, pause: PauseFn): () => void {
    this.pausers.set(id, pause)
    return () => {
      this.pausers.delete(id)
      this.activeIds = this.activeIds.filter((activeId) => activeId !== id)
    }
  }

  requestPlay(id: string): void {
    const queue = this.activeIds.filter((activeId) => activeId !== id)
    queue.push(id)

    while (queue.length > MAX_ACTIVE) {
      const evicted = queue.shift()
      if (evicted) this.pausers.get(evicted)?.()
    }

    this.activeIds = queue
  }

  release(id: string): void {
    this.activeIds = this.activeIds.filter((activeId) => activeId !== id)
  }

  pauseAll(): void {
    const ids = [...this.activeIds]
    this.activeIds = []
    for (const id of ids) {
      this.pausers.get(id)?.()
    }
  }
}

export const videoPlaybackManager = new VideoPlaybackManager()
