/**
 * @kye-netc/micro-module/sub-app — 子应用侧入口
 *
 * 提供:registerSubApp 子应用注册、publicPath 解析与设置、
 * useRemoteComponent(Vue 适配版)、registerSharedComponents。
 * 本入口严禁 import loader/sandbox(会把它们拉进子应用 bundle)。
 */

// publicPath 解析与设置:推荐用 resolvePublicPath 后由子应用自行赋值,
// webpack 编译子应用源码时才能识别该自由变量
export { setupPublicPath, resolvePublicPath } from './public-path'

// 子应用侧也可引入其他子应用的组件
// (无本地解析器时经真实 window 上的全局解析器让主应用加载,见 shared-components.ts)
export { registerSharedComponents } from './shared-components'

// Vue 适配版 useRemoteComponent:取回组件后自动包裹隔离容器
// (仅依赖核心层 shared-components 与 vue,不会把 loader/sandbox 拉进子应用 bundle)
import { useRemoteComponent as coreUseRemoteComponent } from './shared-components'
import { createVueUseRemoteComponent } from './vue/remote-component'
export const useRemoteComponent = createVueUseRemoteComponent(
  coreUseRemoteComponent,
)

export { registerSubApp, getSubAppExports } from './vue/sub-app'
