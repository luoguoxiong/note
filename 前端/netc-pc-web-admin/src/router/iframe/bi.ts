import { defineAsyncComponent } from 'vue'
import { ExtendedRouteRecordRaw } from '../types'

export const biRoutes: ExtendedRouteRecordRaw[] = [
  {
    name: 'bi-analytics',
    path: '/admin/bi-analytics',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-bi-analytics' */ '@/views-iframe/bi/analytics.vue')
    ),
    meta: { auth: 'M3011' },
  },
  {
    name: 'smart-screen',
    path: '/admin/smart-screen',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-smart-screen' */ '@/views-iframe/bi/smart-screen.vue')
    ),
    meta: { auth: 'M3851' },
  },
  {
    name: 'bi-totals',
    path: '/admin/bi-totals',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-bi-totals' */ '@/views-iframe/bi/totals.vue')
    ),
    meta: { auth: 'M3831' },
  },
  {
    name: 'bi-detail',
    path: '/admin/bi-detail',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-bi-detail' */ '@/views-iframe/bi/detail.vue')
    ),
    meta: { auth: 'M3013' },
  },
]
