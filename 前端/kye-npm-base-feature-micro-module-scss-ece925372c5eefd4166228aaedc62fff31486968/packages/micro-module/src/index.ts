/**
 * @kye-netc/micro-module — 微前端库(核心 + Vue3 适配)
 *
 * 主应用从本入口一站引入:沙箱原语(ProxySandbox / execInSandbox)、加载器 API、
 * createMicroMainApp 微前端路由器、useRemoteComponent / 共享组件机制、
 * publicPath 解析、类型。
 * 子应用侧请从 ./sub-app 入口引入 registerSubApp,避免把 loader/sandbox 拉进
 * 子应用 bundle。
 */

// 沙箱(高级用法)
export {
  ProxySandbox,
  execInSandbox,
  ensureSandboxInterceptor,
} from './sandbox/ProxySandbox'

// 加载器(手动控制 / 动态注册场景)
export {
  registerMicroApps,
  registerMicroApp,
  loadMicroApp,
  unloadMicroApp,
  getMicroAppExports,
  getMicroAppSandbox,
  getMicroAppConfig,
  findMicroAppByPath,
  findMicroAppByName,
  isMicroAppLoaded,
} from './loader/loader'

// 样式沙箱:CSS 选择器自动加 .micro-module-xxx 前缀,通常无需手动调用
export {
  scopeCss,
  scopePrefix,
  SCOPED_ATTR,
  isCssSandboxEnabled,
} from './style-scope'

// Vue 专属:微前端路由器
export { createMicroMainApp, routeEvents } from './vue/micro-router'
export type { CreateMicroRouterOptions } from './vue/micro-router'

// 共享组件:主应用/子应用均可通过 useRemoteComponent 引入子应用共享组件。
// Vue 适配版:取回组件后自动包裹 micro-module-remote.micro-module-xxx
// 隔离容器,使前缀样式命中远程组件
import { useRemoteComponent as coreUseRemoteComponent } from './shared-components'
import { createVueUseRemoteComponent } from './vue/remote-component'
export const useRemoteComponent = createVueUseRemoteComponent(
  coreUseRemoteComponent,
)

// 主应用入口加载时自动注入共享组件加载解析器:
// useRemoteComponent 找不到目标组件时,按 name 拉起对应子应用
import { setSharedComponentLoaderResolver } from './shared-components'
import { findMicroAppByName, loadMicroApp } from './loader/loader'
setSharedComponentLoaderResolver(async (name) => {
  const rule = findMicroAppByName(name)
  if (!rule) return false
  await loadMicroApp(rule)
  return true
})

// 注:setupPublicPath / resolvePublicPath 属于子应用侧能力,
// 请从 ./sub-app 入口引入(避免主应用侧误用)。

// 类型(Vue 实例化版本,核心泛型版本经 vue/types 透传)
export type {
  MicroAppConfig,
  MicroAppLifecycle,
  SharedComponentFactory,
  MicroAppLoadError,
  SubAppExports,
  SubAppRegisterOptions,
  MicroAppRecord,
} from './vue/types'
