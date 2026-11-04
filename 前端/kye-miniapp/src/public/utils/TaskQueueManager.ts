/**
 * 一个保证执行顺序的简单类，欢迎扩展
 * add 会立即执行
 */
class TaskQueueManager<T = any> {
  // 任务队列（后进先出）
  private queue: T[] = []
  // Promise执行链
  private currentPromise: Promise<void> = Promise.resolve()

  /**
   * 添加异步任务到队列，并返回任务结果的Promise
   * @param fn 返回Promise的异步函数
   * @param pushToQueue 是否将结果推入队列，默认为true
   */
  add<R>(fn: () => Promise<R>, pushToQueue = true): Promise<R> {
    return new Promise((resolve, reject) => {
      this.currentPromise = this.currentPromise
        .then(async () => {
          try {
            const result = await fn()
            if (pushToQueue) {
              this.queue.push(result as unknown as T)
            }
            resolve(result)
          } catch (error) {
            console.error('任务执行失败:', error)
            reject(error)
          }
        })
        .catch((error) => reject(error))
    })
  }

  /**
   * 提交任务队列，返回等待所有任务完成的Promise
   */
  submit(): Promise<void> {
    return this.currentPromise
  }

  /**
   * 获取队列最后一个元素
   */
  async getLast(): Promise<T | object> {
    return this.add<T | object>(async () => {
      return this.queue.length ? this.queue[this.queue.length - 1] : {}
    }, false)
  }

  /**
   * 移除并返回队列最后一个元素（通过任务队列执行）
   */
  removeLast(): Promise<T | undefined> {
    return this.add<T | undefined>(async () => {
      return this.queue.pop()
    }, false)
  }

  /**
   * 防止在有弹框页面切换了路由
   */
  static getInstance() {
    return new TaskQueueManager()
  }

  /**
   * 清空队列
   */
  clearQueue() {
    this.queue = []
  }
}

const currentInstance = new TaskQueueManager()

export const taskQueueWrapper = {
  get instance() {
    return currentInstance
  },
}
