import { defineAsyncComponent } from 'vue'
import { ExtendedRouteRecordRaw } from '../types'

export const settingRoutes: ExtendedRouteRecordRaw[] = [
  {
    name: 'print',
    path: '/admin/print',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-print' */ '@/views-iframe/setting/print.vue')
    ),
  },
]
