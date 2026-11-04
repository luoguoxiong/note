import { defineAsyncComponent } from 'vue'
import { ExtendedRouteRecordRaw } from '../types'

export const vtsRoutes: ExtendedRouteRecordRaw[] = [
  {
    // name 对齐老项目 router/micro/vts.js：通用 Iframe 组件按 route.name === routerName 守卫消息，
    // 且 sendMsg 的 from 字段（= routerName）需与子应用约定的 'vtsOrder'/'vtsWaybill' 一致
    name: 'vtsOrder',
    path: '/admin/vtsOrder',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-vts-order' */ '@/views-iframe/vts/vts-order.vue')
    ),
    meta: {
      // 整车寄件：需绑码（老基座 routesPrehibitWithoutCustomerCode 含 '/admin/vtsOrder'）；
      // 无下单权限校验（老基座 orderRouterNameList 不含 vtsOrder，整车寄件走子应用内控）
      requireCustomerCode: true,
    },
  },
  {
    name: 'vtsWaybill',
    path: '/admin/vtsWaybill',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-vts-waybill' */ '@/views-iframe/vts/vts-waybill.vue')
    ),
    meta: {
      // 整车运单：需绑码(对齐老基座 routerGuard canToWaybillWithoutCumeCode 白名单)
      // requireCustomerCode: true,
    },
  },
  {
    // 整车运单详情（对齐老项目 router/micro/vts.js vtsWaybill-detail）：
    // 由整车运单子应用经 COMMON routerPush 携参跳入，页面 iframe 加载子应用
    // '#/admin/vts-waybill-detail' 内页（VTS-WAYBILL-DETAIL 派生菜单解析地址）
    name: 'vtsWaybill-detail',
    path: '/admin/vtsWaybill-detail',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-vts-detail' */ '@/views-iframe/vts/vts-detail.vue')
    ),
    meta: {
      // 老基座 tab.vue 按 basePath '/admin/vtsWaybill' startsWith 将详情页归入「整车运单」
      // 页签不单独开 tab，此处经 tabParentPath 等价承接
      tabParentPath: '/admin/vtsWaybill',
    },
  },
]
