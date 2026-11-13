import type { ProxySandbox } from './sandbox/ProxySandbox'

/** 子应用生命周期契约:主应用在对应时机调用 */
export interface MicroAppLifecycle {
  bootstrap?: () => void | Promise<void>
  mount?: (container?: string | Element) => unknown
  unmount?: () => void
}

/**
 * 共享组件工厂:`() => import('./xxx.vue')` 形式,运行时按需加载对应 chunk
 */
export type SharedComponentFactory = () => Promise<
  { default: unknown } | unknown
>

/**
 * 子应用暴露给主应用的对象(写到 window[name])
 * 泛型 R 为路由记录类型,Vue 适配层以 RouteRecordRaw 实例化。
 */
export interface SubAppExports<R = unknown> extends MicroAppLifecycle {
  /** 路由表(主应用注入到主 router) */
  routes: R[]
  /** 可选:动态获取路由表 */
  getRoutes?: () => R[]
  /** 共享组件映射(注册时同步写入全局注册表,供主应用/其他子应用引入) */
  components?: Record<string, SharedComponentFactory>
}

/**
 * 子应用侧 registerSubApp 的入参(框架无关泛型版本,Vue 适配层实例化)
 */
export interface SubAppRegisterOptions<R = unknown> extends MicroAppLifecycle {
  /** 子应用唯一标识,需与主应用 MicroAppConfig.name 一致 */
  name: string
  /** 路由表 */
  routes: R[]
  /**
   * 子应用共享组件映射:其他子应用/主应用可通过 useRemoteComponent({ name, component }) 引入。
   * 值为 `() => import('./xxx.vue')` 异步导入函数,chunk 从子应用自身域加载。
   */
  components?: Record<string, SharedComponentFactory>
}

/**
 * 主应用注册的子应用配置
 */
export interface MicroAppConfig {
  /** 子应用唯一标识(对应 window 上挂载的导出名,如 subApp1) */
  name: string
  /**
   * entry 支持两种形式:
   *  - string:静态配置
   *  - Promise<string>:运行时异步解析(如配置中心),结果会被缓存
   */
  entry: string | Promise<string>
  /** 路由激活规则:匹配此前缀的路径会触发加载/挂载该子应用,如 /sub-app-1 */
  activeRule: string
  /**
   * 预加载优先级(仅 createMicroRouter 开启 preload 时生效):数值越小越早,
   * 未设置按 0 处理;-1 表示不参与预加载。
   */
  priority?: number
  /**
   * 父级路由名称(Vue 适配层):设置后子应用路由以 children 形式注入到该命名路由下,
   * 否则注入到最顶层。核心层仅透传。
   */
  parentRouteName?: string
  /**
   * 是否启用 JS Proxy 沙箱(默认 true)。与样式沙箱(cssSandbox)相互独立,
   * jsSandbox: false 时仍可单独开启样式隔离。
   */
  jsSandbox?: boolean
  /**
   * 扩展 chunk 目录列表:子应用 publicPath 指向 CDN 或与入口不同目录时,
   * 显式声明前缀确保异步 chunk 被路由进沙箱。未声明时按入口 origin 兜底
   * (多子应用同 origin 无法消歧时告警并回退原生加载)。
   */
  chunkBasePaths?: string[]
  /**
   * 是否启用样式沙箱(默认 true,独立于 jsSandbox)。
   * 开启后子应用 CSS 自动改写为 `.micro-module-xxx` 前缀,仅命中容器内 DOM:
   * 入口 CSS 与子应用域名的 <link rel=stylesheet> 由沙箱拦截链改写。
   * jsSandbox: false 时会创建 css-only 沙箱(仅样式归属);
   * 已知限制:此模式下子应用 JS 动态创建的 <style> 无法归属改写。
   */
  cssSandbox?: boolean
}

/**
 * 已加载的子应用运行时记录
 */
export interface MicroAppRecord<R = unknown> {
  config: MicroAppConfig
  sandbox: ProxySandbox
  exports: SubAppExports<R>
}

/**
 * 子应用加载失败的错误信息
 */
export interface MicroAppLoadError {
  app: string
  from?: string
  error: unknown
}
