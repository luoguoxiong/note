import { defineAsyncComponent } from 'vue'
import { ExtendedRouteRecordRaw } from '../types'

export const markettingRoutes: ExtendedRouteRecordRaw[] = [
  {
    name: 'deposit-freight',
    path: '/admin/deposit-freight',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-deposit-freight' */ '@/views-iframe/marketting/deposit-freight.vue')
    ),
    meta: {
      // 预存运费：需绑码(对齐老基座 routerGuard canToWaybillWithoutCumeCode 白名单)
      requireCustomerCode: true,
    },
  },
  {
    name: 'points-center',
    path: '/admin/points-center',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-points-center' */ '@/views-iframe/marketting/points-center.vue')
    ),
  },
]
