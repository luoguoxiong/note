import { defineAsyncComponent } from 'vue'
import { ExtendedRouteRecordRaw } from '../types'

export const orderUtilsRoutes: ExtendedRouteRecordRaw[] = [
  {
    name: 'address-book',
    path: '/admin/address',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-address' */ '@/views-iframe/order-utils/address.vue')
    ),
  },
  {
    name: 'review',
    path: '/admin/review',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-review' */ '@/views-iframe/order-utils/review.vue')
    ),
  },
  {
    name: 'batch-template',
    path: '/admin/batch-template',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-batch-template' */ '@/views-iframe/order-utils/batch-template.vue')
    ),
  },
]
