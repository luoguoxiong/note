import { defineAsyncComponent } from 'vue'
import { ExtendedRouteRecordRaw } from '../types'

export const waybillRoutes: ExtendedRouteRecordRaw[] = [
  {
    name: 'waybill-v3',
    path: '/admin/waybill-v3',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-waybill-v3' */ '@/views-iframe/waybill/index.vue')
    ),
    // keepAlive: 关闭页签时不销毁 iframe（仅 display:none 隐藏），再次打开不重载
    meta: { preload: true, keepAlive: true },
  },
  {
    name: 'waybill-material',
    path: '/admin/waybill-material',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-waybill-material' */ '@/views-iframe/waybill/waybill-material.vue')
    ),
    meta: { name: '查看运单资料', auth: 'M3060' },
  },
  {
    name: 'other-waybill-v3',
    path: '/admin/other-waybill-v3',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-other-waybill-v3' */ '@/views-iframe/waybill/other-waybill-v3.vue')
    ),
    // 页签标题（tabs 组件优先取 meta.name）
    meta: { name: '查看他人运单', auth: 'M3060' },
  },
]
