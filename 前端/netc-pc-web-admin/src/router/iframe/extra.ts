import { defineAsyncComponent } from 'vue'
import { ExtendedRouteRecordRaw } from '../types'

/**
 * 来源: netc-pc-web/src/router/micro/extra.js
 * （老文件中的 extra 通用外链路由 ?url=xxx 未迁移，仅迁 customerService 在线客服）
 */
export const extraRoutes: ExtendedRouteRecordRaw[] = [
  {
    name: 'customerService',
    path: '/admin/customerService',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-customerService' */ '@/views-iframe/extra/customerService.vue')
    ),
    meta: { pageCode: 'customerService', name: '在线客服' },
  },
]
