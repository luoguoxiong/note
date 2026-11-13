import type { CallbackEntry, SharedBus, NativeMode } from './types'
import {
  CALL_EVENT,
  RESPONSE_EVENT,
  EMIT_EVENT,
  REGISTER_EVENT,
  DEFAULT_TIMEOUT,
  SHARED_KEY,
} from './types'

function getSharedBus(): SharedBus {
  return (window[SHARED_KEY] ??= { registry: {}, eventListeners: {} })
}

export class Native {
  /* internal */ static _instance: Native

  /* internal */ _registry: Record<string, Function> = {}
  private _serverStarted = false
  private _callbacks: Record<string, CallbackEntry> = {}
  private _callId = 0
  private _mode: NativeMode = 'standalone'
  private _eventListeners: Record<string, Function[]> = {}
  private _childSources = new Set<Window>()
  /** 共享 EventBus 缓存，避免重复 window 属性查找 */
  private _bus: SharedBus | null = null
  /** 当前服务/应用名称，由 setAppName 设置 */
  private _appName = ''

  // 预先绑定的消息处理器（实例属性箭头函数，确保可作为 addEventListener/removeEventListener 参数）
  private _handleChildMessage = (event: MessageEvent): void => {
    const { data } = event
    if (!data) return
    switch (data.type) {
      case RESPONSE_EVENT:
        this._resolveResponse(data)
        break
      case EMIT_EVENT:
        this._triggerEvent(data.event, data.args)
        break
    }
  }

  /** 向指定 source 发送 postMessage，失败时自动从 _childSources 中移除 */
  private _postMessageToSource(
    source: Window,
    data: any,
    targetOrigin: string,
  ): boolean {
    try {
      source.postMessage(data, { targetOrigin } as any)
      return true
    } catch {
      // iframe 已销毁或跨域受限，从广播列表中移除
      this._childSources.delete(source)
      return false
    }
  }

  private _handleRequest = (event: MessageEvent): void => {
    const { data, source } = event
    if (!data || !source) return
    // 处理 iframe 子应用的注册消息，将其加入广播列表
    if (data.type === REGISTER_EVENT) {
      this._childSources.add(source as Window)
      return
    }
    if (data.type !== CALL_EVENT) return
    this._childSources.add(source as Window)
    this._processRequest(data, (response) => {
      try {
        // JSON 序列化/反序列化 result，避免 postMessage 因 structured clone 限制报 DataCloneError
        const safeResponse = {
          ...response,
          result:
            response.result !== undefined
              ? JSON.parse(JSON.stringify(response.result))
              : response.result,
        }
        this._postMessageToSource(
          source as Window,
          { type: RESPONSE_EVENT, id: data.id, ...safeResponse },
          event.origin,
        )
      } catch (e) {
        this._postMessageToSource(
          source as Window,
          {
            type: RESPONSE_EVENT,
            id: data.id,
            success: false,
            error: `[native] Failed to serialize response: ${e}`,
          },
          event.origin,
        )
      }
    })
  }

  constructor() {
    if (Native._instance) return Native._instance
    Native._instance = this
    this._detectMode()
    // 子应用侧：iframe 模式监听父容器 postMessage，并主动注册自身
    if (this._mode === 'iframe') {
      window.addEventListener('message', this._handleChildMessage)
      window.parent.postMessage({ type: REGISTER_EVENT }, '*')
    }
    // 基座侧默认注册 sendMessageTo 方法，子应用调用该方法时会通过传输层代理到基座
    // 基座收到调用后向所有子应用广播 'receiver-message' 事件
    if (!this._isChild) {
      this._registry['sendMessageTo'] = (
        toApp: string,
        data: any,
        fromApp: string,
      ) => {
        this.emit('receiver-message', {
          toApp,
          fromApp: fromApp ?? this.getAppName(),
          data,
        })
      }
    }
  }

  // ────── 模式检测 ──────

  private _detectMode(): void {
    if (window.__MICRO_APP_ENVIRONMENT__) {
      this._mode = 'micro-app'
    } else if (window.__MICRO_MODULE_ENVIRONMENT__) {
      this._mode = 'micro-module'
    } else {
      try {
        this._mode = window.self !== window.top ? 'iframe' : 'standalone'
      } catch {
        this._mode = 'iframe'
      }
    }
  }

  /** 当前运行模式 */
  getMode(): NativeMode {
    return this._mode
  }

  /** 设置当前服务/应用名称 */
  setAppName(name: string): void {
    this._appName = name
  }

  /** 获取当前服务/应用名称 */
  getAppName(): string {
    return this._appName
  }

  /** 是否在子应用环境中 */
  /* internal */ get _isChild(): boolean {
    return (
      this._mode === 'iframe' ||
      this._mode === 'micro-app' ||
      this._mode === 'micro-module'
    )
  }

  // ────── 方法注册 ──────

  register<T extends Record<string, Function>>(methods: T): void {
    Object.assign(this._registry, methods)
    if (this._serverStarted) {
      Object.assign(this._getBus().registry, methods)
    }
    this.enableServer()
  }

  getRegisteredMethods(): string[] {
    // iframe 模式：通过 RPC 远程获取父应用注册的方法名
    if (this._mode === 'iframe') {
      return this._callParent(
        '__native_list_methods__',
        [],
      ) as unknown as string[]
    }
    // micro-app / micro-module 模式：合并本地注册表和共享总线中的方法名
    if (this._mode === 'micro-app' || this._mode === 'micro-module') {
      const bus = this._getBus().registry
      return this._filterInternal([
        ...new Set([...Object.keys(this._registry), ...Object.keys(bus)]),
      ])
    }
    // standalone 模式：本地注册表
    return this._filterInternal(Object.keys(this._registry))
  }

  /** 过滤内部方法（以 __native_ 开头的） */
  private _filterInternal(names: string[]): string[] {
    return names.filter((k) => !k.startsWith('__native_'))
  }

  clear(): void {
    this._registry = {}
    if (this._serverStarted) {
      this._getBus().registry = {}
    }
  }

  // ────── 服务端（基座侧） ──────

  private enableServer(): void {
    if (this._serverStarted) return
    this._serverStarted = true
    window.addEventListener('message', this._handleRequest)
    // 注册辅助方法：供 iframe 子应用通过 RPC 获取父应用的方法名称列表
    this._registry['__native_list_methods__'] = () =>
      Object.keys(this._registry).filter((k) => !k.startsWith('__native_'))
    // 将已注册方法同步到共享 EventBus，供 micro-app/micro-module 子应用读取
    Object.assign(this._getBus().registry, this._registry)
  }

  // ────── 事件系统 ──────

  private addEventListener(event: string, callback: Function): void {
    ;(this._eventListeners[event] ??= []).push(callback)
    // micro-app/micro-module 子应用：同步注册到共享 EventBus，基座广播时可收到
    if (this._mode === 'micro-app' || this._mode === 'micro-module') {
      ;(this._getBus().eventListeners[event] ??= []).push(callback)
    }
  }

  private removeEventListener(event: string, callback: Function): void {
    // 本地清理
    const local = this._eventListeners[event]
    if (local) {
      this._eventListeners[event] = local.filter((cb) => cb !== callback)
    }
    // 共享 EventBus 清理
    const bus = this._getBus()
    const shared = bus.eventListeners[event]
    if (shared) {
      bus.eventListeners[event] = shared.filter((cb) => cb !== callback)
    }
  }

  /** 广播事件（基座侧调用，向所有子应用广播） */
  private emit(event: string, ...args: any[]): void {
    // 1. 触发本地监听器
    this._eventListeners[event]?.forEach((cb) => cb(...args))
    // 2. 向 iframe 子应用广播（postMessage 失败时自动清理已销毁的 source）
    this._childSources.forEach((source) => {
      this._postMessageToSource(source, { type: EMIT_EVENT, event, args }, '*')
    })
    // 3. 向 micro-app / micro-module 子应用广播（通过共享 EventBus）
    //    注意：micro-app/micro-module 模式下，子应用的监听器已注册到共享 EventBus，
    //    但基座自身的监听器已在第 1 步触发过，所以这里只触发非本地监听器，
    //    避免基座侧重复触发
    if (this._mode === 'micro-app' || this._mode === 'micro-module') {
      const bus = this._getBus()
      const sharedListeners = bus.eventListeners[event]
      if (sharedListeners) {
        // 过滤掉已在本地触发过的监听器，避免重复
        const localListeners = new Set(this._eventListeners[event] ?? [])
        sharedListeners.forEach((cb) => {
          if (!localListeners.has(cb)) {
            cb(...args)
          }
        })
      }
    } else {
      // standalone / iframe 模式：共享 EventBus 中的监听器就是子应用的，
      // 与本地监听器无重叠，直接全部触发
      this._getBus().eventListeners[event]?.forEach((cb) => cb(...args))
    }
  }

  /**
   * 监听通过 sendMessageTo 发来的消息，只接收推送给当前 AppName 的消息
   * @param callback 接收消息的回调，参数为 { fromApp: string, data: any }
   * @returns 取消监听的函数
   */
  onMessage(
    callback: (payload: { fromApp: string; data: any }) => void,
  ): () => void {
    const wrapped = (payload: {
      toApp: string
      fromApp: string
      data: any
    }) => {
      if (!this._appName || payload.toApp === this._appName) {
        callback({ data: payload.data, fromApp: payload.fromApp })
      }
    }
    this.addEventListener('receiver-message', wrapped as Function)
    return () =>
      this.removeEventListener('receiver-message', wrapped as Function)
  }

  /**
   * 调用方法（由 Proxy 调用）
   * 在子应用模式中，通过对应传输层代理到父容器
   */
  /* internal */ _call(method: string, args: any[]): any {
    if (this._isChild) {
      return this._callParent(method, args)
    }
    const fn = this._registry[method]
    if (!fn) {
      throw new Error(`[native] Method "${method}" is not registered`)
    }
    return fn(...args)
  }

  /**
   * 子应用通过对应传输层调用父容器的方法
   *
   * micro-app/micro-module 模式：通过共享 EventBus 直接读取基座注册的方法并同步调用
   *   （同进程、无序列化开销，像 standalone 一样直接）
   * iframe 模式：通过 postMessage 异步调用
   */
  private _callParent(method: string, args: any[]): Promise<any> {
    // micro-app/micro-module 共享 EventBus，同步调用
    if (this._mode === 'micro-app' || this._mode === 'micro-module') {
      const fn = this._getBus().registry[method]
      if (!fn) {
        return Promise.reject(
          new Error(`[native] Method "${method}" is not registered in parent`),
        )
      }
      try {
        return Promise.resolve(fn(...args))
      } catch (error: any) {
        return Promise.reject(error)
      }
    }

    // iframe 模式：postMessage 异步调用
    const id = `${++this._callId}_${Math.random().toString(36).slice(2, 8)}`
    // JSON 序列化 args，避免 postMessage 因 structured clone 限制报 DataCloneError
    const safeArgs = JSON.parse(JSON.stringify(args))
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        delete this._callbacks[id]
        reject(new Error(`[native] Method "${method}" timed out`))
      }, DEFAULT_TIMEOUT)
      this._callbacks[id] = { resolve, reject, timer }
      window.parent.postMessage(
        { type: CALL_EVENT, id, method, args: safeArgs },
        '*',
      )
    })
  }

  // ────── 内部方法：消息处理 ──────

  /** 解析方法调用返回值 */
  private _resolveResponse(data: {
    id: string
    success: boolean
    result?: any
    error?: string
  }): void {
    const entry = this._callbacks[data.id]
    if (!entry) return
    clearTimeout(entry.timer)
    delete this._callbacks[data.id]
    data.success
      ? entry.resolve(data.result)
      : entry.reject(new Error(data.error))
  }

  /** 触发事件监听器 */
  private _triggerEvent(event: string, args: any[]): void {
    this._eventListeners[event]?.forEach((cb) => cb(...(args ?? [])))
  }

  /**
   * 统一处理：执行注册的方法并发送响应
   */
  private _processRequest(
    data: { id: string; method: string; args: any[] },
    sendResponse: (response: {
      success: boolean
      result?: any
      error?: string
    }) => void,
  ): void {
    const fn = this._registry[data.method]
    if (!fn) {
      sendResponse({
        success: false,
        error: `[native] Method "${data.method}" is not registered in parent`,
      })
      return
    }
    try {
      const result = fn(...data.args)
      Promise.resolve(result).then(
        (resolved) => sendResponse({ success: true, result: resolved }),
        (error: any) =>
          sendResponse({
            success: false,
            error: error?.message ?? String(error),
          }),
      )
    } catch (error: any) {
      sendResponse({ success: false, error: error?.message ?? String(error) })
    }
  }

  // ────── 内部工具 ──────

  /** 获取共享 EventBus（带缓存） */
  private _getBus(): SharedBus {
    return (this._bus ??= getSharedBus())
  }
}
