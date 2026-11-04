import { createPinia } from 'pinia'

/**
 * 主应用唯一 pinia 实例
 *
 * 微前端环境约定：非组件上下文（路由守卫、setTimeout 回调、异步续体）调用
 * useXxxStore() 时必须显式传入本实例。原因：pinia 的 useStore 在无组件上下文时
 * 回退到模块级 activePinia（CDN externals 使主/子应用共享该模块），子应用加载时
 * 会向主应用 app install 自己的 pinia，导致 activePinia 被覆盖、store 串实例
 * （现象：permission 弹窗在子应用加载后不触发）。
 */
export const pinia = createPinia()
