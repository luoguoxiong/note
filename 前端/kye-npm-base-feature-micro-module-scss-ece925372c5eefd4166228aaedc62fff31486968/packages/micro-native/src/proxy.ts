import { Native } from './native'
import { KNOWN_METHODS } from './types'
import type { NativeMode, NativeMethods, MaybePromise } from './types'

// Native 实例的公开 API 类型（对应 KNOWN_METHODS）
type NativePublicAPI = {
  register<T extends Record<string, (...args: any[]) => any>>(methods: T): void
  clear(): void
  getRegisteredMethods(): string[]
  destroy(): void
  onMessage(
    callback: (payload: { fromApp: string; data: any }) => void,
  ): () => void
  addEventListener(event: string, callback: (...args: any[]) => void): void
  removeEventListener(event: string, callback: (...args: any[]) => void): void
  emit(event: string, ...args: any[]): void
  getMode(): NativeMode
  setAppName(name: string): void
  getAppName(): string
}

// 将 NativeMethods 中定义的方法签名自动包装为 Promise 返回
type NativeCustomMethods = {
  [K in keyof NativeMethods]: NativeMethods[K] extends (
    ...args: infer A
  ) => infer R
    ? (...args: A) => MaybePromise<R>
    : never
}

type NativeInstance = NativePublicAPI & NativeCustomMethods

const warned = new Set<string>()

const _native = new Proxy(new Native(), {
  get(target, prop: string | symbol) {
    // 公开方法（native 原生 API）直接透传
    if (KNOWN_METHODS.has(prop as string)) {
      const value = (target as any)[prop]
      return typeof value === 'function' ? value.bind(target) : value
    }

    // 子应用模式：通过传输层代理到父容器（返回 Promise）
    if (target._isChild) {
      return (...args: any[]) => {
        if (prop === 'sendMessageTo') {
          args.push(target.getAppName())
        }
        return target._call(prop as string, args)
      }
    }

    // standalone 模式：从 registry 获取已注册的方法，统一返回 Promise
    const method = target._registry[prop as string]
    if (method) {
      return (...args: any[]) => {
        try {
          return Promise.resolve(method(...args))
        } catch (error: any) {
          return Promise.reject(error)
        }
      }
    }

    // 方法未注册：返回 rejected Promise，开发环境 warning
    const key = prop as string
    if (!warned.has(key)) {
      warned.add(key)
      console.warn(
        `[native] Method "${key}" is not registered. ` +
          'Please register it via native.register().',
      )
    }
    return (...args: any[]) =>
      Promise.reject(new Error(`[native] Method "${key}" is not registered`))
  },
})

export const native = _native as unknown as NativeInstance

// 确保后续 new Native() 返回的也是同一个 Proxy 实例
Native._instance = native as unknown as Native

export default native
