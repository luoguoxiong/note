import { createApp } from 'vue'
import * as Vue from 'vue'
import * as VueRouter from 'vue-router'
import * as Vuex from 'vuex'
import { createPinia } from 'pinia'
import microApp from '@micro-zoe/micro-app'
import App from './App.vue'
import { routes } from './router'
import { createMicroMainApp } from '@kye-netc/micro-module'
import './styles/global.css'
import { native } from '@kye-netc/micro-native'

// 共享依赖:子应用通过 externals 复用主应用的 vue / vue-router
window.Vue = Vue
window.VueRouter = VueRouter
window.Vuex = Vuex

const { app } = createMicroMainApp(App, {
  history: VueRouter.createWebHashHistory(),
  routes,
  // 开启预加载:浏览器空闲后按 priority 升序依次后台加载所有子应用
  preload: false,
  microApps: [
    // ===== 订单中台子应用(netc-pc-web-order-utils-new,UAT 线上 0.0.4) =====
    {
      name: 'order-utils',
      parentRouteName: 'admin',
      entry: Promise.resolve(
        'https://uc-uat.ky-express.com/netc-pc-web-order-utils-new/0.0.4/',
      ),
      activeRule: '/admin/query',
      priority: 1,
      jsSandbox: false,
    },
    // ===== demo 子应用(联调 order-utils 时暂不启动) =====
    {
      name: 'user',
      parentRouteName: 'admin',
      entry: Promise.resolve(
        'https://uc-uat.ky-express.com/netc-pc-web-admin/0.0.67/',
      ),
      activeRule: '/admin/user',
      priority: 1,
      // 验证 cssSandbox 独立于 JS 沙箱:无 JS 沙箱,仅样式沙箱
      jsSandbox: true,
      cssSandbox: true,
    },
    {
      name: 'order',
      parentRouteName: 'admin',
      entry: Promise.resolve('http://localhost:8002'),
      activeRule: '/admin/order',
      priority: 2,
      jsSandbox: true,
      cssSandbox: true,
    },
  ],
})

// 宿主必须自带 pinia:order-utils 注入模式不把 pinia 装到宿主(防 store 串实例),
// 其组件从宿主 app inject;缺失时 useStore() 拿到 undefined,生产包剥离友好报错后
// 表现为 "Cannot read properties of undefined (reading '_s')"(与 netc-pc-web-admin 宿主契约一致)
app.use(createPinia())

app.mount('#app')

console.log('主应用已挂载,子应用按需加载(路由命中时由 beforeEach 触发拉取)')

// ===== MicroApp(京东)微前端接入 =====
// 与 qiankun / micro-module 并存:
//  - microApp.start() 注册 <micro-app> 自定义元素 + 初始化沙箱
//  - 子应用以组件方式嵌入:在 views/MicroApp4.vue 中通过 <micro-app name url baseroute> 加载
//  - 子应用为普通 Vue 应用,无需导出生命周期,由 MicroApp 自动加载与沙箱隔离
microApp.start({
  // pure 模式:子应用独立于浏览器渲染(类似 iframe),既不修改浏览器地址,也不受其影响。
  // 注意:disable-memory-router 并不能真正关闭虚拟路由,其表现等同 native 模式——
  //  - 主/子应用均使用 createWebHashHistory 时,子应用会读到主应用真实 hash(#/micro-app-4),
  //    路由匹配不上导致空白不渲染,且双方互相抢占 window.location.hash。
  //  - 若需"关闭虚拟路由对 URL 的影响",应使用 pure 而非 disable-memory-router。
  'router-mode': 'pure',
  'disable-patch-request': true, // 关闭对子应用请求的拦截
})

native.setAppName('main-app')

native.register({
  getToken: (token) => Promise.resolve(token),
  getUserInfo: (userInfo) => userInfo,
})

setInterval(() => {
  native.emit('router-change', Math.random())
}, 1000)

console.log('MicroApp 已启动,<micro-app> 自定义元素已注册')
