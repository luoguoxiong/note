/** Native 运行模式 */
export type NativeMode = 'standalone' | 'iframe' | 'micro-app' | 'micro-module'

/**
 * 用于 declaration merging 的接口，扩展 `native` 的自定义方法 TS 类型提示
 *
 * @example
 * ```ts
 * // global.d.ts 或任意 .d.ts 文件中
 * declare module '@kye-netc/micro-native' {
 *   interface NativeMethods {
 *     getUserInfo: (id: string) => { name: string; age: number }
 *     setTheme: (theme: 'light' | 'dark') => void
 *   }
 * }
 *
 * // 使用时即有完整类型提示
 * const info = await native.getUserInfo('123') // info: { name: string; age: number }
 * await native.setTheme('dark')
 * ```
 */
export interface NativeMethods {}

/**
 * @internal 工具类型：若 T 已是 Promise 则返回 Promise<U>，否则包装为 Promise<T>
 */
export type MaybePromise<T> =
  T extends Promise<infer U> ? Promise<U> : Promise<T>

export interface CallbackEntry {
  resolve: (value: any) => void
  reject: (reason: any) => void
  timer: ReturnType<typeof setTimeout>
}

export interface SharedBus {
  registry: Record<string, Function>
  eventListeners: Record<string, Function[]>
}

export const CALL_EVENT = '__NATIVE_CALL__'
export const RESPONSE_EVENT = '__NATIVE_RESPONSE__'
export const EMIT_EVENT = '__NATIVE_EVENT__'
export const REGISTER_EVENT = '__NATIVE_REGISTER__'
export const DEFAULT_TIMEOUT = 30_000
export const SHARED_KEY = '__NATIVE_EB__'

/** Native 实例公开方法列表 */
export const KNOWN_METHODS = new Set([
  'register',
  'clear',
  'getRegisteredMethods',
  'destroy',
  'onMessage',
  'addEventListener',
  'removeEventListener',
  'emit',
  'getMode',
  'setAppName',
  'getAppName',
])

declare global {
  interface Window {
    [SHARED_KEY]?: SharedBus
    __MICRO_APP_ENVIRONMENT__?: boolean
    __MICRO_MODULE_ENVIRONMENT__?: boolean
  }
}
