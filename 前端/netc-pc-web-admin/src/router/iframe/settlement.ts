import { defineAsyncComponent } from 'vue'
import { ExtendedRouteRecordRaw } from '../types'

export const settlementRoutes: ExtendedRouteRecordRaw[] = [
  {
    name: 'online-settlement',
    path: '/admin/online-settlement',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-online-settlement' */ '@/views-iframe/settlement/online-settlement.vue')
    ),
  },
]
