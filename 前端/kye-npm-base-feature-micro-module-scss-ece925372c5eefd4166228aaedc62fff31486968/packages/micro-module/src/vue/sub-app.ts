import { createApp, type Component } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import type { SubAppRegisterOptions, SubAppExports } from './types'
import { MACRO_MODULE_VUEAPP } from './types'
import { registerSharedComponents } from '../shared-components'

/**
 * 子应用注册:把生命周期 + 路由表写到 window[name],供主应用拉取。
 * 必须在子应用入口调用(通常在 main.js 末尾)。
 *
 * @example
 * ```ts
 * registerSubApp({
 *   name: 'subApp1',
 *   routes,
 *   bootstrap: async () => { /* 一次性初始化 *\/ },
 *   mount: (container) => { /* 挂载 *\/ },
 *   unmount: () => { /* 卸载 *\/ },
 *   components: {
 *     button: () => import('./components/Button.vue'),
 *   },
 * })
 * ```
 */
export function registerSubApp(
  options: SubAppRegisterOptions,
  App: Component,
  rootContainer: Element,
): ReturnType<typeof createApp> {
  const { name, routes, bootstrap, mount, unmount, components } = options

  if (rootContainer) {
    const app = createApp(App)
    const router = createRouter({
      history: createWebHashHistory(),
      routes: routes,
    })
    app.use(router)
    return app
  }

  const exports: SubAppExports = {
    routes,
    bootstrap,
    mount,
    unmount,
    components,
    getRoutes: () => routes,
  }
  ;(window as unknown as Record<string, unknown>)[name] = exports

  // 注册共享组件到全局表(供其他子应用/主应用 useRemoteComponent 引入)
  if (components) registerSharedComponents(name, components)

  const mainApp = (window as unknown as Record<string, unknown>)[
    MACRO_MODULE_VUEAPP
  ] as ReturnType<typeof createApp>

  return mainApp
}

/**
 * 从 window 读取已注册的子应用导出
 * (主应用侧通常从沙箱 fakeWindow 读,此函数主要用于子应用独立运行调试)
 */
export function getSubAppExports(name: string): SubAppExports | null {
  return (
    ((window as unknown as Record<string, unknown>)[name] as SubAppExports) ||
    null
  )
}
