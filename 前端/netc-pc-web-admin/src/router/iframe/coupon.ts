import { defineAsyncComponent } from 'vue'
import { ExtendedRouteRecordRaw } from '../types'

export const couponRoutes: ExtendedRouteRecordRaw[] = [
  {
    name: 'coupon',
    path: '/admin/coupon',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-online-coupon' */ '@/views-iframe/coupon/online-coupon.vue')
    ),
  },
]
