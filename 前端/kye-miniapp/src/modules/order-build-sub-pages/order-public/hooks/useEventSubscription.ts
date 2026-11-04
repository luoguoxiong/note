import { ref, onBeforeUnmount } from 'vue'

type EventCallback = (data: unknown) => void

interface EventListener {
  callback: EventCallback
  options: {
    once?: boolean
    triggered?: boolean
  }
}

/**
 * @description A class that manages event subscriptions.
 */
class EventManager {
  private eventListeners: Record<string, EventListener[]> = {}

  /**
   * @description Adds an event listener to the specified event.
   * @param eventName The name of the event to subscribe to.
   * @param callback The function to call when the event is triggered.
   * @param options An object that specifies whether the listener should be called once or not, and whether it has already been triggered or not.
   */
  public subscribe(eventName: string, callback: EventCallback, options: { once?: boolean } = {}): void {
    this.eventListeners[eventName] = this.eventListeners[eventName] || []
    this.eventListeners[eventName].push({ callback, options })
  }

  /**
   * @description Publishes an event to all registered listeners.
   * @param eventName The name of the event to publish.
   * @param data any data to pass to the listeners.
   * @param context The context to call the listeners in.
   */
  public publish(eventName: string, data: unknown, context?: unknown): void {
    const listeners = this.eventListeners[eventName]
    if (listeners) {
      listeners.forEach(({ callback, options }) => {
        if (!options.once || !options.triggered) {
          callback?.call(context, data)
          if (options.once) {
            options.triggered = true
          }
        }
      })
    }
  }

  /**
   * @description Removes an event listener from the specified event.
   * @param eventName The name of the event to unsubscribe from.
   * @param options An object that specifies the listener to remove.
   */
  public unsubscribe(eventName: string, options: { callback?: EventCallback } = {}): void {
    const listeners = this.eventListeners[eventName]
    if (listeners) {
      this.eventListeners[eventName] = listeners.filter(({ callback }) => {
        return !(options.callback && callback === options.callback)
      })
    }
  }
}

/**
 * @description A hook for subscribing to and publishing events.
 */
const useEventSubscription = (): {
  subscribe: (eventName: string, callback: EventCallback, options: { once?: boolean }) => void
  publish: (eventName: string, data: unknown, context?: unknown) => void
  unsubscribe: (eventName: string, options: { callback?: EventCallback }) => void
} => {
  const eventManager = new EventManager()
  const eventListeners = ref<Record<string, EventCallback[]>>({})

  const subscribe = (eventName: string, callback: EventCallback, options: { once?: boolean } = {}) => {
    eventManager.subscribe(eventName, callback, options)
    eventListeners.value[eventName] = eventListeners.value[eventName] || []
    eventListeners.value[eventName].push(callback)
  }

  const publish = (eventName: string, data: unknown, context?: unknown) => {
    eventManager.publish(eventName, data, context)
  }

  const unsubscribe = (eventName: string, options: { callback?: EventCallback } = {}) => {
    eventManager.unsubscribe(eventName, options)
    const listeners = eventListeners.value[eventName]
    if (listeners) {
      listeners.forEach((callback) => {
        eventManager.unsubscribe(eventName, { callback })
      })
      delete eventListeners.value[eventName]
    }
  }

  onBeforeUnmount(() => {
    for (const eventName in eventListeners.value) {
      eventListeners.value[eventName].forEach((callback) => {
        eventManager.unsubscribe(eventName, { callback })
      })
    }
  })

  return { subscribe, publish, unsubscribe }
}

const eventManager = new EventManager()

export default eventManager
export { useEventSubscription }
