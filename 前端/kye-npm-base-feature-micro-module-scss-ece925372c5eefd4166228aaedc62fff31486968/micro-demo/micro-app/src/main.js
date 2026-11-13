import './public-path' // 必须第一行:微前端环境下设置 publicPath

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import { routes } from './router'
import store, { storeKey } from './store'
import native from '@kye-netc/micro-native'

let app = null

// 渲染函数:
//  - 采用 hash 模式:MicroApp 虚拟路由系统(默认开启)会拦截子应用的 location/history,
//    子应用的 hash 操作打到虚拟 location 上,与主应用真实 URL 隔离,互不干扰
//  - 独立模式:直接访问 http://localhost:8004#/、#/about、#/list、#/vuex-counter
function render() {
  const router = createRouter({
    history: createWebHashHistory(),
    routes,
  })

  app = createApp(App)
  app.use(router)
  app.use(store, storeKey)
  app.mount('#micro-app-4')
}

// 独立运行 & 微前端首次加载:子应用 JS 执行即渲染
// MicroApp 不要求显式生命周期导出(与 qiankun 不同),按普通应用挂载即可
render()

// 设置当前应用名称，onMessage 据此过滤推送给本应用的消息
native.setAppName('micro-app')

// 微前端卸载:MicroApp 移除 <micro-app> 元素时向子应用 window 派发 unmount 事件
// 此处清理 Vue 实例,避免内存泄漏与重复挂载
window.addEventListener('unmount', () => {
  if (app) {
    app.unmount()
    app = null
  }
})
