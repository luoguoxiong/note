type Listener<T = any> = (payload: T) => void

class EventBus {
  private events: Map<string, Set<Listener>> = new Map()

  on<T>(event: string, listener: Listener<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }

    const listeners = this.events.get(event)!
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.events.delete(event)
      }
    }
  }

  emit<T>(event: string, payload: T): void {
    this.events.get(event)?.forEach((listener) => {
      listener(payload)
    })
  }

  off(event: string): void {
    this.events.delete(event)
  }
}

export const eventBus = new EventBus()
