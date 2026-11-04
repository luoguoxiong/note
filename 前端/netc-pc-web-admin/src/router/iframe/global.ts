import { defineAsyncComponent } from 'vue'
import { ExtendedRouteRecordRaw } from '../types'

export const globalRoutes: ExtendedRouteRecordRaw[] = [
  {
    name: 'global-express',
    path: '/admin/global-express',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-global-express' */ '@/views-iframe/global/global-express.vue')
    ),
    meta: {
      // 国际寄件：需绑码 + 下单权限
      requireCustomerCode: true,
      requireOrderPermission: true,
    },
  },
  {
    name: 'global-waybill',
    path: '/admin/global-waybill',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-global-waybill' */ '@/views-iframe/global/global-waybill.vue')
    ),
    meta: {
      // 国际运单：需绑码(对齐老基座 routerGuard canToWaybillWithoutCumeCode 白名单)
      requireCustomerCode: true,
    },
  },
]
