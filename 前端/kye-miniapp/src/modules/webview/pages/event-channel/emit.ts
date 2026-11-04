/**
 * 事件处理函数类型定义
 */
export type EventHandler<T = any> = (_data: T) => void

/**
 * 事件监听器接口
 */
interface EventListener<T = any> {
  handler: EventHandler<T>
  once: boolean
}

/**
 * 事件总线类
 * 提供事件的发布订阅功能，支持 on、once、emit、off 等方法
 */
class EventBus {
  private events: Map<string, EventListener[]> = new Map()

  /**
   * 监听事件
   * @param eventName 事件名称
   * @param handler 事件处理函数
   * @returns 返回取消监听的函数
   */
  on<T = any>(eventName: string, handler: EventHandler<T>): () => void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, [])
    }

    const listener: EventListener<T> = {
      handler,
      once: false,
    }

    this.events.get(eventName)!.push(listener)

    // 返回取消监听的函数
    return () => this.off(eventName, handler)
  }

  /**
   * 监听事件（只执行一次）
   * @param eventName 事件名称
   * @param handler 事件处理函数
   * @returns 返回取消监听的函数
   */
  once<T = any>(eventName: string, handler: EventHandler<T>): () => void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, [])
    }

    const listener: EventListener<T> = {
      handler,
      once: true,
    }

    this.events.get(eventName)!.push(listener)

    // 返回取消监听的函数
    return () => this.off(eventName, handler)
  }

  /**
   * 发布事件
   * @param eventName 事件名称
   * @param data 事件数据
   */
  emit<T = any>(eventName: string, data?: T): void {
    const listeners = this.events.get(eventName)
    if (!listeners || listeners.length === 0) {
      return
    }

    // 创建副本，避免在执行过程中修改原数组
    const listenersToExecute = [...listeners]

    // 执行监听器
    for (let i = listenersToExecute.length - 1; i >= 0; i--) {
      const listener = listenersToExecute[i]
      try {
        listener.handler(data)
      } catch (error) {
        console.error(`Event handler error for event "${eventName}":`, error)
      }

      // 如果是一次性监听器，执行后移除
      if (listener.once) {
        const index = listeners.findIndex((l) => l === listener)
        if (index !== -1) {
          listeners.splice(index, 1)
        }
      }
    }

    // 如果事件列表为空，移除事件
    if (listeners.length === 0) {
      this.events.delete(eventName)
    }
  }

  /**
   * 取消监听事件
   * @param eventName 事件名称
   * @param handler 要取消的事件处理函数（可选）
   */
  off<T = any>(eventName: string, handler?: EventHandler<T>): void {
    const listeners = this.events.get(eventName)
    if (!listeners) {
      return
    }

    if (handler) {
      // 移除指定的监听器
      const index = listeners.findIndex((listener) => listener.handler === handler)
      if (index !== -1) {
        listeners.splice(index, 1)
      }
    } else {
      // 移除所有监听器
      listeners.length = 0
    }

    // 如果事件列表为空，移除事件
    if (listeners.length === 0) {
      this.events.delete(eventName)
    }
  }

  /**
   * 移除所有事件监听器
   */
  clear(): void {
    this.events.clear()
  }

  /**
   * 获取指定事件的监听器数量
   * @param eventName 事件名称
   * @returns 监听器数量
   */
  listenerCount(eventName: string): number {
    const listeners = this.events.get(eventName)
    return listeners ? listeners.length : 0
  }

  /**
   * 获取所有事件名称
   * @returns 事件名称数组
   */
  eventNames(): string[] {
    return Array.from(this.events.keys())
  }

  /**
   * 检查是否有监听器监听指定事件
   * @param eventName 事件名称
   * @returns 是否有监听器
   */
  hasListeners(eventName: string): boolean {
    return this.listenerCount(eventName) > 0
  }
}

// 创建默认的事件总线实例

// 导出事件总线实例和类
export { EventBus }
