import * as Vue from 'vue'
import * as VueRouter from 'vue-router'
import '@/assets/fonts/iconfont/iconfont.css'
import '@netc-design-pc/theme-chalk/index.css'
import LazyLoadPlugin from '@/plugins/LazyLoadPlugin'
import '@/styles/animation.scss'
import '@/styles/common.scss'
// Quill 富文本展示样式（老项目 main.js 同款引入），供 ql-editor 容器（弹窗/版本详情）渲染富文本
import '@/styles/quill.core.css'
// import '@/styles/el-reset/index.scss'
import App from './App.vue'
import { routes } from './router'
import microApp from '@micro-zoe/micro-app'
import { createMicroMainApp } from '@kye-netc/micro-module'
/* 外部依赖 */
import SvgIcon from '@/components/svg-icon/index.vue'
import { Any } from '@/types'
import apm from '@/utils/apm-sdk'

/* 埋点 */
import ReportUmp from '@/reportUmp/index'
import umpOtherReport from '@/reportUmp/sceneReport/umpotherReport'

/** 埋点配置 */
import { addDetailPerformance, getReportConfig } from '@/utils/reportConfig'
import './utils/reportApp'
import '@/native/index'
import { useLightAppStore } from './stores/lightapp'
import { useUserStore } from './stores/user'
import { setupRouterGuard } from '@/router/guard'
import { syncTokenFromUrl, getToken } from '@/utils/auth'
import { pinia } from '@/stores'

/* URL 携带 token 参数时，经统一 auth 方法存入 sessionStorage */
syncTokenFromUrl()

window.$umpOtherReport = umpOtherReport

window.Vue = Vue
window.VueRouter = VueRouter

export const { app, router } = createMicroMainApp(App as Any, {
  history: VueRouter.createWebHashHistory(),
  routes: routes as Any,
  // 开启预加载:浏览器空闲后按 priority 升序依次后台加载所有子应用
  preload: false,
  microApps: [
    {
      name: 'order-utils',
      parentRouteName: 'Admin',
      // entry: Promise.resolve('http://localhost:8001'),
      // entry: Promise.resolve('http://localhost:9090'),
      entry: useLightAppStore(pinia).getAppLoadModuleEntry('M3088'),
      activeRule: '/admin/query',
      // priority 越小预加载越早;subApp1 优先于 subApp2 预加载
      priority: 1,
    },
    // {
    //   name: 'order',
    //   parentRouteName: 'Admin',
    //   // 模拟异步 entry:实际场景可为 fetch('/api/resolve-entry?app=subApp2').then(r => r.text())
    //   // entry: Promise.resolve('http://localhost:8002'),
    //   entry: useLightAppStore(pinia).getAppLoadModuleEntry('M6662'),
    //   activeRule: '/admin/order',
    //   priority: 2,
    // },
  ],
})

/* 挂载全局路由守卫（登录校验 + 权限拦截，见《路由权限方案》） */
setupRouterGuard(router)

/* apm全局vue错误上报 */
app.config.errorHandler = (error: Any) => {
  console.error(error)
  // apm性能监控错误上报
  apm.reportError(error)
}
app.component('svg-icon', SvgIcon)

// 启动京东 micro-app 微前端基座
microApp.start({
  'router-mode': 'pure',
  'disable-patch-request': true, // 关闭对子应用请求的拦截
})

app.use(pinia)

/* 启动预热：不等守卫/页面挂载，尽早发起用户信息与菜单接口，与 JS chunk 加载并行。
   store 内有单例与缓存保护，守卫/页面复用同一请求结果，不会重复发起 */
if (getToken()) {
  useUserStore(pinia)
    .init()
    .catch(() => undefined)
  useLightAppStore(pinia)
    .init()
    .catch(() => undefined)
}

app
  .use(ReportUmp, getReportConfig() as Any)
  .use(LazyLoadPlugin)
  .mount('#app')

addDetailPerformance('main执行完成')
