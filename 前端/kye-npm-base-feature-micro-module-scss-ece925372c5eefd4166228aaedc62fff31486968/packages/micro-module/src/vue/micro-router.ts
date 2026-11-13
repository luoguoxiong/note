import {
  createApp,
  defineAsyncComponent,
  defineComponent,
  h,
  markRaw,
} from 'vue'
import type { Component } from 'vue'
import { createRouter } from 'vue-router'
import type { Router, RouteRecordRaw, RouterHistory } from 'vue-router'
import {
  registerMicroApps,
  loadMicroApp,
  getMicroAppExports,
  getMicroAppSandbox,
  getMicroAppConfig,
  findMicroAppByPath,
} from '../loader/loader'
import { ensureSandboxInterceptor } from '../sandbox/ProxySandbox'
import { isCssSandboxEnabled } from '../style-scope'
import type { MicroAppConfig, MicroAppLoadError } from '../types'
import { MACRO_MODULE_VUEAPP } from './types'
/** 路由变更事件总线:子应用路由注入后主动通知导航刷新,替代轮询 */
export const routeEvents = new EventTarget()

// ===== 样式隔离容器(cssSandbox) =====
//
// 核心层把子应用 CSS 改写为 `.micro-module-xxx` 前缀,子应用渲染的 DOM
// 必须位于同名容器内才能命中。注入路由时自动包裹此容器组件
// (micro-module-route 自定义标签,未知元素默认 inline)。

/**
 * 包裹子应用路由组件:渲染在 micro-module-route.micro-module-xxx 容器内,
 * attrs/slots 透传。函数形式的懒加载组件先经 defineAsyncComponent 归一化
 * (否则 h(函数) 返回 Promise 被渲染成 "[object Promise]")。
 */
const createScopeContainer = (
  Wrapped: Component,
  appName: string,
): Component => {
  const inner: Component =
    typeof Wrapped === 'function'
      ? markRaw(defineAsyncComponent(Wrapped as () => Promise<Component>))
      : Wrapped
  return markRaw(
    defineComponent({
      name: `MicroModuleScope(${appName})`,
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () =>
          h(
            'micro-module-route',
            {
              class: `micro-module-${appName}`,
              'data-micro-app': appName,
            },
            [h(inner, attrs, slots)],
          )
      },
    }),
  )
}

/**
 * 递归包裹路由表:有 component 的包裹之;无 component 仅 children 的下钻处理
 */
const wrapRoutesWithScope = (
  routes: RouteRecordRaw[],
  appName: string,
): RouteRecordRaw[] =>
  routes.map((route) => {
    if (route.component) {
      return {
        ...route,
        component: createScopeContainer(route.component, appName),
      }
    }
    if (route.children?.length) {
      return {
        ...route,
        children: wrapRoutesWithScope(route.children, appName),
      }
    }
    return route
  })

/** createMicroRouter 配置项 */
export interface CreateMicroRouterOptions {
  /** 路由 history 实例,如 createWebHashHistory() */
  history: RouterHistory
  /** 主应用自身的路由表(不含子应用路由) */
  routes: RouteRecordRaw[]
  /** 初始子应用配置数组(可选)。运行时可通过 registerMicroApps / registerMicroApp 动态注册 */
  microApps?: MicroAppConfig[]
  /** 子应用加载失败时的错误页路由名(默认 'SubAppError'),主应用需自行注册该路由 */
  errorRouteName?: string
  /** 加载失败回调:返回 false 阻止默认跳错误页,可自定义处理(如 toast 后重试) */
  onError?: (err: MicroAppLoadError) => boolean | void
  /**
   * 是否在路由器创建后预加载子应用(默认 false)。
   * 开启后按 priority 升序后台加载(priority 为 -1 的跳过),延迟到浏览器空闲
   * 再开始;单个失败仅告警,导航命中时 beforeEach 会复用缓存或重试。
   */
  preload?: boolean
}

/**
 * 创建带子应用注入能力的微前端路由器(Vue 专属)
 *
 * 集成:beforeEach 按需加载子应用(失败跳错误页)、afterEach 切换
 * mount/unmount + 沙箱 activate/deactivate、子应用 routes 注入主 router。
 *
 * @example
 * ```ts
 * const router = createMicroRouter({
 *   history: createWebHashHistory(),
 *   routes: [
 *     { path: '/', name: 'Home', component: Home },
 *     { path: '/sub-app-error', name: 'SubAppError', component: SubAppError },
 *   ],
 *   microApps: [
 *     { name: 'subApp1', entry: 'http://localhost:8001', activeRule: '/sub-app-1' },
 *   ],
 * })
 * ```
 */
export function createMicroRouter(options: CreateMicroRouterOptions): Router {
  const {
    history,
    routes,
    microApps,
    errorRouteName = 'SubAppError',
    onError,
    preload = false,
  } = options

  if (microApps?.length) registerMicroApps(microApps)

  const router = createRouter({ history, routes })

  /**
   * 注入子应用路由到主 router(按 name 去重),注入后派发事件通知导航刷新。
   * 传 parentName 时以 children 形式注入到该命名路由下。
   */
  const addRoutes = (
    newRoutes: RouteRecordRaw[],
    parentName?: string,
  ): boolean => {
    let added = false
    newRoutes.forEach((route) => {
      // 仅注入未存在的路由(避免重复)
      if (route.name && !router.hasRoute(route.name)) {
        if (parentName && router.hasRoute(parentName)) {
          router.addRoute(parentName, route)
        } else {
          router.addRoute(route)
        }
        added = true
      }
    })
    if (added) {
      routeEvents.dispatchEvent(new Event('routes-changed'))
    }
    return added
  }

  // 路由进入:确保子应用已加载 + 路由已注入;失败跳错误页
  router.beforeEach(async (to) => {
    if (to.name === errorRouteName) return true
    // 当前路径未命中时回溯 redirectedFrom:主应用 catch-all 兜底路由(如
    // /admin/:pathMatch(.*)*)会在守卫前完成重定向,不回溯则子应用永远无法被识别
    const directRule = findMicroAppByPath(to.path)
    const rule =
      directRule ??
      (to.redirectedFrom ? findMicroAppByPath(to.redirectedFrom.path) : null)
    if (!rule) return true

    // 加载与路由注入解耦:子应用可能已被 useRemoteComponent 预加载
    let subExports = getMicroAppExports<RouteRecordRaw>(rule)
    if (!subExports) {
      try {
        subExports = await loadMicroApp<RouteRecordRaw>(rule)
      } catch (e) {
        console.error(`[micro-module] 子应用加载失败 [${rule}]:`, e)
        const handled = onError?.({ app: rule, from: to.fullPath, error: e })
        if (handled === false) return false
        return { name: errorRouteName, query: { app: rule, from: to.fullPath } }
      }
    }

    // 确保沙箱 script 拦截器在位(可能被第三方覆盖;css-only 样式沙箱同样依赖该拦截链)
    const appCfg = getMicroAppConfig(rule)
    if (appCfg?.jsSandbox !== false || isCssSandboxEnabled(appCfg)) {
      ensureSandboxInterceptor()
    }

    // 注入路由(addRoutes 内部 hasRoute 去重,预加载场景下为首次注入)
    const VueRef = (window as unknown as { Vue?: { markRaw: <T>(v: T) => T } })
      .Vue
    const routesToInject: RouteRecordRaw[] = VueRef
      ? subExports.routes.map(
          (r) =>
            ({
              ...r,
              component: VueRef.markRaw(r.component),
            }) as RouteRecordRaw,
        )
      : subExports.routes
    // 样式沙箱开启时包裹隔离容器,使前缀选择器命中子应用 DOM
    const routesFinal =
      appCfg && appCfg.name && isCssSandboxEnabled(appCfg)
        ? wrapRoutesWithScope(routesToInject, appCfg.name)
        : routesToInject
    const added = addRoutes(routesFinal, appCfg?.parentRouteName)

    // 新注入路由需跳回原始路径重新匹配;必须显式携带 query/hash
    // (vue-router 对对象 location 的 path 不解析内嵌 query)
    const replayLocation = to.redirectedFrom ?? to
    return added
      ? {
          path: replayLocation.path,
          query: replayLocation.query,
          hash: replayLocation.hash,
          replace: true,
        }
      : true
  })

  // 生命周期:进入/离开子应用命名空间时调用 mount/unmount + 沙箱 activate/deactivate
  const isSandboxEnabled = (rule: string) =>
    getMicroAppConfig(rule)?.jsSandbox !== false

  let activeSubAppRule: string | null = null
  router.afterEach((to) => {
    const nextRule = findMicroAppByPath(to.path)
    if (nextRule === activeSubAppRule) return

    // 离开旧子应用
    if (activeSubAppRule) {
      try {
        getMicroAppExports(activeSubAppRule)?.unmount?.()
      } catch (e) {
        console.warn(`[micro-module] ${activeSubAppRule}.unmount 失败`, e)
      }
      if (isSandboxEnabled(activeSubAppRule)) {
        getMicroAppSandbox(activeSubAppRule)?.deactivate()
      }
    }

    // 进入新子应用
    if (nextRule) {
      if (isSandboxEnabled(nextRule)) {
        getMicroAppSandbox(nextRule)?.activate()
      }
      try {
        getMicroAppExports(nextRule)?.mount?.()
      } catch (e) {
        console.warn(`[micro-module] ${nextRule}.mount 失败`, e)
      }
    }
    activeSubAppRule = nextRule
  })

  // 预加载:按 priority 升序后台加载,延迟到浏览器空闲;失败仅告警
  if (preload && microApps?.length) {
    const queue = microApps
      .filter((cfg) => cfg.priority !== -1)
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
    const run = async () => {
      for (const cfg of queue) {
        try {
          await loadMicroApp(cfg.activeRule)
        } catch (e) {
          console.warn(`[micro-module] 预加载子应用失败 [${cfg.name}]:`, e)
        }
      }
    }
    const ric = (
      window as unknown as {
        requestIdleCallback?: (
          cb: () => void,
          opts?: { timeout: number },
        ) => void
      }
    ).requestIdleCallback
    if (typeof ric === 'function') {
      ric(run, { timeout: 3000 })
    } else {
      setTimeout(run, 1000)
    }
  }

  return router
}

export function createMicroMainApp(
  App: ReturnType<typeof createApp>,
  options: CreateMicroRouterOptions,
) {
  const app = createApp(App)
  const router = createMicroRouter(options)
  app.use(router)
  const w = window as unknown as Record<PropertyKey, unknown>
  w[MACRO_MODULE_VUEAPP] = app
  return { app, router }
}
