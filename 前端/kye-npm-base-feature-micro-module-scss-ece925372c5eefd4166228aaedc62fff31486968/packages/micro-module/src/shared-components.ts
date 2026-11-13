/**
 * 子应用共享组件机制
 *
 * 子应用通过 registerSubApp({ components: { button: () => import('./xxx.vue') } })
 * 声明可复用组件;主应用 / 其他子应用通过 useRemoteComponent 按需引入。
 * 注册表挂在真实 window 上,ProxySandbox 的 set 拦截会同步该键,实现跨沙箱共享。
 */
import type { SharedComponentFactory } from './types'

/** 真实 window 上的共享组件注册表键名(ProxySandbox.set 会同步此键) */
export const SHARED_COMPONENTS_REGISTRY_KEY =
  '__MICRO_MODULE_SHARED_COMPONENTS__'

/** 组件名 -> 工厂函数 */
type ComponentFactoryMap = Record<string, SharedComponentFactory>
/** 子应用名 -> (组件名 -> 工厂函数) */
type SharedComponentsRegistry = Map<string, ComponentFactoryMap>

/**
 * 加载解析器:主应用入口加载时自动注入(主应用 bundle 的闭包,捕获主应用 loader 状态)。
 * useRemoteComponent 找不到组件时按 name 触发主应用加载目标子应用,
 * 支持「子应用 → 子应用」的共享组件引入。
 */
type LoaderResolver = (name: string) => Promise<boolean>

/** 真实 window 上的加载解析器键名(主应用写入,子应用经沙箱 get 透传读取) */
const LOADER_RESOLVER_KEY = '__MICRO_MODULE_LOADER_RESOLVER__'

/**
 * 注入加载解析器(主应用入口模块加载时自动调用;已存在则不覆盖)
 */
export function setSharedComponentLoaderResolver(
  fn: LoaderResolver | null,
): void {
  const w = window as unknown as Record<PropertyKey, unknown>
  if (w[LOADER_RESOLVER_KEY]) return
  w[LOADER_RESOLVER_KEY] = fn
}

/** 读取全局加载解析器(主应用/子应用均经此获取同一份) */
function getLoaderResolver(): LoaderResolver | null {
  return (
    (window as unknown as Record<PropertyKey, LoaderResolver | null>)[
      LOADER_RESOLVER_KEY
    ] || null
  )
}

/** 获取全局共享组件注册表(挂在真实 window 上,跨沙箱共享) */
function getRegistry(): SharedComponentsRegistry {
  const w = window as unknown as Record<PropertyKey, unknown>
  if (!w[SHARED_COMPONENTS_REGISTRY_KEY]) {
    w[SHARED_COMPONENTS_REGISTRY_KEY] = new Map()
  }
  return w[SHARED_COMPONENTS_REGISTRY_KEY] as SharedComponentsRegistry
}

/**
 * 注册子应用共享组件(registerSubApp 内部调用)
 */
export function registerSharedComponents(
  appName: string,
  components: Record<string, SharedComponentFactory>,
): void {
  getRegistry().set(appName, components)
}

/**
 * 按需引入子应用共享组件
 *
 * 流程:查全局注册表 -> 未命中时经全局加载解析器让主应用加载目标子应用后重试
 * -> 仍找不到则抛错。主应用与子应用上下文均生效(解析器经沙箱 Proxy 透传读取)。
 *
 * @example
 * ```ts
 * const Button = await useRemoteComponent({ name: 'subApp1', component: 'button' })
 * ```
 */
export async function useRemoteComponent<T = unknown>(opts: {
  /** 子应用名(registerSubApp 时的 name) */
  name: string
  /** 组件名(components 映射的 key) */
  component: string
}): Promise<T> {
  const { name, component } = opts
  const registry = getRegistry()

  let factoryMap = registry.get(name)
  if (!factoryMap || !factoryMap[component]) {
    // 未命中时经全局解析器让主应用加载目标子应用
    const resolver = getLoaderResolver()
    if (resolver) {
      const ok = await resolver(name)
      if (ok) factoryMap = registry.get(name)
    }
  }

  const factory = factoryMap?.[component]
  if (typeof factory !== 'function') {
    throw new Error(
      `[micro-module] 共享组件未找到: ${name}.${component}(请确认该子应用已加载并注册了此组件)`,
    )
  }

  const mod = await factory()
  // 异步组件 import 形如 () => import('./Button.vue') → { default: Component }
  return ((mod as { default?: unknown })?.default ?? mod) as T
}
