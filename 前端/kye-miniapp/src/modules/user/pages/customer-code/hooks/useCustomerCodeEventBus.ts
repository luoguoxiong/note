/**
 * 客户编码模块 — 模块级事件总线
 *
 * 用于弹窗(Popup) 与 页面(Page) 之间的跨组件通信：
 * - Popup 注册一次性回调 → Page 绑码成功后 emit → Popup 收到通知刷新列表
 *
 * 设计原则：
 *   1. 模块级单例（Map 存储在模块顶层），所有组件共享同一实例
 *   2. once + emit 模式：注册后只执行一次，执行后自动清空
 *   3. clear 安全兜底：组件卸载/隐藏时手动清除，防止内存泄漏
 *
 * @example
 * ```ts
 * // Popup 侧 — 注册回调
 * const { once, clear } = useCustomerCodeEventBus()
 * once(CC_EVENTS.ADD_BIND_SUCCESS, (data) => {
 *   handleRefreshList()
 * })
 *
 * // Page 侧 — 触发回调
 * const { emit } = useCustomerCodeEventBus()
 * emit(CC_EVENTS.ADD_BIND_SUCCESS, data)
 * ```
 */

// ─── 事件名定义 ──────────────────────────────────────────────

export const CC_EVENTS = {
  /** 添加客户编码绑定成功（Popup → Page → Popup 回流） */
  ADD_BIND_SUCCESS: 'cc:addBindSuccess',
  /** 更换客户编码变更通知（Popup → Page → Popup 回流） */
  CHANGE_BIND_SUCCESS: 'cc:changeBindSuccess',
  /** 远程关闭弹窗（如登录页打开时通知弹窗静默关闭） */
  CLOSE_POPUP: 'cc:closePopup',
} as const

export type CcEventName = (typeof CC_EVENTS)[keyof typeof CC_EVENTS]
export type CcCallback = (data?: any) => void

// ─── 模块级存储（跨组件共享） ───────────────────────────────

const _callbacks = new Map<string, CcCallback[]>()

// ─── Hook 实现 ────────────────────────────────────────────────

/**
 * 获取客户编码模块的事件总线实例
 *
 * 所有调用方拿到的是同一个 Map 引用，因此：
 * - Popup 中 once() 注册的回调，Page 中 emit() 可以触发
 * - 反之亦然
 */
export function useCustomerCodeEventBus() {
  /**
   * 注册一次性回调
   *
   * 同名事件只会保留最后一个回调（先 clear 再 set）
   */
  function once(eventName: CcEventName, callback: CcCallback): void {
    clear(eventName)
    _callbacks.set(eventName, [callback])
  }

  /**
   * 触发事件
   *
   * 同步执行已注册的回调，执行后立即清空（防重入）
   * @returns 是否有回调被执行
   */
  function emit(eventName: CcEventName, data?: any): boolean {
    const cbs = _callbacks.get(eventName)
    if (!cbs?.length) return false
    // 先取出、再清空、最后执行
    const cb = cbs[0]
    clear(eventName)
    cb(data)
    return true
  }

  /** 手动清除指定事件的所有回调（安全兜底） */
  function clear(eventName: CcEventName): void {
    _callbacks.delete(eventName)
  }

  /** 是否存在待执行的回调（调试/判断用） */
  function hasPending(eventName: CcEventName): boolean {
    return !!_callbacks.get(eventName)?.length
  }

  return { once, emit, clear, hasPending }
}
